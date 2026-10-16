/** @format */

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
import { useHomeData } from "@/hooks/useHomeData";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const WEEK_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const modules = [
	{
		iconText: "Aa",
		iconBg: Colors.secondary + "33",
		iconColor: Colors.primary,
		title: "Latihan Bicara",
		meta: "5–10 menit  •  Pemula",
		description:
			"Latih pelafalan kata dan kalimat dengan panduan visual ritmik.",
		buttonBg: Colors.secondary + "33",
		buttonColor: Colors.primary,
		route: "/speaking",
	},
	{
		iconText: "HS",
		iconBg: Colors.tertiary + "33",
		iconColor: Colors.accent,
		title: "Kenali Suara",
		meta: "5–10 menit  •  Pemula",
		description: "Dengarkan dan identifikasi suara lingkungan di sekitarmu.",
		buttonBg: Colors.tertiary + "33",
		buttonColor: Colors.accent,
		route: "/recognition",
	},
];

type WeeklyActivity = {
	target_days: number;
	completed_sessions: number;
	days: { date: string; is_active: boolean }[];
};

type ExerciseHistoryItem = {
	type: "listening" | "speaking";
	module_title: string;
	status: "in_progress" | "completed";
	progress?: { done: number; total: number };
	average_score?: number | null;
	correct?: number | null;
	difficulty_label?: string;
	completed_at?: string | null;
};

function WeeklyActivityCard({ activity }: { activity: WeeklyActivity }) {
	const progress =
		activity.target_days > 0
			? Math.min(activity.completed_sessions / activity.target_days, 1)
			: 0;

	const percentage = Math.round(progress * 100);

	return (
		<View style={styles.card}>
			<View style={styles.weeklyInfo}>
				<View>
					<Text style={styles.progressValue}>
						{activity.completed_sessions} dari {activity.target_days} latihan
						selesai
					</Text>
					<Text style={styles.progressHelper}>
						Konsisten sedikit demi sedikit, ya!
					</Text>
				</View>

				<Text style={styles.progressPercent}>{percentage}%</Text>
			</View>

			<View style={styles.progressTrack}>
				<View style={[styles.progressFill, { width: `${percentage}%` }]} />
			</View>

			<View style={styles.daysRow}>
				{WEEK_DAYS.map((day, index) => (
					<View key={day} style={styles.dayItem}>
						<Text style={styles.dayLabel}>{day}</Text>
						<View
							style={[
								styles.dayDot,
								activity.days[index]?.is_active
									? styles.dayDotFilled
									: styles.dayDotEmpty,
							]}
						/>
					</View>
				))}
			</View>
		</View>
	);
}

