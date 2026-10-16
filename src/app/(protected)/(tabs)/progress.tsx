/** @format */

import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthHeader from "@/components/ui/AuthHeader";
import Text from "@/components/ui/Text";
import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { useProgressData } from "@/hooks/useProgressData";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

function Card({
	children,
	style,
}: {
	children: React.ReactNode;
	style?: object;
}) {
	return <View style={[styles.card, style]}>{children}</View>;
}

function Divider() {
	return <View style={styles.divider} />;
}

function StatusChip({ label }: { label: string }) {
	const isCompleted = label === "Selesai";

	return (
		<View
			style={[styles.statusChip, isCompleted && styles.statusChipCompleted]}
		>
			<Text
				style={[
					styles.statusChipText,
					isCompleted && styles.statusChipTextCompleted,
				]}
			>
				{label}
			</Text>
		</View>
	);
}

export default function ProgressScreen() {
	const { state } = useProgressData();

	if (state.status === "idle" || state.status === "loading") {
		return (
			<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
				<View style={styles.loadingState}>
					<ActivityIndicator size="large" color={Colors.primary} />
					<Text style={styles.loadingText}>Memuat progres...</Text>
				</View>
			</SafeAreaView>
		);
	}

	const activity = state.status === "authenticated" ? state.activity : null;

	const history = state.status === "authenticated" ? state.history : [];

	const completedSessions = activity?.completed_sessions ?? 0;
	const currentStreak = activity?.streak_days ?? 0;
	const dailyActivity = activity?.days ?? [];
	const activeDays =
		activity?.active_days ??
		dailyActivity.filter((day) => day.is_active).length;
	const targetDays = activity?.target_days ?? 5;

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<AuthHeader />

				<View style={styles.titleSection}>
					<Text style={styles.pageTitle}>Progres</Text>
					<Text style={styles.pageSubtitle}>
						Setiap latihan adalah langkah maju.
					</Text>
				</View>

				{activity && (
					<>
						<Card style={styles.summaryCard}>
							<View style={styles.summaryHeading}>
								<View style={styles.summaryHeadingIcon}>
									<MaterialCommunityIcons
										name="chart-box-outline"
										size={20}
										color={Colors.primary}
									/>
								</View>

								<View style={styles.summaryHeadingInfo}>
									<Text style={styles.eyebrow}>Ringkasan minggu ini</Text>
									<Text style={styles.summaryDescription}>
										Perjalanan latihanmu minggu ini
									</Text>
								</View>
							</View>

							<Divider />

							<View style={styles.metrics}>
								<View style={styles.metric}>
									<View style={styles.metricIconPrimary}>
										<MaterialCommunityIcons
											name="check-circle-outline"
											size={22}
											color={Colors.primary}
										/>
									</View>

									<Text style={styles.metricCount}>{completedSessions}</Text>
									<Text style={styles.metricLabel}>Latihan selesai</Text>
								</View>

								<View style={styles.metricDivider} />

								<View style={styles.metric}>
									<View style={styles.metricIconAccent}>
										<MaterialCommunityIcons
											name="fire"
											size={22}
											color={Colors.accent}
										/>
									</View>

									<Text style={styles.metricCount}>{currentStreak}</Text>
									<Text style={styles.metricLabel}>Hari streak</Text>
								</View>
							</View>
						</Card>

						<Card style={styles.weeklyCard}>
							<View style={styles.sectionHeading}>
								<View style={styles.sectionHeadingText}>
									<Text style={styles.cardTitle}>Aktivitas Mingguan</Text>
									<Text style={styles.cardSubtitle}>
										Konsistensi latihan setiap hari
									</Text>
								</View>

								<View style={styles.weekBadge}>
									<MaterialCommunityIcons
										name="calendar-week"
										size={14}
										color={Colors.primary}
									/>
									<Text style={styles.weekBadgeText}>Minggu ini</Text>
								</View>
							</View>

							<View style={styles.chart}>
								{DAYS.map((day, index) => {
									const isActive = dailyActivity[index]?.is_active ?? false;

									return (
										<View key={day} style={styles.barCol}>
											<View
												style={[
													styles.barTrack,
													isActive && styles.barTrackActive,
												]}
											>
												{isActive && (
													<View style={styles.barFill}>
														<View style={styles.barHighlight} />
													</View>
												)}
											</View>

											<Text
												style={[
													styles.dayLabel,
													isActive && styles.dayLabelActive,
												]}
											>
												{day}
											</Text>

											<View
												style={[
													styles.dayIndicator,
													isActive && styles.dayIndicatorActive,
												]}
											/>
										</View>
									);
								})}
							</View>

							<Divider />

							{/*<View style={styles.chartFooter}>
								<View style={styles.legend}>
									<View style={styles.legendDot} />
									<Text style={styles.chartFootnote}>Hari aktif</Text>
								</View>

								<Text style={styles.chartTotal}>
									{activeDays} dari {targetDays} hari target
								</Text>
							</View>*/}

							{/*<View style={styles.targetTrack}>
								<View
									style={[
										styles.targetFill,
										{
											width: `${Math.min(
												(activeDays / Math.max(targetDays, 1)) * 100,
												100,
											)}%`,
										},
									]}
								/>
							</View>*/}
						</Card>
					</>
				)}

				<View style={styles.sectionHeader}>
					<View style={styles.sectionHeadingText}>
						<Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
						<Text style={styles.sectionSubtitle}>
							Riwayat latihan terbarumu
						</Text>
					</View>

					{history.length > 0 && (
						<View style={styles.historyCount}>
							<Text style={styles.historyCountText}>{history.length}</Text>
						</View>
					)}
				</View>

				{history.length === 0 ? (
					<Card style={styles.emptyCard}>
						<View style={styles.emptyIcon}>
							<MaterialCommunityIcons
								name="book-open-page-variant-outline"
								size={30}
								color={Colors.primary}
							/>
						</View>

						<Text style={styles.emptyTitle}>Belum ada aktivitas</Text>
						<Text style={styles.emptyText}>
							Mulai latihan pertamamu dan progres belajarmu akan muncul di sini.
						</Text>
					</Card>
				) : (
					<Card style={styles.recentCard}>
						{history.slice(0, 5).map((item, index) => {
							const isSpeaking = item.type === "speaking";
							const isCompleted = item.status === "completed";
							const score = item.average_score;

							return (
								<View key={item.session_id}>
									{index > 0 && <Divider />}

									<View style={styles.recentRow}>
										<View
											style={[
												styles.recentIcon,
												isSpeaking ? styles.speakingIcon : styles.hearingIcon,
											]}
										>
											{isSpeaking ? (
												<Text style={styles.speakingIconText}>Aa</Text>
											) : (
												<MaterialCommunityIcons
													name="ear-hearing"
													size={24}
													color={Colors.accent}
												/>
											)}
										</View>

										<View style={styles.recentInfo}>
											<View style={styles.recentTitleRow}>
												<Text style={styles.recentTitle}>
													{item.module_title}
												</Text>

												<MaterialCommunityIcons
													name="chevron-right"
													size={20}
													color={Colors.textSecondary}
												/>
											</View>

											<Text style={styles.recentType}>
												{isSpeaking ? "Latihan Bicara" : "Kenali Suara"}
											</Text>

											<View style={styles.recentBottom}>
												<StatusChip
													label={isCompleted ? "Selesai" : "Sedang berlangsung"}
												/>

												{score != null && (
													<Text style={styles.scoreText}>Nilai: {score}</Text>
												)}
											</View>
										</View>
									</View>
								</View>
							);
						})}
					</Card>
				)}
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
	content: {
		paddingHorizontal: Spacing.lg,
		paddingBottom: Spacing.xxl,
	},
	loadingState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm,
	},
	loadingText: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	titleSection: {
		marginTop: Spacing.sm,
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
		lineHeight: 22,
	},
	card: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	summaryCard: {
		padding: Spacing.lg,
		marginBottom: Spacing.md,
	},
	summaryHeading: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		marginBottom: Spacing.md,
	},
	summaryHeadingIcon: {
		width: 42,
		height: 42,
		borderRadius: Radius.md,
		backgroundColor: Colors.secondary + "33",
		alignItems: "center",
		justifyContent: "center",
	},
	summaryHeadingInfo: {
		flex: 1,
	},
	eyebrow: {
		fontSize: FontSize.sm,
		fontWeight: "600",
		color: Colors.primary,
	},
	summaryDescription: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginTop: 3,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: Colors.border,
	},
	metrics: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: Spacing.lg,
	},
	metric: {
		flex: 1,
		alignItems: "center",
	},
	metricDivider: {
		width: StyleSheet.hairlineWidth,
		height: 88,
		backgroundColor: Colors.border,
	},
	metricIconPrimary: {
		width: 42,
		height: 42,
		borderRadius: Radius.md,
		backgroundColor: Colors.secondary + "33",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.sm,
	},
	metricIconAccent: {
		width: 42,
		height: 42,
		borderRadius: Radius.md,
		backgroundColor: Colors.tertiary + "66",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.sm,
	},
	metricCount: {
		fontSize: FontSize.xxl,
		fontWeight: "800",
		color: Colors.text,
		fontVariant: ["tabular-nums"],
	},
	metricLabel: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
		textAlign: "center",
	},
	weeklyCard: {
		padding: Spacing.lg,
		marginBottom: Spacing.xl,
	},
	sectionHeading: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: Spacing.sm,
	},
	sectionHeadingText: {
		flex: 1,
	},
	cardTitle: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
	},
	cardSubtitle: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
		lineHeight: 20,
	},
	weekBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
		paddingHorizontal: Spacing.sm,
		paddingVertical: Spacing.xs,
		borderRadius: Radius.full,
		backgroundColor: Colors.secondary + "33",
	},
	weekBadgeText: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: Colors.primary,
	},
	chart: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		height: 126,
		marginTop: Spacing.lg,
		marginBottom: Spacing.md,
	},
	barCol: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-end",
		height: "100%",
	},
	barTrack: {
		width: 25,
		maxWidth: "75%",
		height: 82,
		borderRadius: Radius.sm,
		backgroundColor: Colors.border,
		justifyContent: "flex-end",
		overflow: "hidden",
	},
	barTrackActive: {
		backgroundColor: Colors.secondary + "44",
	},
	barFill: {
		width: "100%",
		height: "100%",
		backgroundColor: Colors.primary,
		borderTopLeftRadius: Radius.sm,
		borderTopRightRadius: Radius.sm,
		justifyContent: "flex-start",
	},
	barHighlight: {
		height: 5,
		backgroundColor: Colors.secondary,
	},
	dayLabel: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: Colors.textSecondary,
		marginTop: Spacing.sm,
	},
	dayLabelActive: {
		fontWeight: "700",
		color: Colors.primary,
	},
	dayIndicator: {
		width: 5,
		height: 5,
		borderRadius: Radius.full,
		backgroundColor: "transparent",
		marginTop: 4,
	},
	dayIndicatorActive: {
		backgroundColor: Colors.accent,
	},
	chartFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.sm,
		marginTop: Spacing.md,
		marginBottom: Spacing.sm,
	},
	legend: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: Radius.full,
		backgroundColor: Colors.primary,
	},
	chartFootnote: {
		fontSize: FontSize.xs,
		color: Colors.textSecondary,
	},
	chartTotal: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: Colors.text,
	},
	targetTrack: {
		height: 6,
		borderRadius: Radius.full,
		backgroundColor: Colors.border,
		overflow: "hidden",
	},
	targetFill: {
		height: "100%",
		borderRadius: Radius.full,
		backgroundColor: Colors.accent,
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
	sectionSubtitle: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
	},
	historyCount: {
		minWidth: 30,
		height: 30,
		paddingHorizontal: Spacing.sm,
		borderRadius: Radius.full,
		backgroundColor: Colors.secondary + "33",
		alignItems: "center",
		justifyContent: "center",
	},
	historyCountText: {
		fontSize: FontSize.sm,
		fontWeight: "700",
		color: Colors.primary,
	},
	recentCard: {
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.xs,
	},
	recentRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		paddingVertical: Spacing.md,
	},
	recentIcon: {
		width: 46,
		height: 46,
		borderRadius: Radius.lg,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	speakingIcon: {
		backgroundColor: Colors.secondary + "55",
	},
	hearingIcon: {
		backgroundColor: Colors.tertiary + "66",
	},
	speakingIconText: {
		fontSize: FontSize.md,
		fontWeight: "800",
		color: Colors.primary,
	},
	recentInfo: {
		flex: 1,
		minWidth: 0,
	},
	recentTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
	},
	recentTitle: {
		flex: 1,
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.text,
	},
	recentType: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginTop: 3,
		marginBottom: Spacing.sm,
	},
	recentBottom: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		gap: Spacing.sm,
	},
	statusChip: {
		alignSelf: "flex-start",
		backgroundColor: Colors.tertiary + "55",
		borderRadius: Radius.full,
		paddingHorizontal: Spacing.sm,
		paddingVertical: 5,
	},
	statusChipCompleted: {
		backgroundColor: Colors.secondary + "44",
	},
	statusChipText: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: Colors.text,
	},
	statusChipTextCompleted: {
		color: Colors.primary,
	},
	scoreText: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: Colors.textSecondary,
	},
	emptyCard: {
		alignItems: "center",
		padding: Spacing.xl,
	},
	emptyIcon: {
		width: 60,
		height: 60,
		borderRadius: Radius.xl,
		backgroundColor: Colors.secondary + "33",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.md,
	},
	emptyTitle: {
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: Spacing.xs,
	},
	emptyText: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		textAlign: "center",
		lineHeight: 21,
	},
});
