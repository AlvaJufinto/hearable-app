/** @format */

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		"Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
		"Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
		"Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
		"Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
	});

	if (!fontsLoaded) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<AuthProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="(auth)" />
				<Stack.Screen name="(protected)" />
				<Stack.Screen name="onboarding" />
			</Stack>
		</AuthProvider>
	);
}
