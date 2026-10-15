/** @format */

import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";

const benefits = [
	{
		icon: "stats-chart-outline" as const,
		title: "Progres Nyata",
		description:
			"Pantau jumlah latihan yang kamu selesaikan setiap minggu sesuai waktu luangmu.",
	},
	{
		icon: "trophy-outline" as const,
		title: "Poin & Pencapaian",
		description:
			"Dapatkan apresiasi untuk setiap sesi yang tuntas, tanpa sistem peringkat yang kompetitif.",
	},
	{
		icon: "lock-closed-outline" as const,
		title: "Privasi & Kenyamanan",
		description:
			"Izin mikrofon hanya diminta saat kamu siap memulai sesi latihan.",
	},
];

export default function Step3Screen() {
	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<View style={styles.container}>
				<View style={styles.stepIndicator}>
					<View style={styles.stepTopRow}>
						<Text style={styles.stepText}>Langkah 3 dari 3</Text>
						<View style={styles.doneBadge}>
							<Text style={styles.doneText}>Selesai</Text>
						</View>
					</View>
					<View style={styles.progressBar}>
						<View style={[styles.progressFill, { width: "100%" }]} />
					</View>
				</View>

				<View style={styles.content}>
					<Text style={styles.title}>Setiap Langkah Berarti</Text>
					<Text style={styles.description}>
						Fokus pada konsistensi latihan harian{"\n"}tanpa target medis yang
						membebani.
					</Text>

					<View style={styles.cards}>
						{benefits.map((b, i) => (
							<View key={i} style={styles.card}>
								<View style={styles.cardLeft}>
									<View style={styles.iconWrap}>
										<Ionicons name={b.icon} size={22} color={Colors.primary} />
									</View>
								</View>
								<View style={styles.cardBody}>
									<Text style={styles.cardTitle}>{b.title}</Text>
									<Text style={styles.cardDesc}>{b.description}</Text>
								</View>
							</View>
						))}
					</View>
				</View>

				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.primaryButton}
						activeOpacity={0.8}
						onPress={() => router.replace("/(tabs)")}
					>
						<Text style={styles.primaryButtonText}>Mulai Belajar</Text>
						<Ionicons
							name="arrow-forward"
							size={20}
							color={Colors.textOnPrimary}
						/>
					</TouchableOpacity>
					<View style={styles.freeNote}>
						<Ionicons
							name="checkmark-circle"
							size={16}
							color={Colors.textSecondary}
						/>
						<Text style={styles.freeNoteText}>
							Tidak memerlukan akun berbayar
						</Text>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: Colors.background },
	container: { flex: 1, paddingHorizontal: Spacing.lg },
	stepIndicator: { paddingTop: Spacing.lg, marginBottom: Spacing.xl },
	stepTopRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: Spacing.sm,
	},
	stepText: { fontSize: FontSize.sm, color: Colors.textSecondary },
	doneBadge: {
		backgroundColor: Colors.success + "20",
		borderRadius: Radius.full,
		paddingHorizontal: Spacing.sm,
		paddingVertical: 4,
	},
	doneText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: "600" },
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
	content: { flex: 1 },
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
	cards: { gap: Spacing.md },
	card: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.lg,
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Spacing.md,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
	},
	cardLeft: { flexShrink: 0 },
	iconWrap: {
		width: 44,
		height: 44,
		borderRadius: Radius.md,
		backgroundColor: Colors.primary + "15",
		alignItems: "center",
		justifyContent: "center",
	},
	cardBody: { flex: 1 },
	cardTitle: {
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: 4,
	},
	cardDesc: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		lineHeight: 20,
	},
	actions: { paddingBottom: Spacing.xl, gap: Spacing.md },
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
	freeNote: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	freeNoteText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
