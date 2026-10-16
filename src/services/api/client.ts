/** @format */

import type { ApiErrorResponse } from "@/types/api";

import { authErrorEmitter } from "../authErrorEmitter";
import { storage } from "./storage";

const BASE_URL = "https://api.hearable.nighttealabs.tech";

const NETWORK_LOG_ENABLED = __DEV__;

type RefreshError = {
	code: string;
	message: string;
	status?: number;
};

let refreshPromise: Promise<string> | null = null;

function logRequest(method: string, url: string, body?: unknown) {
	if (!NETWORK_LOG_ENABLED) return;

	console.log(`\n[NETWORK] --> ${method.toUpperCase()} ${url}`);

	if (body !== undefined && body !== null) {
		console.log("[NETWORK] Request Body:", body);
	}
}

async function logResponse(res: Response) {
	if (!NETWORK_LOG_ENABLED) return;

	console.log(`[NETWORK] <-- ${res.status} ${res.url}`);

	try {
		const body = await res.clone().json();
		console.log("[NETWORK] Response Body:", body);
	} catch {
		console.log("[NETWORK] Response Body: (empty or non-JSON)");
	}
}

function logError(url: string, error: unknown) {
	if (!NETWORK_LOG_ENABLED) return;

	console.error(`[NETWORK] ERROR ${url}`, error);
}

async function fetchWithLogging(
	url: string,
	init: RequestInit,
	loggedBody?: unknown,
): Promise<Response> {
	logRequest(init.method ?? "GET", url, loggedBody);

	try {
		const res = await fetch(url, init);
		await logResponse(res);
		return res;
	} catch (error) {
		logError(url, error);
		throw error;
	}
}

async function getAccessToken(): Promise<string | null> {
	return storage.getAccessToken();
}

async function parseError(
	res: Response,
): Promise<{ code: string; message: string }> {
	try {
		const body: ApiErrorResponse = await res.json();

		return {
			code: body.error.code,
			message: body.error.message,
		};
	} catch {
		return {
			code: "HTTP_ERROR",
			message: res.statusText || `HTTP ${res.status}`,
		};
	}
}

function isRefreshError(error: unknown): error is RefreshError {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		typeof error.code === "string"
	);
}

function emitUnauthorized() {
	authErrorEmitter.emit({
		code: "UNAUTHORIZED",
		message: "Session expired, please log in again",
	});
}

async function doRefresh(): Promise<string> {
	const refreshToken = await storage.getRefreshToken();

	if (!refreshToken) {
		await storage.clearTokens();

		throw {
			code: "REFRESH_TOKEN_MISSING",
			message: "No refresh token available",
		} satisfies RefreshError;
	}

	const url = `${BASE_URL}/v1/auth/refresh`;

	let res: Response;

	try {
		res = await fetchWithLogging(
			url,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ refreshToken }),
			},
			"[REDACTED: refresh token]",
		);
	} catch (error) {
		throw {
			code: "REFRESH_NETWORK_ERROR",
			message:
				error instanceof Error
					? error.message
					: "Network error while refreshing token",
		} satisfies RefreshError;
	}

	if (!res.ok) {
		const status = res.status;

		if (status === 401 || status === 403) {
			await storage.clearTokens();

			throw {
				code: "REFRESH_TOKEN_INVALID",
				message: "Refresh token is invalid or expired",
				status,
			} satisfies RefreshError;
		}

		throw {
			code: status === 502 ? "REFRESH_SERVER_ERROR" : "REFRESH_FAILED",
			message: `Token refresh failed with HTTP ${status}`,
			status,
		} satisfies RefreshError;
	}

	let data: {
		access_token: string;
		refresh_token?: string;
	};

	try {
		data = await res.json();
	} catch {
		throw {
			code: "REFRESH_INVALID_RESPONSE",
			message: "Refresh endpoint returned invalid JSON",
			status: res.status,
		} satisfies RefreshError;
	}

	if (typeof data.access_token !== "string" || data.access_token.length === 0) {
		throw {
			code: "REFRESH_INVALID_RESPONSE",
			message: "Refresh endpoint did not return a valid access token",
			status: res.status,
		} satisfies RefreshError;
	}

	await storage.setTokens(
		data.access_token,
		data.refresh_token ?? refreshToken,
	);

	return data.access_token;
}

async function getRefreshedAccessToken(): Promise<string> {
	if (!refreshPromise) {
		refreshPromise = doRefresh().finally(() => {
			refreshPromise = null;
		});
	}

	return refreshPromise;
}

async function ensureValidToken(): Promise<string> {
	const token = await getAccessToken();

	if (token) return token;

	try {
		return await getRefreshedAccessToken();
	} catch (error) {
		if (
			isRefreshError(error) &&
			(error.code === "REFRESH_TOKEN_MISSING" ||
				error.code === "REFRESH_TOKEN_INVALID")
		) {
			emitUnauthorized();
		}

		throw error;
	}
}

