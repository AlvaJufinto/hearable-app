/** @format */

import { useEffect } from "react";

import { Stack, useRouter } from "expo-router";

import { authService } from "@/services/auth.service";

export default function ProtectedLayout() {
	const router = useRouter();

	useEffect(() => {
		authService.isAuthenticated().then((isAuth) => {
			if (!isAuth) {
				router.replace("/onboarding/welcome");
			}
		});
	}, [router]);

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="speaking" />
			<Stack.Screen name="recognition" />
			<Stack.Screen name="completion" />
		</Stack>
	);
}
