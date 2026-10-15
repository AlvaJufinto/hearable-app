/** @format */

import React, { useState } from "react";

import { router } from "expo-router";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";

import Brand from "@/components/ui/Brand";
import Text from "@/components/ui/Text";
import { Colors } from "@/constant/theme";
import { AuthContext } from "@/contexts/AuthContext";

import AuthButton from "./AuthButton";
import AuthInput from "./AuthInput";

function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<KeyboardAvoidingView
			style={styles.screen}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{children}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

function FooterLink({
	text,
	action,
	onPress,
}: {
	text: string;
	action: string;
	onPress: () => void;
}) {
	return (
		<View style={styles.footer}>
			<Text style={styles.footerText}>{text} </Text>
			<Pressable onPress={onPress}>
				<Text style={styles.link}>{action}</Text>
			</Pressable>
		</View>
	);
}

export default function LoginScreen() {
	const auth = React.useContext(AuthContext);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [authError, setAuthError] = useState("");

	const [touched, setTouched] = useState({
		email: false,
		password: false,
	});

	const trimmedEmail = email.trim();

	const emailError = !trimmedEmail
		? "Email wajib diisi."
		: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
			? "Masukkan alamat email yang valid."
			: "";

	const passwordError = !password ? "Kata sandi wajib diisi." : "";

	const isFormValid = !emailError && !passwordError;

	const isEmailErrorVisible = touched.email && !!emailError;
	const isPasswordErrorVisible = touched.password && !!passwordError;

	async function handleLogin() {
		if (!isFormValid || isLoading || !auth) return;

		setIsLoading(true);
		setAuthError("");

		try {
			await auth.login(trimmedEmail, password);
		} catch (err: unknown) {
			const msg = (err as { message?: string })?.message;
			setAuthError(msg ?? "Login gagal. Periksa email dan kata sandi.");
			setIsLoading(false);
		}
	}

	function handleForgotPassword() {
		// TODO: Hubungkan ke alur reset password.
	}

	return (
		<AuthLayout>
			<Brand />

			<View style={styles.loginHeader}>
				<Text style={styles.title}>Selamat datang kembali</Text>
				<Text style={styles.subtitle}>
					Masuk untuk melanjutkan latihan mandiri Anda.
				</Text>
			</View>

			<View style={styles.loginForm}>
				<View style={styles.field}>
					<AuthInput
						label="Email"
						placeholder="contoh@email.com"
						value={email}
						onChangeText={setEmail}
						onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
						keyboardType="email-address"
						autoCapitalize="none"
						autoComplete="email"
					/>

					{isEmailErrorVisible && (
						<Text style={styles.errorText}>{emailError}</Text>
					)}
				</View>
				<View style={styles.passwordGroup}>
					<View style={styles.passwordLabel}>
						<Text style={styles.label}>Kata Sandi</Text>
						<Pressable onPress={handleForgotPassword}>
							<Text style={styles.link}>Lupa kata sandi?</Text>
						</Pressable>
					</View>

					<AuthInput
						label=""
						placeholder="Masukkan kata sandi"
						value={password}
						onChangeText={setPassword}
						onBlur={() =>
							setTouched((prev) => ({
								...prev,
								password: true,
							}))
						}
						password
						autoComplete="current-password"
						autoCapitalize="none"
					/>

					{isPasswordErrorVisible && (
						<Text style={styles.errorText}>{passwordError}</Text>
					)}
				</View>

				{authError ? <Text style={styles.authError}>{authError}</Text> : null}

				<View
					style={!isFormValid || isLoading ? styles.disabledButton : undefined}
				>
					<AuthButton
						title="Masuk"
						onPress={handleLogin}
						loading={isLoading}
						disabled={!isFormValid}
					/>
				</View>
			</View>

			<FooterLink
				text="Belum punya akun?"
				action="Daftar sekarang"
				onPress={() => router.push("/(auth)/register")}
			/>
		</AuthLayout>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingTop: 52,
		paddingBottom: 32,
	},
	loginHeader: {
		marginTop: 10,
		marginBottom: 28,
		gap: 8,
	},
	title: {
		fontSize: 28,
		lineHeight: 36,
		fontWeight: "700",
		letterSpacing: -0.7,
		color: Colors.text,
	},
	subtitle: {
		fontSize: 16,
		lineHeight: 24,
		color: Colors.textSecondary,
	},
	loginForm: {
		gap: 20,
	},
	field: {
		gap: 6,
	},
	passwordGroup: {
		gap: 2,
	},
	passwordLabel: {
		minHeight: 24,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: Colors.text,
	},
	link: {
		fontSize: 14,
		fontWeight: "600",
		color: Colors.primary,
	},
	errorText: {
		fontSize: 12,
		lineHeight: 18,
		color: Colors.error,
		paddingHorizontal: 4,
	},
	authError: {
		fontSize: 14,
		color: Colors.error,
		textAlign: "center",
		paddingVertical: 8,
	},
	disabledButton: {
		opacity: 0.5,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		flexWrap: "wrap",
		marginTop: 28,
		paddingVertical: 12,
	},
	footerText: {
		fontSize: 14,
		color: Colors.textSecondary,
	},
});