async function handleRefreshFailure(error: unknown): Promise<never> {
	if (
		isRefreshError(error) &&
		(error.code === "REFRESH_TOKEN_MISSING" ||
			error.code === "REFRESH_TOKEN_INVALID")
	) {
		emitUnauthorized();

		throw {
			code: "UNAUTHORIZED",
			message: "Session expired, please log in again",
		};
	}

	throw error;
}

interface RequestOptions extends RequestInit {
	path: string;
	requireAuth?: boolean;
}

async function parseSuccessfulResponse<T>(res: Response): Promise<T> {
	if (res.status === 204) return undefined as T;

	try {
		return (await res.json()) as T;
	} catch {
		throw {
			code: "PARSE_ERROR",
			message: "Invalid JSON response from server",
		};
	}
}

export async function apiRequest<T>({
	path,
	requireAuth = false,
	...init
}: RequestOptions): Promise<T> {
	const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...((init.headers as Record<string, string>) || {}),
	};

	if (requireAuth) {
		const token = await ensureValidToken();
		headers["Authorization"] = `Bearer ${token}`;
	}

	const res = await fetchWithLogging(url, { ...init, headers }, init.body);

	if (res.status === 401 && requireAuth) {
		try {
			const newToken = await getRefreshedAccessToken();

			headers["Authorization"] = `Bearer ${newToken}`;

			const retry = await fetchWithLogging(
				url,
				{ ...init, headers },
				init.body,
			);

			if (retry.status === 401) {
				await storage.clearTokens();
				emitUnauthorized();

				throw {
					code: "UNAUTHORIZED",
					message: "Session expired after token refresh",
				};
			}

			if (!retry.ok) {
				throw await parseError(retry);
			}

			return parseSuccessfulResponse<T>(retry);
		} catch (error) {
			return handleRefreshFailure(error);
		}
	}

	if (!res.ok) {
		throw await parseError(res);
	}

	return parseSuccessfulResponse<T>(res);
}

export async function apiRequestFormData<T>(
	path: string,
	body: FormData,
	requireAuth: boolean,
): Promise<T> {
	const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

	const headers: Record<string, string> = {};

	if (requireAuth) {
		const token = await ensureValidToken();
		headers["Authorization"] = `Bearer ${token}`;
	}

	const res = await fetchWithLogging(
		url,
		{
			method: "POST",
			headers,
			body,
		},
		"[FormData]",
	);

	if (res.status === 401 && requireAuth) {
		try {
			const newToken = await getRefreshedAccessToken();

			headers["Authorization"] = `Bearer ${newToken}`;

			const retry = await fetchWithLogging(
				url,
				{
					method: "POST",
					headers,
					body,
				},
				"[FormData retry]",
			);

			if (retry.status === 401) {
				await storage.clearTokens();
				emitUnauthorized();

				throw {
					code: "UNAUTHORIZED",
					message: "Session expired after token refresh",
				};
			}

			if (!retry.ok) {
				throw await parseError(retry);
			}

			return parseSuccessfulResponse<T>(retry);
		} catch (error) {
			return handleRefreshFailure(error);
		}
	}

	if (!res.ok) {
		throw await parseError(res);
	}

	return parseSuccessfulResponse<T>(res);
}

export async function refreshAccessToken(): Promise<boolean> {
	try {
		await getRefreshedAccessToken();
		return true;
	} catch (error) {
		if (
			isRefreshError(error) &&
			(error.code === "REFRESH_TOKEN_MISSING" ||
				error.code === "REFRESH_TOKEN_INVALID")
		) {
			emitUnauthorized();
		}

		if (NETWORK_LOG_ENABLED) {
			console.error("[Auth] Unable to refresh access token:", error);
		}

		return false;
	}
}

export const apiClient = {
	get: <T>(path: string, requireAuth?: boolean) =>
		apiRequest<T>({
			path,
			method: "GET",
			requireAuth,
		}),

	post: <T>(path: string, body: unknown, requireAuth?: boolean) =>
		apiRequest<T>({
			path,
			method: "POST",
			body: JSON.stringify(body),
			requireAuth,
		}),

	patch: <T>(path: string, body: unknown, requireAuth?: boolean) =>
		apiRequest<T>({
			path,
			method: "PATCH",
			body: JSON.stringify(body),
			requireAuth,
		}),

	delete: <T>(path: string, requireAuth?: boolean) =>
		apiRequest<T>({
			path,
			method: "DELETE",
			requireAuth,
		}),

	postFormData: <T>(path: string, formData: FormData, requireAuth?: boolean) =>
		apiRequestFormData<T>(path, formData, requireAuth ?? false),
};
