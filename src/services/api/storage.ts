/** @format */

import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_NAME_KEY = "user_name";

export const storage = {
	async getAccessToken(): Promise<string | null> {
		return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
	},

	async setAccessToken(token: string): Promise<void> {
		await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
	},

	async getRefreshToken(): Promise<string | null> {
		return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
	},

	async setRefreshToken(token: string): Promise<void> {
		await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
	},

	async setTokens(accessToken: string, refreshToken: string): Promise<void> {
		await Promise.all([
			SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
			SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
		]);
	},

	async getUserName(): Promise<string | null> {
		return SecureStore.getItemAsync(USER_NAME_KEY);
	},

	async setUserName(name: string): Promise<void> {
		await SecureStore.setItemAsync(USER_NAME_KEY, name);
	},

	async clearTokens(): Promise<void> {
		await Promise.all([
			SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
			SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
			SecureStore.deleteItemAsync(USER_NAME_KEY),
		]);
	},
};
