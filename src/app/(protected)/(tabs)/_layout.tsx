/** @format */

import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

import { Colors, FontSize } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: Colors.primary,
				tabBarInactiveTintColor: Colors.textSecondary,
				tabBarStyle: {
					backgroundColor: Colors.surface,
					borderTopColor: Colors.border,
					borderTopWidth: StyleSheet.hairlineWidth,
					height: 78,
					paddingTop: 8,
					paddingBottom: 8,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.05,
					shadowRadius: 8,
				},
				tabBarLabelStyle: {
					fontSize: FontSize.xs,
					fontWeight: "600",
					marginTop: 4,
				},
				tabBarIconStyle: {
					marginBottom: 0,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Beranda",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "home" : "home-outline"}
							size={24}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="practice"
				options={{
					title: "Latihan",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "ear" : "ear-outline"}
							size={24}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="progress"
				options={{
					title: "Progress",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "stats-chart" : "stats-chart-outline"}
							size={24}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					title: "Profil",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "person" : "person-outline"}
							size={24}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
