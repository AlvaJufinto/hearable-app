/** @format */

import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import Text from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { AuthContext } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";

type ProfileState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "authenticated"; name: string; email: string }
	| { status: "error" };

function ProfileCard({ name, email }: { name: string; email: string }) {
	const initial = name.charAt(0).toUpperCase();

	return (
		<View style={styles.profileCard}>
			<View style={styles.avatar}>
				<Text style={styles.avatarText}>{initial}</Text>
			</View>
			<View style={styles.profileInfo}>
				<Text style={styles.profileName}>{name}</Text>
				<Text style={styles.profileEmail}>{email}</Text>
			</View>
		</View>
	);
}

export default function ProfileScreen() {
	const auth = React.useContext(AuthContext);
	const [state, setState] = useState<ProfileState>({ status: "idle" });
	const didLoadRef = useRef(false);

	useEffect(() => {
		if (didLoadRef.current) return;
		didLoadRef.current = true;

		setState({ status: "loading" });

		(async () => {
			try {
				const isAuth = await authService.isAuthenticated();
				if (!isAuth) {
					setState({ status: "error" });
					return;
				}
				const user = await authService.getMe();
				setState({ status: "authenticated", name: user.name, email: user.email });
			} catch {
				setState({ status: "error" });
			}
		})();
	}, []);

	if (state.status === "idle" || state.status === "loading") {
		return (
			<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
				<View style={styles.loadingState}>
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			</SafeAreaView>
		);
	}

	if (state.status === "error") {
		return (
			<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
				<View style={styles.container}>
					<Text style={styles.title}>Profil</Text>
					<View style={styles.errorCard}>
						<Ionicons name="alert-circle" size={32} color={Colors.error} />
						<Text style={styles.errorText}>Tidak dapat memuat profil.</Text>
						<TouchableOpacity
							style={styles.retryButton}
							activeOpacity={0.8}
							onPress={() => router.push("/(auth)/login")}
						>
							<Text style={styles.retryButtonText}>Masuk</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	const { name, email } = state;

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<View style={styles.container}>
				<Text style={styles.title}>Profil</Text>

				<ProfileCard name={name} email={email} />

				<View style={styles.menuSection}>
					<Text style={styles.menuLabel}>Akun</Text>

					<View style={styles.menuCard}>
						<View style={styles.menuItem}>
							<Ionicons name="person-outline" size={20} color={Colors.primary} />
							<Text style={styles.menuItemText}>Nama</Text>
							<Text style={styles.menuItemValue}>{name}</Text>
						</View>
						<View style={styles.menuDivider} />
						<View style={styles.menuItem}>
							<Ionicons name="mail-outline" size={20} color={Colors.primary} />
							<Text style={styles.menuItemText}>Email</Text>
							<Text style={styles.menuItemValue}>{email}</Text>
						</View>
					</View>
				</View>

				<View style={styles.menuSection}>
					<Text style={styles.menuLabel}>Tentang</Text>

					<View style={styles.menuCard}>
						<View style={styles.menuItem}>
							<Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
							<Text style={styles.menuItemText}>Versi Aplikasi</Text>
							<Text style={styles.menuItemValue}>1.0.0</Text>
						</View>
					</View>
				</View>

				<TouchableOpacity
					style={styles.logoutButton}
					activeOpacity={0.8}
					onPress={async () => {
						if (auth) await auth.logout();
					}}
				>
					<Ionicons name="log-out-outline" size={18} color={Colors.error} />
					<Text style={styles.logoutButtonText}>Keluar</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: Colors.background },
	container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
	loadingState: { flex: 1, alignItems: "center", justifyContent: "center" },
	title: {
		fontSize: FontSize.xl,
		fontWeight: "800",
		color: Colors.text,
		marginBottom: Spacing.lg,
	},
	profileCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.lg,
		marginBottom: Spacing.xl,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: Radius.full,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: {
		fontSize: FontSize.xl,
		fontWeight: "700",
		color: Colors.textOnPrimary,
	},
	profileInfo: { flex: 1 },
	profileName: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: 2,
	},
	profileEmail: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	menuSection: { marginBottom: Spacing.lg },
	menuLabel: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: Colors.textSecondary,
		letterSpacing: 0.5,
		marginBottom: Spacing.sm,
		marginLeft: Spacing.xs,
	},
	menuCard: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		borderWidth: 1,
		borderColor: Colors.border,
		overflow: "hidden",
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		padding: Spacing.md,
	},
	menuItemText: {
		fontSize: FontSize.md,
		color: Colors.text,
		flex: 1,
	},
	menuItemValue: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	menuDivider: {
		height: 1,
		backgroundColor: Colors.border,
		marginLeft: Spacing.xl + Spacing.md,
	},
	errorCard: {
		alignItems: "center",
		gap: Spacing.md,
		paddingVertical: Spacing.xxl,
	},
	errorText: {
		fontSize: FontSize.md,
		color: Colors.error,
	},
	retryButton: {
		backgroundColor: Colors.primary,
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.sm,
		borderRadius: Radius.md,
	},
	retryButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.textOnPrimary,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm,
		paddingVertical: Spacing.md,
		borderRadius: Radius.md,
		borderWidth: 1.5,
		borderColor: Colors.error,
		marginTop: "auto",
		marginBottom: Spacing.lg,
	},
	logoutButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.error,
	},
});
