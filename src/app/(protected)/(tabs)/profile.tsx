/** @format */

import React, { useEffect, useRef, useState } from "react";

import { router } from "expo-router";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Text from "@/components/ui/Text";
import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { AuthContext } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";

type ProfileState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "authenticated"; name: string; email: string }
	| { status: "error" };

function ProfileCard({ name, email }: { name: string; email: string }) {
	const initial = name.trim().charAt(0).toUpperCase() || "U";

	return (
		<View style={styles.profileCard}>
			<View style={styles.avatar}>
				<Text style={styles.avatarText}>{initial}</Text>
			</View>

			<View style={styles.profileInfo}>
				<Text style={styles.profileName} numberOfLines={2}>
					{name}
				</Text>
				<Text style={styles.profileEmail} numberOfLines={2}>
					{email}
				</Text>
			</View>

			<View style={styles.profileIcon}>
				<Ionicons
					name="person-circle-outline"
					size={21}
					color={Colors.primary}
				/>
			</View>
		</View>
	);
}

function SectionLabel({ children }: { children: string }) {
	return <Text style={styles.menuLabel}>{children}</Text>;
}

function MenuRow({
	icon,
	label,
	value,
}: {
	icon: React.ComponentProps<typeof Ionicons>["name"];
	label: string;
	value: string;
}) {
	return (
		<View style={styles.menuItem}>
			<View style={styles.menuItemIcon}>
				<Ionicons name={icon} size={20} color={Colors.primary} />
			</View>

			<Text style={styles.menuItemText}>{label}</Text>

			<Text style={styles.menuItemValue} numberOfLines={2}>
				{value}
			</Text>
		</View>
	);
}

function MenuCard({ children }: { children: React.ReactNode }) {
	return <View style={styles.menuCard}>{children}</View>;
}

function Divider() {
	return <View style={styles.menuDivider} />;
}