function LastExerciseCard({ history }: { history: ExerciseHistoryItem[] }) {
	const last = history[0];

	if (!last) return null;

	const isSpeaking = last.type === "speaking";
	const isCompleted = last.status === "completed";

	const done = last.progress?.done ?? 0;
	const total = last.progress?.total ?? 0;

	const percentage =
		total > 0
			? Math.round(Math.min(done / total, 1) * 100)
			: isCompleted
				? 100
				: 0;

	const moduleColor = isSpeaking ? Colors.primary : Colors.accent;
	const moduleBackground = isSpeaking
		? Colors.secondary + "33"
		: Colors.tertiary + "33";

	const statusLabel = isCompleted ? "Selesai" : "Berlangsung";

	return (
		<View style={styles.lastExerciseCard}>
			<View style={styles.lastExerciseHeader}>
				<View style={[styles.iconTile, { backgroundColor: moduleBackground }]}>
					{isSpeaking ? (
						<Text style={[styles.iconTileText, { color: moduleColor }]}>
							Aa
						</Text>
					) : (
						<MaterialCommunityIcons
							name="ear-hearing"
							size={24}
							color={moduleColor}
						/>
					)}
				</View>

				<View style={styles.lastExerciseInfo}>
					<Text style={styles.lastExerciseCategory}>
						{isSpeaking ? "Latihan Bicara" : "Kenali Suara"}
					</Text>

					<Text style={styles.lastExerciseTitle}>{last.module_title}</Text>

					{last.difficulty_label ? (
						<Text style={styles.lastExerciseMeta}>{last.difficulty_label}</Text>
					) : null}
				</View>
			</View>

			<View style={styles.lastExerciseDivider} />

			<View style={styles.lastExerciseProgressHeader}>
				<View style={styles.lastExerciseProgressInfo}>
					<Text style={styles.lastExerciseProgressLabel}>
						{isCompleted ? "Latihan selesai" : "Progress latihan"}
					</Text>

					<Text style={styles.lastExerciseProgressValue}>
						{total > 0
							? `${Math.min(done, total)} dari ${total} soal`
							: isCompleted
								? "Semua soal selesai"
								: "Belum ada soal selesai"}
					</Text>
				</View>

				<Text style={styles.lastExercisePercentage}>{percentage}%</Text>
			</View>

			<View
				style={styles.lastExerciseProgressTrack}
				accessibilityRole="progressbar"
				accessibilityValue={{
					min: 0,
					max: 100,
					now: percentage,
				}}
			>
				<View style={[styles.progressFill, { width: `${percentage}%` }]} />
			</View>

			{isCompleted && last.correct != null ? (
				<View style={styles.lastExerciseResult}>
					<View style={styles.resultIcon}>
						<Text style={styles.resultIconText}>✓</Text>
					</View>

					<View style={styles.resultInfo}>
						<Text style={styles.lastExerciseResultLabel}>Jawaban benar</Text>
						<Text style={styles.lastExerciseResultValue}>
							{last.correct} dari {total} soal
						</Text>
					</View>
				</View>
			) : null}

			<TouchableOpacity
				style={[
					styles.lastExerciseButton,
					isCompleted ? styles.secondaryExerciseButton : styles.primaryButton,
				]}
				activeOpacity={0.8}
				onPress={() => router.push(isSpeaking ? "/speaking" : "/recognition")}
				accessibilityRole="button"
				accessibilityLabel={
					isCompleted ? "Ulangi latihan" : "Lanjutkan latihan"
				}
			>
				<Text
					style={[
						styles.lastExerciseButtonText,
						isCompleted
							? styles.secondaryExerciseButtonText
							: styles.primaryButtonText,
					]}
				>
					{isCompleted ? "Ulangi latihan" : "Lanjutkan latihan"}
				</Text>

				<Text
					style={[
						styles.lastExerciseButtonIcon,
						isCompleted
							? styles.secondaryExerciseButtonText
							: styles.primaryButtonText,
					]}
				>
					{isCompleted ? "↻" : "→"}
				</Text>
			</TouchableOpacity>
		</View>
	);
}
function ModuleCard({ module }: { module: (typeof modules)[number] }) {
	const isSpeaking = module.title === "Latihan Bicara";

	return (
		<View style={styles.moduleCard}>
			<View style={styles.moduleCardTop}>
				<View style={[styles.iconTile, { backgroundColor: module.iconBg }]}>
					{isSpeaking ? (
						<Text style={[styles.iconTileText, { color: module.iconColor }]}>
							Aa
						</Text>
					) : (
						<MaterialCommunityIcons
							name="ear-hearing"
							size={24}
							color={module.iconColor}
						/>
					)}
				</View>

				<View style={styles.moduleInfo}>
					<Text style={styles.moduleTitle}>{module.title}</Text>
					<Text style={styles.moduleMeta}>{module.meta}</Text>
				</View>
			</View>

			<Text style={styles.moduleDesc}>{module.description}</Text>

			<TouchableOpacity
				style={[styles.moduleButton, { backgroundColor: module.buttonBg }]}
				activeOpacity={0.8}
				onPress={() => router.push(module.route as any)}
				accessibilityRole="button"
				accessibilityLabel={`Mulai ${module.title}`}
			>
				<Text style={[styles.moduleButtonText, { color: module.buttonColor }]}>
					Mulai latihan
				</Text>

				<Text style={[styles.moduleButtonIcon, { color: module.buttonColor }]}>
					→
				</Text>
			</TouchableOpacity>
		</View>
	);
}
export default function BerandaScreen() {
	const { state } = useHomeData();

	const userName = state.status === "authenticated" ? state.userName : "User";

	const greeting = userName ? `Halo, ${userName}!` : "Halo!";

	if (state.status === "idle" || state.status === "loading") {
		return (
			<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
				<View style={styles.loadingState}>
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<Text style={styles.brandText}>HearAble</Text>

					<View style={styles.avatar}>
						<Text style={styles.avatarText}>
							{userName.charAt(0).toUpperCase()}
						</Text>
					</View>
				</View>

				<View style={styles.titleSection}>
					<Text style={styles.pageTitle}>{greeting}</Text>
					<Text style={styles.pageSubtitle}>
						Siap melanjutkan latihan hari ini?
					</Text>
				</View>

				{state.status === "authenticated" && (
					<>
						<View style={styles.section}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Aktivitas Minggu Ini</Text>
								<Text style={styles.sectionMeta}>
									Target {state.activity.target_days} hari
								</Text>
							</View>

							<WeeklyActivityCard activity={state.activity} />
						</View>

						{state.history.length > 0 && (
							<View style={styles.section}>
								<View style={styles.sectionHeader}>
									<Text style={styles.sectionTitle}>Lanjutkan Latihan</Text>
									<Text style={styles.sectionMeta}>Terakhir</Text>
								</View>

								<LastExerciseCard
									history={state.history as unknown as ExerciseHistoryItem[]}
								/>
							</View>
						)}
					</>
				)}

				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Semua Modul</Text>
						<Text style={styles.sectionMeta}>2 modul</Text>
					</View>

					{modules.map((module) => (
						<ModuleCard key={module.title} module={module} />
					))}
				</View>
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
	loadingState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		paddingHorizontal: Spacing.lg,
		paddingBottom: Spacing.xxl,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: Spacing.lg,
		paddingBottom: Spacing.md,
	},
	brandText: {
		fontSize: FontSize.xl,
		fontWeight: "800",
		color: Colors.primary,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: Radius.full,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: {
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.textOnPrimary,
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
	section: {
		marginBottom: Spacing.xl,
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
	sectionMeta: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	card: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
	},
	weeklyInfo: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.sm,
		marginBottom: Spacing.md,
	},
	progressValue: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: Spacing.xs,
	},
	progressPercent: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.primary,
	},
	progressHelper: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	progressTrack: {
		height: 8,
		backgroundColor: Colors.secondary + "33",
		borderRadius: Radius.full,
		marginBottom: Spacing.md,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: Colors.primary,
		borderRadius: Radius.full,
	},
	daysRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	dayItem: {
		alignItems: "center",
	},
	dayLabel: {
		fontSize: FontSize.xs,
		color: Colors.textSecondary,
		marginBottom: 6,
	},
	dayDot: {
		width: 8,
		height: 8,
		borderRadius: Radius.full,
	},
	dayDotFilled: {
		backgroundColor: Colors.primary,
	},
	dayDotEmpty: {
		backgroundColor: Colors.border,
	},
	iconTile: {
		width: 48,
		height: 48,
		borderRadius: Radius.md,
		backgroundColor: Colors.secondary + "33",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	iconTileText: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.primary,
	},
	lastExerciseCard: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
	},
	lastExerciseHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
	},
	lastExerciseInfo: {
		flex: 1,
		gap: 3,
	},
	lastExerciseCategory: {
		fontSize: FontSize.xs,
		fontWeight: "700",
		letterSpacing: 0.7,
		color: Colors.textSecondary,
	},
	lastExerciseTitle: {
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.text,
	},
	lastExerciseMeta: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		gap: 5,
		paddingHorizontal: Spacing.sm,
		paddingVertical: 6,
		borderRadius: Radius.full,
	},
	completedBadge: {
		backgroundColor: Colors.secondary + "33",
	},
	inProgressBadge: {
		backgroundColor: Colors.tertiary + "33",
	},
	statusDot: {
		width: 6,
		height: 6,
		borderRadius: Radius.full,
	},
	statusText: {
		fontSize: FontSize.xs,
		fontWeight: "600",
	},
	lastExerciseDivider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: Colors.border,
		marginVertical: Spacing.lg,
	},
	lastExerciseProgressHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.md,
		marginBottom: Spacing.sm,
	},
	lastExerciseProgressInfo: {
		flex: 1,
	},
	lastExerciseProgressLabel: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginBottom: 4,
	},
	lastExerciseProgressValue: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.text,
	},
	lastExercisePercentage: {
		fontSize: FontSize.xl,
		fontWeight: "800",
		color: Colors.primary,
	},
	lastExerciseProgressTrack: {
		height: 8,
		backgroundColor: Colors.secondary + "33",
		borderRadius: Radius.full,
		overflow: "hidden",
		marginBottom: Spacing.md,
	},
	lastExerciseResult: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		padding: Spacing.md,
		backgroundColor: Colors.background,
		borderRadius: Radius.md,
		marginBottom: Spacing.md,
	},
	resultIcon: {
		width: 32,
		height: 32,
		borderRadius: Radius.full,
		backgroundColor: Colors.secondary + "33",
		alignItems: "center",
		justifyContent: "center",
	},
	resultIconText: {
		fontSize: FontSize.md,
		fontWeight: "800",
		color: Colors.primary,
	},
	resultInfo: {
		flex: 1,
		gap: 2,
	},
	lastExerciseResultLabel: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	lastExerciseResultValue: {
		fontSize: FontSize.sm,
		fontWeight: "700",
		color: Colors.text,
	},
	lastExerciseButton: {
		minHeight: 48,
		borderRadius: Radius.lg,
		paddingVertical: Spacing.sm + 2,
		paddingHorizontal: Spacing.md,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: Spacing.sm,
	},
	primaryButton: {
		backgroundColor: Colors.primary,
	},
	secondaryExerciseButton: {
		backgroundColor: Colors.secondary + "33",
		borderWidth: 1,
		borderColor: Colors.border,
	},
	lastExerciseButtonText: {
		fontSize: FontSize.md,
		fontWeight: "700",
	},
	lastExerciseButtonIcon: {
		fontSize: FontSize.xl,
		fontWeight: "600",
	},
	primaryButtonText: {
		color: Colors.textOnPrimary,
	},
	secondaryExerciseButtonText: {
		color: Colors.primary,
	},
	moduleCard: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.lg,
		marginBottom: Spacing.md,
		borderWidth: 1,
		borderColor: Colors.border,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
	},
	moduleCardTop: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Spacing.md,
		gap: Spacing.md,
	},
	moduleInfo: {
		flex: 1,
	},
	moduleTitle: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: 2,
	},
	moduleMeta: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	moduleDesc: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		lineHeight: 20,
		marginBottom: Spacing.md,
	},
	moduleButton: {
		minHeight: 44,
		borderRadius: Radius.lg,
		paddingVertical: Spacing.sm + 2,
		paddingHorizontal: Spacing.md,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: Spacing.xs,
	},
	moduleButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
	},
	moduleButtonIcon: {
		fontSize: FontSize.xl,
		fontWeight: "500",
	},
});
