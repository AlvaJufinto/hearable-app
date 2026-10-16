/** @format */

import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Text from "@/components/ui/Text";
import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";

const modules = [
	{
		icon: "mic-outline" as const,
		iconColor: Colors.primary,
		iconBg: Colors.primary + "20",
		tag: "Visual & Ritmis",
		title: "Latihan Bicara",
		description:
			"Latih pelafalan kata dan kalimat yang akan dievaluasi oleh aplikasi kami",
	},
	{
		icon: "headset-outline" as const,
		iconColor: "#4A3F10",
		iconBg: "#FCE596",
		tag: "Dengar & Tebak",
		title: "Kenali Suara Sekitar",
		description: "Dengarkan dan identifikasi audio kalimat",
	},
];

export default function Step2Screen() {
	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<View style={styles.container}>
				<View style={styles.topRow}>
					<View style={styles.stepIndicator}>
						<Text style={styles.stepText}>Langkah 2 dari 3</Text>
						<View style={styles.progressBar}>
							<View style={[styles.progressFill, { width: "66%" }]} />
						</View>
					</View>

					<TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
						<Text style={styles.skipText}>Lewati</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.content}>
					<Text style={styles.title}>Pilih Latihan yang Tepat</Text>

					<Text style={styles.description}>
						Dua fokus modul utama yang saling{"\n"}
						melengkapi untuk mengasah kemampuan{"\n"}
						komunikasimu setiap hari.
					</Text>

					<View style={styles.cards}>
						{modules.map((m) => (
							<View key={m.title} style={styles.card}>
								<View style={styles.cardHeader}>
									<View
										style={[styles.iconWrap, { backgroundColor: m.iconBg }]}
									>
										<Ionicons name={m.icon} size={28} color={m.iconColor} />
									</View>

									<View style={styles.cardHeaderContent}>
										<Text style={styles.cardTitle}>{m.title}</Text>

										<View
											style={[styles.tagBadge, { backgroundColor: m.iconBg }]}
										>
											<Text style={[styles.tagText, { color: m.iconColor }]}>
												{m.tag}
											</Text>
										</View>
									</View>

									<View style={styles.cardArrow}>
										<Ionicons
											name="chevron-forward"
											size={20}
											color={Colors.textSecondary}
										/>
									</View>
								</View>

								<Text style={styles.cardDesc}>{m.description}</Text>
							</View>
						))}
					</View>
				</View>

				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.primaryButton}
						activeOpacity={0.8}
						onPress={() => router.push("/onboarding/step-3")}
					>
						<Text style={styles.primaryButtonText}>Lanjut</Text>
						<Ionicons
							name="arrow-forward"
							size={20}
							color={Colors.textOnPrimary}
						/>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	container: {
		flex: 1,
		paddingHorizontal: Spacing.lg,
	},
	topRow: {
		paddingTop: Spacing.lg,
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
	},
	stepIndicator: {
		flex: 1,
		marginBottom: Spacing.xl,
	},
	stepText: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginBottom: Spacing.sm,
	},
	progressBar: {
		height: 4,
		backgroundColor: Colors.border,
		borderRadius: Radius.full,
	},
	progressFill: {
		height: 4,
		backgroundColor: Colors.primary,
		borderRadius: Radius.full,
	},
	skipText: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		paddingTop: 2,
	},
	content: {
		flex: 1,
	},
	title: {
		fontSize: FontSize.xxl,
		fontWeight: "800",
		color: Colors.text,
		marginBottom: Spacing.sm,
	},
	description: {
		fontSize: FontSize.md,
		color: Colors.textSecondary,
		lineHeight: 24,
		marginBottom: Spacing.xl,
	},
	cards: {
		gap: Spacing.md,
	},
	card: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.lg,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		marginBottom: Spacing.md,
		paddingRight: Spacing.xl,
	},
	iconWrap: {
		width: 56,
		height: 56,
		borderRadius: Radius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	cardHeaderContent: {
		flex: 1,
		alignItems: "flex-start",
		gap: Spacing.xs,
	},
	cardTitle: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
	},
	tagBadge: {
		borderRadius: Radius.full,
		paddingHorizontal: Spacing.sm,
		paddingVertical: 4,
	},
	tagText: {
		fontSize: FontSize.xs,
		fontWeight: "500",
	},
	cardDesc: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		lineHeight: 20,
	},
	cardArrow: {
		position: "absolute",
		right: 0,
		top: "50%",
		transform: [{ translateY: -10 }],
	},
	actions: {
		paddingBottom: Spacing.xl,
	},
	primaryButton: {
		backgroundColor: Colors.primary,
		paddingVertical: Spacing.md,
		borderRadius: Radius.lg,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: Spacing.sm,
	},
	primaryButtonText: {
		color: Colors.textOnPrimary,
		fontSize: FontSize.md,
		fontWeight: "700",
	},
});
