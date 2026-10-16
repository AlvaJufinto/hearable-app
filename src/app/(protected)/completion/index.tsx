/** @format */

import { useEffect } from "react";

import { router } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Text from "@/components/ui/Text";
import { FontSize, Radius, Spacing } from "@/constant/theme";
import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
	surface: "#EBF8FA",
	primary: "#369FA6",
	darkText: "#101F19",
	textSecondary: "#3F4945",
	white: "#FFFFFF",
};

function Header() {
	return (
		<View style={styles.header}>
			<View style={styles.headerTopRow}>
				<View style={styles.headerLeft}>
					<TouchableOpacity
						style={styles.backButton}
						activeOpacity={0.8}
						onPress={() => router.back()}
					>
						<Ionicons name="chevron-back" size={20} color={COLORS.darkText} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Sesi Latihan</Text>
				</View>
				<View style={styles.headerTimeBadge}>
					<Text style={styles.headerTime}>09:41</Text>
				</View>
			</View>
		</View>
	);
}

function StatPill({ value, label }: { value: string; label: string }) {
	return (
		<View style={styles.statPill}>
			<Text style={styles.statValue}>{value}</Text>
			<Text style={styles.statLabel}>{label}</Text>
		</View>
	);
}

function CompletionSection({
	recognitionScore,
	recognitionTotal,
	speakingScore,
	speakingTotal,
}: {
	recognitionScore: number;
	recognitionTotal: number;
	speakingScore: number;
	speakingTotal: number;
}) {
	return (
		<View style={styles.completionSection}>
			<Text style={styles.sectionTitle}>Sesi Selesai!</Text>
			<View style={styles.iconCircle}>
				<Ionicons name="checkmark" size={29} color={COLORS.white} />
			</View>
			<View style={styles.statsRow}>
				<StatPill
					value={`${recognitionScore} dari ${recognitionTotal}`}
					label="Soal Diselesaikan"
				/>
				<StatPill
					value={`${speakingScore} dari ${speakingTotal}`}
					label="Pelafalan"
				/>
			</View>
			<Text style={styles.descriptionText}>
				Kamu telah menyelesaikan latihan pengenalan audio dan bicara hari ini.
			</Text>
		</View>
	);
}

function ActionButtons({ onRetry }: { onRetry: () => void }) {
	return (
		<View style={styles.actionButtons}>
			<TouchableOpacity
				style={styles.primaryButton}
				activeOpacity={0.8}
				onPress={() => router.replace("/(tabs)")}
			>
				<Text style={styles.primaryButtonText}>Lanjut ke Beranda</Text>
				<Ionicons name="arrow-forward" size={13} color={COLORS.white} />
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.secondaryButton}
				activeOpacity={0.8}
				onPress={onRetry}
			>
				<Ionicons name="refresh" size={13} color={COLORS.primary} />
				<Text style={styles.secondaryButtonText}>Coba Latihan Lagi</Text>
			</TouchableOpacity>
		</View>
	);
}

export default function CompletionScreen() {
	const { state, reset } = useExerciseProgress();

	useEffect(() => {
		if (!state.recognitionDone && !state.speakingDone) {
			router.replace("/recognition");
		}
	}, [state]);

	const handleRetry = () => {
		reset();
		router.replace("/recognition");
	};

	const recognitionScore = state.recognitionScore;
	const recognitionTotal = state.recognitionTotal;
	const speakingScore = state.speakingScore;
	const speakingTotal = state.speakingTotal;

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<Header />
				<View style={styles.card}>
					<View style={styles.badgeRow}>
						<Text style={styles.badgeText}>Hasil Latihan</Text>
					</View>
					<CompletionSection
						recognitionScore={recognitionScore}
						recognitionTotal={recognitionTotal}
						speakingScore={speakingScore}
						speakingTotal={speakingTotal}
					/>
				</View>
				<ActionButtons onRetry={handleRetry} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.surface },
	scrollView: { flex: 1 },
	scrollContent: { paddingHorizontal: Spacing.lg },
	header: {
		paddingTop: Spacing.md,
		paddingBottom: Spacing.sm,
	},
	headerTopRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	backButton: {
		padding: 4,
	},
	headerTitle: {
		fontSize: FontSize.md,
		fontWeight: "700",
		color: COLORS.darkText,
	},
	headerTimeBadge: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: Radius.full,
	},
	headerTime: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: COLORS.white,
	},
	card: {
		backgroundColor: COLORS.white,
		borderRadius: Radius.md,
		padding: Spacing.lg,
		marginBottom: Spacing.lg,
	},
	badgeRow: {
		marginBottom: Spacing.lg,
	},
	badgeText: {
		fontSize: FontSize.sm,
		fontWeight: "600",
		color: COLORS.darkText,
	},
	completionSection: {
		alignItems: "center",
	},
	sectionTitle: {
		fontSize: FontSize.lg,
		fontWeight: "600",
		color: COLORS.darkText,
		marginBottom: Spacing.md,
	},
	iconCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: COLORS.primary,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.lg,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	statsRow: {
		flexDirection: "row",
		gap: Spacing.md,
		marginBottom: Spacing.md,
	},
	statPill: {
		flex: 1,
		backgroundColor: COLORS.surface,
		borderRadius: Radius.sm,
		padding: Spacing.md,
		alignItems: "center",
	},
	statValue: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.primary,
		marginBottom: 2,
	},
	statLabel: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: COLORS.textSecondary,
		textAlign: "center",
	},
	descriptionText: {
		fontSize: FontSize.sm,
		fontWeight: "400",
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 22,
	},
	actionButtons: {
		gap: Spacing.sm,
	},
	primaryButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: COLORS.primary,
		paddingVertical: Spacing.md,
		borderRadius: Radius.md,
	},
	primaryButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: COLORS.white,
	},
	secondaryButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: COLORS.white,
		paddingVertical: Spacing.md,
		borderRadius: Radius.md,
		borderWidth: 1.5,
		borderColor: COLORS.primary,
	},
	secondaryButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: COLORS.primary,
	},
});
