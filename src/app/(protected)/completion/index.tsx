/** @format */

import { useEffect } from "react";

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
import {
	type ExerciseType,
	useExerciseProgress,
} from "@/hooks/useExerciseProgress";
import { Ionicons } from "@expo/vector-icons";

function Header() {
	return (
		<View style={styles.header}>
			<TouchableOpacity
				style={styles.backButton}
				activeOpacity={0.8}
				onPress={() => {
					resetProgressAndGoHome();
				}}
				accessibilityRole="button"
				accessibilityLabel="Kembali ke beranda"
			>
				<Ionicons name="chevron-back" size={20} color={Colors.text} />
			</TouchableOpacity>

			<Text style={styles.headerTitle}>Hasil Latihan</Text>

			<View style={styles.headerSpacer} />
		</View>
	);
}

function ScoreCard({
	icon,
	title,
	score,
	total,
}: {
	icon: React.ComponentProps<typeof Ionicons>["name"];
	title: string;
	score: number;
	total: number;
}) {
	const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

	return (
		<View style={styles.scoreCard}>
			<View style={styles.scoreCardHeader}>
				<View style={styles.scoreIcon}>
					<Ionicons name={icon} size={20} color={Colors.primary} />
				</View>

				<Text style={styles.scoreTitle}>{title}</Text>
			</View>

			<View style={styles.scoreValueRow}>
				<Text style={styles.scoreValue}>{score}</Text>
				<Text style={styles.scoreTotal}>/ {total}</Text>
			</View>

			<View style={styles.progressTrack}>
				<View
					style={[
						styles.progressFill,
						{ width: `${Math.min(100, percentage)}%` },
					]}
				/>
			</View>

			<Text style={styles.scoreCaption}>
				{total > 0 ? `${percentage}% pencapaian` : "Belum ada hasil"}
			</Text>
		</View>
	);
}

function CompletionSection({
	exerciseType,
	score,
	total,
}: {
	exerciseType: ExerciseType;
	score: number;
	total: number;
}) {
	const isListening = exerciseType === "listening";

	return (
		<View style={styles.completionSection}>
			<View style={styles.successCircle}>
				<Ionicons name="checkmark-circle" size={46} color={Colors.primary} />
			</View>

			<Text style={styles.eyebrow}>LATIHAN SELESAI</Text>

			<Text style={styles.completionTitle}>Kerja bagus!</Text>

			<Text style={styles.descriptionText}>
				{isListening
					? "Kamu sudah menyelesaikan latihan pengenalan audio. Terus berlatih untuk meningkatkan kemampuan menyimakmu."
					: "Kamu sudah menyelesaikan latihan pelafalan. Terus berlatih untuk meningkatkan kemampuan berbicaramu."}
			</Text>

			<View style={styles.scoreList}>
				<ScoreCard
					icon={isListening ? "ear-outline" : "mic-outline"}
					title={isListening ? "Pengenalan Audio" : "Pelafalan"}
					score={score}
					total={total}
				/>
			</View>
		</View>
	);
}

function ActionButtons({ onRetry }: { onRetry: () => void }) {
	return (
		<View style={styles.actionButtons}>
			<TouchableOpacity
				style={styles.primaryButton}
				activeOpacity={0.8}
				onPress={resetProgressAndGoHome}
				accessibilityRole="button"
			>
				<Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
				<Ionicons name="arrow-forward" size={18} color={Colors.surface} />
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.secondaryButton}
				activeOpacity={0.8}
				onPress={onRetry}
				accessibilityRole="button"
			>
				<Ionicons name="refresh-outline" size={18} color={Colors.primary} />
				<Text style={styles.secondaryButtonText}>Coba Latihan Lagi</Text>
			</TouchableOpacity>
		</View>
	);
}

function resetProgressAndGoHome() {
	router.replace("/(tabs)");
}

export default function CompletionScreen() {
	const { state, reset } = useExerciseProgress();

	useEffect(() => {
		if (!state.exerciseType) {
			router.replace("/(tabs)");
		}
	}, [state.exerciseType]);

	const handleRetry = () => {
		const exerciseType = state.exerciseType;

		if (!exerciseType) {
			router.replace("/(tabs)");
			return;
		}

		reset();

		if (exerciseType === "listening") {
			router.replace("/recognition");
			return;
		}

		router.replace("/speaking");
	};

	if (!state.exerciseType) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.primary} />
			</SafeAreaView>
		);
	}

	const isListening = state.exerciseType === "listening";

	const score = isListening ? state.recognitionScore : state.speakingScore;
	const total = isListening ? state.recognitionTotal : state.speakingTotal;

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<Header />

				<View style={styles.heroCard}>
					<CompletionSection
						exerciseType={state.exerciseType}
						score={score}
						total={total}
					/>
				</View>

				<ActionButtons onRetry={handleRetry} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	loadingContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.background,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: Spacing.lg,
		paddingTop: Spacing.sm,
		paddingBottom: Spacing.xl,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: Spacing.lg,
		minHeight: 44,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: Radius.md,
		backgroundColor: Colors.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
	},
	headerSpacer: {
		width: 40,
	},
	heroCard: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		marginBottom: Spacing.lg,
	},
	completionSection: {
		alignItems: "center",
	},
	successCircle: {
		width: 84,
		height: 84,
		borderRadius: 42,
		backgroundColor: Colors.secondary + "44",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.md,
	},
	eyebrow: {
		fontSize: FontSize.xs,
		fontWeight: "700",
		letterSpacing: 1.5,
		color: Colors.primary,
		marginBottom: Spacing.xs,
	},
	completionTitle: {
		fontSize: FontSize.xl,
		fontWeight: "700",
		color: Colors.text,
		textAlign: "center",
		marginBottom: Spacing.sm,
	},
	descriptionText: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: Spacing.xl,
	},
	scoreList: {
		width: "100%",
		gap: Spacing.md,
	},
	scoreCard: {
		backgroundColor: Colors.background,
		borderRadius: Radius.lg,
		padding: Spacing.md,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	scoreCardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		marginBottom: Spacing.md,
	},
	scoreIcon: {
		width: 36,
		height: 36,
		borderRadius: Radius.md,
		backgroundColor: Colors.secondary + "55",
		alignItems: "center",
		justifyContent: "center",
	},
	scoreTitle: {
		flex: 1,
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.text,
	},
	scoreValueRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 5,
		marginBottom: Spacing.sm,
	},
	scoreValue: {
		fontSize: 30,
		fontWeight: "700",
		color: Colors.primary,
	},
	scoreTotal: {
		fontSize: FontSize.md,
		color: Colors.textSecondary,
	},
	progressTrack: {
		height: 7,
		borderRadius: Radius.full,
		backgroundColor: Colors.border,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		borderRadius: Radius.full,
		backgroundColor: Colors.primary,
	},
	scoreCaption: {
		fontSize: FontSize.xs,
		color: Colors.textSecondary,
		marginTop: Spacing.sm,
	},
	actionButtons: {
		gap: Spacing.sm,
	},
	primaryButton: {
		minHeight: 52,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm,
		backgroundColor: Colors.primary,
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.lg,
		borderRadius: Radius.lg,
	},
	primaryButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.surface,
	},
	secondaryButton: {
		minHeight: 52,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm,
		backgroundColor: Colors.surface,
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.lg,
		borderRadius: Radius.lg,
		borderWidth: 1,
		borderColor: Colors.primary,
	},
	secondaryButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.primary,
	},
});
