/** @format */

import React, { createContext, useCallback, useEffect, useState } from "react";

import { useRouter } from "expo-router";

import { refreshAccessToken } from "@/services/api/client";
import { authService } from "@/services/auth.service";
import { authErrorEmitter } from "@/services/authErrorEmitter";
import type { User } from "@/types/api";

type AuthState = {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
};

type AuthContextValue = AuthState & {
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		name: string,
		agreedToTerms: boolean,
	) => Promise<void>;
	logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [state, setState] = useState<AuthState>({
		isAuthenticated: false,
		isLoading: true,
		user: null,
	});

	useEffect(() => {
		(async () => {
			const isAuth = await authService.isAuthenticated();
			if (isAuth) {
				const refreshed = await refreshAccessToken();
				if (refreshed) {
					try {
						const user = await authService.getMe();
						setState({ isAuthenticated: true, isLoading: false, user });
						return;
					} catch {
						// getMe failed even after refresh - will fall through to logout
					}
				}
				setState({ isAuthenticated: false, isLoading: false, user: null });
			} else {
				setState({ isAuthenticated: false, isLoading: false, user: null });
			}
		})();
	}, []);

	useEffect(() => {
		const unsubscribe = authErrorEmitter.subscribe((error) => {
			if (error.code === "UNAUTHORIZED") {
				setState({ isAuthenticated: false, isLoading: false, user: null });
				router.replace("/onboarding/welcome");
			}
		});
		return unsubscribe;
	}, [router]);

	const login = useCallback(
		async (email: string, password: string) => {
			const res = await authService.login(email, password);
			console.log("🚀 ~ AuthProvider ~ res:", res);
			setState({ isAuthenticated: true, isLoading: false, user: res.user });
			router.replace("/(tabs)");
		},
		[router],
	);

	const register = useCallback(
		async (
			email: string,
			password: string,
			name: string,
			agreedToTerms: boolean,
		) => {
			const res = await authService.register(
				email,
				password,
				name,
				agreedToTerms,
			);
			setState({ isAuthenticated: true, isLoading: false, user: res.user });
			router.replace("/(tabs)");
		},
		[router],
	);

	const logout = useCallback(async () => {
		await authService.logout();
		setState({ isAuthenticated: false, isLoading: false, user: null });
		router.replace("/welcome");
	}, [router]);

	return (
		<AuthContext.Provider value={{ ...state, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
