/** @format */

import { storage } from "./storage";
import type { ApiErrorResponse } from "@/types/api";

const BASE_URL = "https://api.hearable.nighttealabs.tech";

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];

async function getAccessToken(): Promise<string | null> {
	return storage.getAccessToken();
}

async function doRefresh(): Promise<string | null> {
	try {
		const refreshToken = await storage.getRefreshToken();
		if (!refreshToken) return null;

		const res = await fetch(`${BASE_URL}/v1/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});

		if (!res.ok) {
			await storage.clearTokens();
			return null;
		}

		const data = await res.json();
		await storage.setTokens(data.access_token, data.refresh_token);
		return data.accessToken;
	} catch {
		await storage.clearTokens();
		return null;
	}
}

async function ensureValidToken(): Promise<string | null> {
	const token = await getAccessToken();
	if (token) return token;

	if (isRefreshing) {
		return new Promise((resolve) => {
			refreshQueue.push(() => {
				getAccessToken().then(resolve);
			});
		});
	}

	isRefreshing = true;
	try {
		const newToken = await doRefresh();
		refreshQueue.forEach((cb) => cb());
		refreshQueue = [];
		return newToken;
	} finally {
		isRefreshing = false;
	}
}

async function parseError(res: Response): Promise<{ code: string; message: string }> {
	try {
		const body: ApiErrorResponse = await res.json();
		return { code: body.error.code, message: body.error.message };
	} catch {
		return { code: "UNKNOWN_ERROR", message: res.statusText };
	}
}

interface RequestOptions extends RequestInit {
	path: string;
	requireAuth?: boolean;
}

export async function apiRequest<T>({
	path,
	requireAuth = false,
	...init
}: RequestOptions): Promise<T> {
	const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(init.headers as Record<string, string> || {}),
	};

	if (requireAuth) {
		const token = await ensureValidToken();
		if (!token) {
			throw { code: "UNAUTHORIZED", message: "Not authenticated" };
		}
		headers["Authorization"] = `Bearer ${token}`;
	}

	const res = await fetch(url, { ...init, headers });

	if (res.status === 401 && requireAuth) {
		const newToken = await doRefresh();
		if (newToken) {
			headers["Authorization"] = `Bearer ${newToken}`;
			const retry = await fetch(url, { ...init, headers });
			if (retry.ok) return retry.json();
		}
	}

	if (!res.ok) {
		const err = await parseError(res);
		throw err;
	}

	if (res.status === 204) return undefined as T;
	return res.json() as Promise<T>;
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
		if (!token) {
			throw { code: "UNAUTHORIZED", message: "Not authenticated" };
		}
		headers["Authorization"] = `Bearer ${token}`;
	}

	const res = await fetch(url, { method: "POST", headers, body });

	if (res.status === 401 && requireAuth) {
		const newToken = await doRefresh();
		if (newToken) {
			headers["Authorization"] = `Bearer ${newToken}`;
			const retry = await fetch(url, { method: "POST", headers, body });
			if (retry.ok) return retry.json() as Promise<T>;
		}
	}

	if (!res.ok) {
		const err = await parseError(res);
		throw err;
	}

	return res.json() as Promise<T>;
}

export const apiClient = {
	get: <T>(path: string, requireAuth?: boolean) =>
		apiRequest<T>({ path, method: "GET", requireAuth }),

	post: <T>(path: string, body: unknown, requireAuth?: boolean) =>
		apiRequest<T>({ path, method: "POST", body: JSON.stringify(body), requireAuth }),

	patch: <T>(path: string, body: unknown, requireAuth?: boolean) =>
		apiRequest<T>({ path, method: "PATCH", body: JSON.stringify(body), requireAuth }),

	delete: <T>(path: string, requireAuth?: boolean) =>
		apiRequest<T>({ path, method: "DELETE", requireAuth }),

	postFormData: <T>(path: string, formData: FormData, requireAuth?: boolean) =>
		apiRequestFormData<T>(path, formData, requireAuth ?? false),
};
