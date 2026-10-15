/** @format */

import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import Text from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { useProgressData } from "@/hooks/useProgressData";

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
	return (
		<View style={styles.statusChip}>
			<Text style={styles.statusChipText}>{label}</Text>
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
				</View>
			</SafeAreaView>
		);
	}

	const activity = state.status === "authenticated" ? state.activity : null;
	const history = state.status === "authenticated" ? state.history : [];

	const weeklyCompleted = activity?.completed_sessions ?? 0;
	const currentStreak = activity?.streak_days ?? 0;
	const dailyActivity = activity?.days ?? [];

	const activeDays = dailyActivity.filter((d) => d.is_active).length;

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<Text style={styles.brandText}>HearAble</Text>

					<View style={styles.avatar}>
						<Text style={styles.avatarText}>R</Text>
					</View>
				</View>

				<View style={styles.titleSection}>
					<Text style={styles.pageTitle}>Progres</Text>
					<Text style={styles.pageSubtitle}>
						Setiap latihan adalah langkah maju.
					</Text>
				</View>

				{activity && (
					<>
						<Card style={styles.summaryCard}>
							<Text style={styles.eyebrow}>RINGKASAN MINGGU INI</Text>

							<Divider />

							<View style={styles.metrics}>
								<View style={styles.metric}>
									<View
										style={[
											styles.metricIcon,
											{ backgroundColor: Colors.secondary + "33" },
										]}
									>
										<Text
											style={[styles.metricIconText, { color: Colors.primary }]}
										>
											✓
										</Text>
									</View>

									<Text style={styles.metricCount}>{weeklyCompleted}</Text>
									<Text style={styles.metricLabel}>Latihan selesai</Text>
								</View>

								<View style={styles.metricDivider} />

								<View style={styles.metric}>
									<View
										style={[
											styles.metricIcon,
											{ backgroundColor: Colors.tertiary + "33" },
										]}
									>
										<Text style={[styles.metricIconText, { color: Colors.accent }]}>
											◷
										</Text>
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
										Jumlah sesi latihan per hari
									</Text>
								</View>

								<View style={styles.weekBadge}>
									<Text style={styles.weekBadgeText}>Minggu ini</Text>
								</View>
							</View>

							<View style={styles.chart}>
								{DAYS.map((day, index) => {
									const completed = dailyActivity[index]?.is_active ?? false;
									return (
										<View key={day} style={styles.barCol}>
											<View style={styles.barTrack}>
												{completed && (
													<View style={styles.barFill}>
														<View style={styles.barHighlight} />
													</View>
												)}
											</View>

											<Text
												style={[
													styles.dayLabel,
													completed && styles.dayLabelActive,
												]}
											>
												{day}
											</Text>
										</View>
									);
								})}
							</View>

							<View style={styles.chartFooter}>
								<View style={styles.legend}>
									<View style={styles.legendDot} />
									<Text style={styles.chartFootnote}>Hari latihan</Text>
								</View>

								<Text style={styles.chartTotal}>{activeDays} hari aktif</Text>
							</View>
						</Card>
					</>
				)}

				<View style={styles.sectionHeader}>
					<View>
						<Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
						<Text style={styles.sectionSubtitle}>
							Lanjutkan perjalanan belajarmu
						</Text>
					</View>
				</View>

				{history.length === 0 ? (
					<Card style={styles.recentCard}>
						<Text style={styles.emptyText}>
							Belum ada aktivitas. Mulai latihan pertamamu!
						</Text>
					</Card>
				) : (
					<Card style={styles.recentCard}>
							{history.slice(0, 5).map((item, index) => {
							const isSpeaking = item.type === "speaking";
							const progressTotal = item.progress?.total ?? 0;
							return (
								<View key={item.session_id}>
									{index > 0 && <Divider />}

									<View style={styles.recentRow}>
										<View
											style={[
												styles.recentIcon,
												{
													backgroundColor: isSpeaking
														? Colors.secondary + "33"
														: Colors.tertiary + "33",
												},
											]}
										>
											<Text style={styles.recentIconText}>
												{isSpeaking ? "Aa" : "♫"}
											</Text>
										</View>

										<View style={styles.recentInfo}>
											<Text style={styles.recentTitle}>
												{isSpeaking ? "Latihan Bicara" : "Kenali Suara"}
											</Text>

											<Text style={styles.recentDetail}>
												{item.module_name} · {item.average_score ?? 0} dari {progressTotal}
											</Text>

											{index === 0 && (
												<StatusChip label="Dilanjutkan" />
											)}
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
	card: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		borderWidth: 1,
		borderColor: Colors.border,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
	},
	summaryCard: {
		padding: Spacing.lg,
		marginBottom: Spacing.md,
	},
	eyebrow: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: Colors.primary,
		letterSpacing: 1,
		marginBottom: Spacing.md,
	},
	divider: {
		height: 1,
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
		width: 1,
		height: 88,
		backgroundColor: Colors.border,
	},
	metricIcon: {
		width: 36,
		height: 36,
		borderRadius: Radius.md,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.xs,
	},
	metricIconText: {
		fontSize: FontSize.lg,
		fontWeight: "700",
	},
	metricCount: {
		fontSize: FontSize.xxl,
		fontWeight: "800",
		color: Colors.text,
	},
	metricLabel: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginTop: 2,
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
	},
	weekBadge: {
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
		height: 112,
		marginTop: Spacing.lg,
	},
	barCol: {
		flex: 1,
		alignItems: "center",
	},
	barTrack: {
		width: 24,
		maxWidth: "80%",
		height: 88,
		borderRadius: Radius.sm,
		backgroundColor: Colors.border,
		justifyContent: "flex-end",
		overflow: "hidden",
	},
	barFill: {
		width: "100%",
		height: 38,
		backgroundColor: Colors.primary,
		borderTopLeftRadius: Radius.sm,
		borderTopRightRadius: Radius.sm,
		justifyContent: "flex-start",
	},
	barHighlight: {
		height: 6,
		backgroundColor: Colors.secondary,
	},
	dayLabel: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
	},
	dayLabelActive: {
		fontWeight: "700",
		color: Colors.primary,
	},
	chartFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: Spacing.md,
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
	sectionHeader: {
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
	moduleList: {
		gap: Spacing.md,
		marginBottom: Spacing.xl,
	},
	moduleCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		padding: Spacing.md,
	},
	moduleIcon: {
		width: 48,
		height: 48,
		borderRadius: Radius.md,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	moduleIconText: {
		fontSize: FontSize.lg,
		fontWeight: "700",
		color: Colors.text,
	},
	moduleInfo: {
		flex: 1,
		minWidth: 0,
	},
	moduleTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.sm,
	},
	moduleTitle: {
		flex: 1,
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.text,
	},
	moduleSessions: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginTop: 2,
		marginBottom: Spacing.sm,
	},
	moduleProgress: {
		fontSize: FontSize.sm,
		fontWeight: "700",
		color: Colors.primary,
	},
	progressTrack: {
		width: "100%",
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
		width: 44,
		height: 44,
		borderRadius: Radius.md,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	recentIconText: {
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.text,
	},
	recentInfo: {
		flex: 1,
		minWidth: 0,
	},
	recentTitle: {
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.text,
	},
	recentDetail: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
		marginBottom: Spacing.sm,
	},
	statusChip: {
		alignSelf: "flex-start",
		backgroundColor: Colors.secondary + "33",
		borderRadius: Radius.full,
		paddingHorizontal: Spacing.sm,
		paddingVertical: Spacing.xs,
	},
	statusChipText: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: Colors.primary,
	},
	emptyText: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		textAlign: "center",
		paddingVertical: Spacing.lg,
	},
});
