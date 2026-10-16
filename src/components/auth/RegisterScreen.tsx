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

type TouchedFields = {
	name: boolean;
	email: boolean;
	password: boolean;
};

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
			<Pressable onPress={onPress} hitSlop={8}>
				<Text style={styles.link}>{action}</Text>
			</Pressable>
		</View>
	);
}

export default function RegisterScreen() {
	const auth = React.useContext(AuthContext);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [agreed, setAgreed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [authError, setAuthError] = useState("");

	const [touched, setTouched] = useState<TouchedFields>({
		name: false,
		email: false,
		password: false,
	});

	const trimmedName = name.trim();
	const trimmedEmail = email.trim();

	const nameError = !trimmedName ? "Nama panggilan wajib diisi." : "";

	const emailError = !trimmedEmail
		? "Email wajib diisi."
		: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
			? "Masukkan alamat email yang valid."
			: "";

	const passwordError = !password
		? "Kata sandi wajib diisi."
		: password.length < 8
			? "Kata sandi minimal 8 karakter."
			: "";

	function updateTouched(field: keyof TouchedFields) {
		setTouched((previous) => ({
			...previous,
			[field]: true,
		}));
	}

	function handleNameChange(value: string) {
		setName(value);
		setAuthError("");
	}

	function handleEmailChange(value: string) {
		setEmail(value);
		setAuthError("");
	}

	function handlePasswordChange(value: string) {
		setPassword(value);
		setAuthError("");
	}

	function handleAgreementToggle() {
		setAgreed((previous) => !previous);
		setAuthError("");
	}

	async function handleRegister() {
		if (isLoading) return;

		setAuthError("");

		setTouched({
			name: true,
			email: true,
			password: true,
		});

		if (nameError || emailError || passwordError) {
			setAuthError("Periksa kembali nama, email, dan kata sandi kamu.");
			return;
		}

		if (!agreed) {
			setAuthError(
				"Kamu harus menyetujui Ketentuan Layanan dan Kebijakan Privasi.",
			);
			return;
		}

		if (!auth) {
			setAuthError(
				"Layanan autentikasi tidak tersedia. Coba buka ulang aplikasi.",
			);
			return;
		}

		setIsLoading(true);

		try {
			await auth.register(trimmedEmail, password, trimmedName, agreed);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "";

			setAuthError(message || "Registrasi gagal. Coba lagi.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<AuthLayout>
			<Brand />

			<View style={styles.registerHeader}>
				<Text style={styles.title}>Buat Akun Baru</Text>
				<Text style={styles.subtitle}>
					Mulai perjalanan latihan bicara dan pengenalan audio.
				</Text>
			</View>

			<View style={styles.registerForm}>
				<View style={styles.field}>
					<AuthInput
						label="Nama Panggilan"
						placeholder="Nama Anda (misal: Rian)"
						value={name}
						onChangeText={handleNameChange}
						onBlur={() => updateTouched("name")}
						autoCapitalize="words"
						autoComplete="name"
					/>

					{touched.name && !!nameError && (
						<Text style={styles.errorText}>{nameError}</Text>
					)}
				</View>

				<View style={styles.field}>
					<AuthInput
						label="Email"
						placeholder="contoh@email.com"
						value={email}
						onChangeText={handleEmailChange}
						onBlur={() => updateTouched("email")}
						keyboardType="email-address"
						autoCapitalize="none"
						autoComplete="email"
					/>

					{touched.email && !!emailError && (
						<Text style={styles.errorText}>{emailError}</Text>
					)}
				</View>

				<View style={styles.field}>
					<AuthInput
						label="Kata Sandi"
						placeholder="Buat kata sandi"
						value={password}
						onChangeText={handlePasswordChange}
						onBlur={() => updateTouched("password")}
						password
						autoComplete="new-password"
						autoCapitalize="none"
					/>

					{touched.password && !!passwordError ? (
						<Text style={styles.errorText}>{passwordError}</Text>
					) : (
						<Text style={styles.passwordHint}>Minimal 8 karakter</Text>
					)}
				</View>

				<Pressable
					onPress={handleAgreementToggle}
					accessibilityRole="checkbox"
					accessibilityLabel="Setujui Ketentuan Layanan dan Kebijakan Privasi"
					accessibilityState={{ checked: agreed }}
					style={({ pressed }) => [
						styles.termsCard,
						pressed && styles.termsCardPressed,
					]}
				>
					<View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
						{agreed && <Text style={styles.checkmark}>✓</Text>}
					</View>

					<Text style={styles.termsText}>
						Saya menyetujui{" "}
						<Text style={styles.termsLink}>Ketentuan Layanan</Text>
						{" dan "}
						<Text style={styles.termsLink}>Kebijakan Privasi</Text>
						{" data audio HearAble."}
					</Text>
				</Pressable>

				{!agreed && (
					<Text style={styles.termsHint}>
						Setujui ketentuan untuk melanjutkan.
					</Text>
				)}

				{!!authError && <Text style={styles.authError}>{authError}</Text>}

				<AuthButton
					title="Buat Akun"
					onPress={handleRegister}
					loading={isLoading}
					disabled={isLoading}
				/>
			</View>

			<FooterLink
				text="Sudah punya akun?"
				action="Masuk"
				onPress={() => router.replace("/(auth)/login")}
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
	registerHeader: {
		marginTop: 18,
		marginBottom: 28,
		gap: 10,
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
	registerForm: {
		gap: 16,
	},
	field: {
		gap: 6,
	},
	passwordHint: {
		fontSize: 12,
		color: Colors.textSecondary,
		paddingHorizontal: 4,
	},
	errorText: {
		fontSize: 12,
		lineHeight: 18,
		color: Colors.error,
		paddingHorizontal: 4,
	},
	termsCard: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
		padding: 12,
		borderRadius: 16,
		backgroundColor: Colors.surface,
	},
	termsCardPressed: {
		opacity: 0.8,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 7,
		borderWidth: 1,
		borderColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	checkboxChecked: {
		backgroundColor: Colors.primary,
	},
	checkmark: {
		color: "#FFFFFF",
		fontWeight: "700",
	},
	termsText: {
		flex: 1,
		fontSize: 14,
		lineHeight: 20,
		color: Colors.textSecondary,
	},
	termsLink: {
		fontWeight: "700",
		color: Colors.success,
	},
	termsHint: {
		fontSize: 12,
		color: Colors.textSecondary,
		paddingHorizontal: 4,
		marginTop: -10,
	},
	authError: {
		fontSize: 14,
		lineHeight: 20,
		color: Colors.error,
		textAlign: "center",
		paddingVertical: 8,
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
	link: {
		fontSize: 14,
		fontWeight: "600",
		color: Colors.primary,
	},
});