export default function ProfileScreen() {
	const auth = React.useContext(AuthContext);
	const [state, setState] = useState<ProfileState>({ status: "idle" });
	const [retryKey, setRetryKey] = useState(0);
	const didLoadRef = useRef(false);

	useEffect(() => {
		if (didLoadRef.current) return;
		didLoadRef.current = true;

		let isMounted = true;

		const loadProfile = async () => {
			setState({ status: "loading" });

			try {
				const isAuth = await authService.isAuthenticated();

				if (!isAuth) {
					if (isMounted) setState({ status: "error" });
					return;
				}

				const user = await authService.getMe();

				if (isMounted) {
					setState({
						status: "authenticated",
						name: user.name,
						email: user.email,
					});
				}
			} catch {
				if (isMounted) setState({ status: "error" });
			}
		};

		void loadProfile();

		return () => {
			isMounted = false;
		};
	}, [retryKey]);

	if (state.status === "idle" || state.status === "loading") {
		return (
			<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
				<View style={styles.loadingState}>
					<ActivityIndicator size="large" color={Colors.primary} />
					<Text style={styles.loadingText}>Memuat profil...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (state.status === "error") {
		return (
			<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
				<View style={styles.container}>
					<View style={styles.titleSection}>
						<Text style={styles.title}>Profil</Text>
						<Text style={styles.subtitle}>
							Informasi akun dan pengaturan aplikasi.
						</Text>
					</View>

					<View style={styles.errorCard}>
						<View style={styles.errorIcon}>
							<Ionicons
								name="alert-circle-outline"
								size={30}
								color={Colors.error}
							/>
						</View>

						<Text style={styles.errorTitle}>Profil tidak tersedia</Text>
						<Text style={styles.errorText}>
							Tidak dapat memuat informasi akun. Coba lagi atau masuk kembali.
						</Text>

						<TouchableOpacity
							style={styles.retryButton}
							activeOpacity={0.8}
							onPress={() => {
								router.push("/(auth)/login");
							}}
						>
							<Text style={styles.retryButtonText}>Masuk kembali</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.secondaryButton}
							activeOpacity={0.8}
							onPress={() => {
								didLoadRef.current = false;
								setRetryKey((key) => key + 1);
							}}
						>
							<Text style={styles.secondaryButtonText}>Coba lagi</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	const { name, email } = state;

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.titleSection}>
					<Text style={styles.title}>Profil</Text>
					<Text style={styles.subtitle}>
						Informasi akun dan pengaturan aplikasi.
					</Text>
				</View>

				<ProfileCard name={name} email={email} />

				<View style={styles.menuSection}>
					<SectionLabel>Akun</SectionLabel>

					<MenuCard>
						<MenuRow icon="person-outline" label="Nama" value={name} />
						<Divider />
						<MenuRow icon="mail-outline" label="Email" value={email} />
					</MenuCard>
				</View>

				{/*<View style={styles.menuSection}>
					<SectionLabel>Tentang aplikasi</SectionLabel>

					<MenuCard>
						<MenuRow
							icon="information-circle-outline"
							label="Versi aplikasi"
							value="1.0.0"
						/>
					</MenuCard>
				</View>*/}

				<TouchableOpacity
					style={styles.logoutButton}
					activeOpacity={0.75}
					onPress={async () => {
						if (auth) await auth.logout();
					}}
				>
					<Ionicons name="log-out-outline" size={20} color={Colors.error} />
					<Text style={styles.logoutButtonText}>Keluar dari akun</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scroll: {
		flex: 1,
	},
	container: {
		flexGrow: 1,
		paddingHorizontal: Spacing.lg,
		paddingTop: Spacing.lg,
		paddingBottom: Spacing.xl,
	},
	loadingState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.md,
	},
	loadingText: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	titleSection: {
		marginBottom: Spacing.xl,
	},
	title: {
		fontSize: FontSize.xxl,
		fontWeight: "800",
		color: Colors.text,
		marginBottom: Spacing.xs,
	},
	subtitle: {
		fontSize: FontSize.md,
		lineHeight: 22,
		color: Colors.textSecondary,
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
		width: 58,
		height: 58,
		borderRadius: Radius.full,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	avatarText: {
		fontSize: FontSize.xl,
		fontWeight: "700",
		color: Colors.textOnPrimary,
	},
	profileInfo: {
		flex: 1,
		minWidth: 0,
		gap: Spacing.xs,
	},
	profileName: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
	},
	profileEmail: {
		fontSize: FontSize.sm,
		lineHeight: 19,
		color: Colors.textSecondary,
	},
	profileIcon: {
		width: 36,
		height: 36,
		borderRadius: Radius.md,
		backgroundColor: Colors.secondary + "33",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	menuSection: {
		marginBottom: Spacing.lg,
	},
	menuLabel: {
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.text,
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
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.md,
		minHeight: 64,
	},
	menuItemIcon: {
		width: 38,
		height: 38,
		borderRadius: Radius.md,
		backgroundColor: Colors.secondary + "33",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	menuItemText: {
		flex: 1,
		minWidth: 0,
		fontSize: FontSize.md,
		color: Colors.text,
	},
	menuItemValue: {
		flexShrink: 1,
		maxWidth: "55%",
		fontSize: FontSize.sm,
		lineHeight: 19,
		color: Colors.textSecondary,
		textAlign: "right",
	},
	menuDivider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: Colors.border,
		marginLeft: Spacing.md + 38 + Spacing.md,
	},
	errorCard: {
		alignItems: "center",
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.xl,
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		borderWidth: 1,
		borderColor: Colors.border,
		gap: Spacing.md,
	},
	errorIcon: {
		width: 58,
		height: 58,
		borderRadius: Radius.lg,
		backgroundColor: Colors.error + "15",
		alignItems: "center",
		justifyContent: "center",
	},
	errorTitle: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
		textAlign: "center",
	},
	errorText: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		lineHeight: 21,
		textAlign: "center",
	},
	retryButton: {
		alignSelf: "stretch",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.primary,
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.md,
		borderRadius: Radius.md,
		marginTop: Spacing.xs,
	},
	retryButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.textOnPrimary,
	},
	secondaryButton: {
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.sm,
	},
	secondaryButtonText: {
		fontSize: FontSize.sm,
		fontWeight: "600",
		color: Colors.primary,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm,
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.lg,
		borderRadius: Radius.lg,
		borderWidth: 1,
		borderColor: Colors.error + "66",
		backgroundColor: Colors.surface,
		marginTop: Spacing.sm,
		marginBottom: Spacing.md,
	},
	logoutButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.error,
	},
});
