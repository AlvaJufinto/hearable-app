/** @format */

import { router } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ModuleCard } from "@/components/modules";
import AuthHeader from "@/components/ui/AuthHeader";
import Text from "@/components/ui/Text";
import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { usePracticeData } from "@/hooks/usePracticeData";

export default function PracticeScreen() {
	const { state } = usePracticeData();

	if (state.status === "idle" || state.status === "loading") {
		return (
			<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
				<View style={styles.loadingState}>
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			</SafeAreaView>
		);
	}

	if (state.status === "unauthenticated") {
		return (
			<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
				<View style={styles.loadingState}>
					<Text style={styles.emptyText}>Silakan masuk terlebih dahulu.</Text>
				</View>
			</SafeAreaView>
		);
	}

	const { weeklyCompleted, weeklyGoal, listeningModules, speakingModules } =
		state;

	const progress = weeklyGoal > 0 ? weeklyCompleted / weeklyGoal : 0;
	const totalModules = listeningModules.length + speakingModules.length;

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<AuthHeader />

				<View style={styles.titleSection}>
					<Text style={styles.pageTitle}>Latihan</Text>
					<Text style={styles.pageSubtitle}>
						Pilih latihan yang sesuai dengan kebutuhanmu.
					</Text>
				</View>

				<View style={styles.progressCard}>
					<Text style={styles.progressLabel}>Progress minggu ini</Text>

					<Text style={styles.progressValue}>
						{weeklyCompleted} dari {weeklyGoal} latihan selesai
					</Text>

					<View style={styles.progressTrack}>
						<View
							style={[
								styles.progressFill,
								{ width: `${Math.min(progress, 1) * 100}%` },
							]}
						/>
					</View>

					<Text style={styles.progressHelper}>
						Konsisten sedikit demi sedikit, ya!
					</Text>
				</View>

				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Semua Modul</Text>
					<Text style={styles.moduleCount}>{totalModules} modul</Text>
				</View>

				{speakingModules.map((module) => (
					<ModuleCard
						key={`speaking-${module.id}`}
						title={module.label}
						description={module.description}
						meta={[
							{
								icon: "document-text-outline",
								label: `${module.sentence_count} kalimat`,
							},
						]}
						difficulty={module.difficulty}
						onPress={() => router.push("/speaking")}
					/>
				))}

				{listeningModules.map((module) => (
					<ModuleCard
						key={`listening-${module.id}`}
						title={module.label}
						description={module.description}
						meta={[
							{
								icon: "document-text-outline",
								label: `${module.question_count} audio`,
							},
						]}
						difficulty={module.difficulty}
						onPress={() => router.push("/recognition")}
					/>
				))}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: Spacing.lg,
		paddingBottom: Spacing.xxl,
	},
	loadingState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyText: {
		fontSize: FontSize.md,
		color: Colors.textSecondary,
		textAlign: "center",
	},
	titleSection: {
		marginBottom: Spacing.lg,
	},
	pageTitle: {
		fontSize: FontSize.xxl,
		fontWeight: "800",
		color: Colors.text,
		marginBottom: Spacing.xs,
	},
	pageSubtitle: {
		fontSize: FontSize.md,
		color: Colors.textSecondary,
	},
	progressCard: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.lg,
		marginBottom: Spacing.xl,
		borderWidth: 1,
		borderColor: Colors.border,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
	},
	progressLabel: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: Colors.primary,
		marginBottom: Spacing.xs,
	},
	progressValue: {
		fontSize: FontSize.xl,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: Spacing.sm,
	},
	progressTrack: {
		height: 8,
		backgroundColor: Colors.secondary + "33",
		borderRadius: Radius.full,
		marginBottom: Spacing.sm,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: Colors.primary,
		borderRadius: Radius.full,
	},
	progressHelper: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: Spacing.md,
	},
	sectionTitle: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
	},
	moduleCount: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
});
