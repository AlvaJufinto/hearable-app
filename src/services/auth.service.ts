/** @format */

import { apiClient } from "./api/client";
import { storage } from "./api/storage";
import type { AuthResponse, User } from "@/types/api";

export const authService = {
	async register(email: string, password: string, name: string, agreedToTerms: boolean): Promise<AuthResponse> {
		const res = await apiClient.post<AuthResponse>(
			"/v1/auth/register",
			{ email, password, name, accept_terms: agreedToTerms },
			false
		);
		await Promise.all([
		storage.setTokens(res.access_token, res.refresh_token),
			storage.setUserName(res.user.name),
		]);
		return res;
	},

	async login(email: string, password: string): Promise<AuthResponse> {
		const res = await apiClient.post<AuthResponse>(
			"/v1/auth/login",
			{ email, password },
			false
		);
		await Promise.all([
		storage.setTokens(res.access_token, res.refresh_token),
			storage.setUserName(res.user.name),
		]);
		return res;
	},

	async logout(): Promise<void> {
		try {
			const refreshToken = await storage.getRefreshToken();
			if (refreshToken) {
				await apiClient.post("/v1/auth/logout", { refreshToken }, true);
			}
		} finally {
			await storage.clearTokens();
		}
	},

	async getMe(): Promise<User> {
		return apiClient.get<User>("/v1/me", true);
	},

	async isAuthenticated(): Promise<boolean> {
		const token = await storage.getAccessToken();
		return !!token;
	},

	async getCachedUserName(): Promise<string | null> {
		return storage.getUserName();
	},
};
