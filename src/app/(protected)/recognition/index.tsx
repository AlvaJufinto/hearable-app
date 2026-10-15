/** @format */

import { useEffect, useState, useRef } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { router } from "expo-router";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import Text from "@/components/ui/Text";
import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { useListeningSession } from "@/hooks/useListeningSession";
import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import type { ListeningModule, ListeningQuestion } from "@/types/api";

const EQUALIZER_HEIGHTS = [16, 28, 36, 20, 32, 40, 24, 32, 16, 8, 8];

function ModuleCard({
	module,
	onSelect,
}: {
	module: ListeningModule;
	onSelect: () => void;
}) {
	const difficultyLabel = ["", "Pemula", "Dasar", "Menengah", "Mahir"][
		module.difficulty
	];

	return (
		<TouchableOpacity
			style={styles.moduleCard}
			activeOpacity={0.8}
			onPress={onSelect}
		>
			<View style={styles.moduleCardIcon}>
				<Ionicons name="headset" size={20} color={Colors.primary} />
			</View>
			<View style={styles.moduleCardInfo}>
				<Text style={styles.moduleCardTitle}>{module.name}</Text>
				<Text style={styles.moduleCardMeta}>
					{module.question_count} audio · {difficultyLabel}
				</Text>
			</View>
			<Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
		</TouchableOpacity>
	);
}

function AudioCard({ audioUrl }: { audioUrl?: string }) {
	const { status, position, duration, loadAudio } = useAudioPlayer(true);
	const [barIndex, setBarIndex] = useState(0);

	useEffect(() => {
		if (audioUrl) {
			loadAudio(audioUrl);
		}
	}, [audioUrl, loadAudio]);

	useEffect(() => {
		if (status === "playing") {
			const interval = setInterval(() => {
				setBarIndex((i) => (i + 1) % EQUALIZER_HEIGHTS.length);
			}, 150);
			return () => clearInterval(interval);
		}
	}, [status]);

	const formatTime = (ms: number) => {
		const totalSec = Math.floor(ms / 1000);
		const min = Math.floor(totalSec / 60);
		const sec = totalSec % 60;
		return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
	};

	const isPlaying = status === "playing";
	const progressText = duration > 0
		? `${formatTime(position)} / ${formatTime(duration)}`
		: "Memuat audio...";

	return (
		<View style={styles.audioCard}>
			<Text style={styles.audioStatus}>
				{isPlaying ? `Memutar Suara... (${progressText})` : `Siap diputar`}
			</Text>
			<View style={styles.equalizerRow}>
				{EQUALIZER_HEIGHTS.map((_, i) => {
					const baseH = EQUALIZER_HEIGHTS[(i + barIndex) % EQUALIZER_HEIGHTS.length];
					const h = isPlaying ? baseH : baseH * 0.6;
					return (
						<View
							key={i}
							style={[
								styles.equalizerBar,
								{ height: h, backgroundColor: isPlaying ? Colors.primary : Colors.surface },
							]}
						/>
					);
				})}
			</View>
			<View style={styles.playButtonWrapper}>
				<View style={styles.playAura} />
				<TouchableOpacity
					style={styles.playButton}
					activeOpacity={0.8}
					onPress={() => {
						if (audioUrl) loadAudio(audioUrl);
					}}
					disabled={!audioUrl}
				>
					<Ionicons name="refresh" size={24} color={Colors.surface} />
				</TouchableOpacity>
			</View>
			<View style={styles.helperBadge}>
				<Ionicons
					name="information-circle-outline"
					size={14}
					color={Colors.textSecondary}
				/>
				<Text style={styles.helperText}>Ketuk ikon untuk putar ulang</Text>
			</View>
		</View>
	);
}

function AccessibleNote() {
	return (
		<View style={styles.accessibleNote}>
			<Ionicons name="volume-high" size={14} color={Colors.primary} />
			<Text style={styles.accessibleNoteText}>
				Tersedia petunjuk teks jika kamu tidak dapat mendengar suara dengan jelas.
			</Text>
		</View>
	);
}

function RadioOption({
	label,
	selected,
	onSelect,
}: {
	label: string;
	selected?: boolean;
	onSelect?: () => void;
}) {
	return (
		<TouchableOpacity
			style={[styles.radioOption, selected && styles.radioOptionSelected]}
			activeOpacity={0.8}
			onPress={onSelect}
		>
			<View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
				{selected && <View style={styles.radioDot} />}
			</View>
			<Text
				style={[styles.radioLabel, selected && styles.radioLabelSelected]}
			>
				{label}
			</Text>
			{!selected && (
				<Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
			)}
			{selected && (
				<Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
			)}
		</TouchableOpacity>
	);
}

function QuestionView({
	question,
	currentIndex,
	total,
	selectedAnswerId,
	onSelectAnswer,
	onSubmit,
	onSkip,
	isSubmitting,
}: {
	question: ListeningQuestion;
	currentIndex: number;
	total: number;
	selectedAnswerId: string | null;
	onSelectAnswer: (id: string) => void;
	onSubmit: () => void;
	onSkip: () => void;
	isSubmitting: boolean;
}) {
	return (
		<>
			<View style={styles.badgeRow}>
				<View style={styles.badge}>
					<Ionicons name="headset" size={14} color={Colors.primary} />
					<Text style={styles.badgeText}>{question.question}</Text>
				</View>
				<View style={styles.progressPill}>
					<Text style={styles.progressPillText}>
						{currentIndex + 1} dari {total}
					</Text>
				</View>
			</View>

			<View style={styles.progressTrack}>
				<View
					style={[
						styles.progressFill,
						{ width: `${((currentIndex + 1) / total) * 100}%` },
					]}
				/>
			</View>

			<View style={styles.section}>
				<Text style={styles.heading}>
					Dengarkan audio berikut dan pilih{"\n"}sumber bunyi yang tepat.
				</Text>
			</View>

			<AudioCard audioUrl={question.audioUrl} />
			<AccessibleNote />

			<View style={styles.optionsSection}>
				{question.options?.map((opt) => (
					<RadioOption
						key={opt.id}
						label={opt.text}
						selected={selectedAnswerId === opt.id}
						onSelect={() => onSelectAnswer(opt.id)}
					/>
				))}
			</View>

			<View style={styles.bottomAction}>
				<TouchableOpacity
					style={[
						styles.submitButton,
						(!selectedAnswerId || isSubmitting) && styles.submitButtonDisabled,
					]}
					activeOpacity={0.8}
					onPress={onSubmit}
					disabled={!selectedAnswerId || isSubmitting}
				>
					{isSubmitting ? (
						<ActivityIndicator size="small" color={Colors.surface} />
					) : (
						<>
							<Ionicons name="checkmark-circle" size={18} color={Colors.surface} />
							<Text style={styles.submitButtonText}>Periksa Jawaban</Text>
						</>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.skipButton}
					activeOpacity={0.8}
					onPress={onSkip}
					disabled={isSubmitting}
				>
					<Text style={styles.skipButtonText}>Lewati</Text>
				</TouchableOpacity>
			</View>
		</>
	);
}

export default function RecognitionScreen() {
	const { phase, loadModules, startSession, submitAnswer, skipQuestion } =
		useListeningSession();
	const { setRecognitionDone } = useExerciseProgress();
	const [pendingAnswerId, setPendingAnswerId] = useState<string | null>(null);
	const prevIndexRef = useRef<number | null>(null);

	useEffect(() => {
		if (phase.status === "idle") {
			loadModules();
		}
	}, [phase.status, loadModules]);

	const currentIndex =
		phase.status === "active"
			? (phase as Extract<typeof phase, { status: "active" }>).currentIndex
			: null;

	useEffect(() => {
		if (currentIndex !== prevIndexRef.current) {
			prevIndexRef.current = currentIndex;
			setPendingAnswerId(null);
		}
	}, [currentIndex]);

	useEffect(() => {
		if (phase.status === "done") {
			setRecognitionDone(phase.correctAnswers, phase.totalQuestions);
			router.push("/speaking");
		}
	}, [phase, setRecognitionDone]);

	const activePhase = phase;
	let content: React.ReactNode;

	if (
		activePhase.status === "idle" ||
		activePhase.status === "loading_modules"
	) {
		content = (
			<View style={styles.centerState}>
				<ActivityIndicator size="large" color={Colors.primary} />
				<Text style={styles.stateText}>Memuat modul...</Text>
			</View>
		);
	} else if (activePhase.status === "modules_error") {
		content = (
			<View style={styles.centerState}>
				<Ionicons name="alert-circle" size={40} color={Colors.error} />
				<Text style={styles.errorText}>{activePhase.message}</Text>
				<TouchableOpacity
					style={styles.retryButton}
					activeOpacity={0.8}
					onPress={loadModules}
				>
					<Text style={styles.retryButtonText}>Coba Lagi</Text>
				</TouchableOpacity>
			</View>
		);
	} else if (activePhase.status === "module_list") {
		content = (
			<View style={styles.moduleListSection}>
				<Text style={styles.sectionTitle}>Pilih Modul</Text>
				<Text style={styles.sectionSubtitle}>
					Latih pendengaranmu dengan berbagai jenis suara
				</Text>
				{activePhase.modules.map((m) => (
					<ModuleCard
						key={m.id}
						module={m}
						onSelect={() => startSession(m.id)}
					/>
				))}
			</View>
		);
	} else if (activePhase.status === "starting_session") {
		content = (
			<View style={styles.centerState}>
				<ActivityIndicator size="large" color={Colors.primary} />
				<Text style={styles.stateText}>Memulai sesi...</Text>
			</View>
		);
	} else if (
		activePhase.status === "active" ||
		activePhase.status === "submitting_answer" ||
		activePhase.status === "completing"
	) {
		const isSubmitting =
			activePhase.status === "submitting_answer" ||
			activePhase.status === "completing";
		const active = activePhase as Extract<
			typeof activePhase,
			{ status: "active" }
		>;
		const q: ListeningQuestion =
			active.questions[active.currentIndex];

		content = (
			<QuestionView
				question={q}
				currentIndex={active.currentIndex}
				total={active.total}
				selectedAnswerId={
					pendingAnswerId ??
					(active.answers.get(q.id)?.answerId ?? null)
				}
				onSelectAnswer={(id) => {
					if (activePhase.status !== "active") return;
					setPendingAnswerId(id);
				}}
				onSubmit={() => {
					if (activePhase.status !== "active" || !pendingAnswerId) return;
					submitAnswer(q.id, pendingAnswerId);
				}}
				onSkip={() => {
					if (activePhase.status !== "active") return;
					skipQuestion(q.id);
				}}
				isSubmitting={isSubmitting}
			/>
		);
	} else {
		content = (
			<View style={styles.centerState}>
				<ActivityIndicator size="large" color={Colors.primary} />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				{content}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: Colors.background },
	scrollView: { flex: 1 },
	scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
	centerState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 80,
		gap: Spacing.md,
	},
	stateText: {
		fontSize: FontSize.md,
		color: Colors.textSecondary,
	},
	errorText: {
		fontSize: FontSize.md,
		color: Colors.error,
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: Colors.primary,
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.sm,
		borderRadius: Radius.md,
	},
	retryButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.surface,
	},
	moduleListSection: { gap: Spacing.md },
	sectionTitle: {
		fontSize: FontSize.xl,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: Spacing.xs,
	},
	sectionSubtitle: {
		fontSize: FontSize.md,
		color: Colors.textSecondary,
		marginBottom: Spacing.sm,
	},
	moduleCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.surface,
		borderRadius: Radius.lg,
		padding: Spacing.md,
		gap: Spacing.md,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	moduleCardIcon: {
		width: 44,
		height: 44,
		borderRadius: Radius.md,
		backgroundColor: Colors.secondary + "22",
		alignItems: "center",
		justifyContent: "center",
	},
	moduleCardInfo: { flex: 1 },
	moduleCardTitle: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.text,
		marginBottom: 2,
	},
	moduleCardMeta: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	badgeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Spacing.sm,
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	badgeText: {
		fontSize: FontSize.sm,
		fontWeight: "600",
		color: Colors.primary,
		letterSpacing: 0.14,
	},
	progressPill: {
		backgroundColor: Colors.surface,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	progressPillText: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: Colors.textSecondary,
	},
	progressTrack: {
		height: 8,
		backgroundColor: Colors.surface,
		borderRadius: 999,
		marginBottom: Spacing.lg,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: Colors.primary,
		borderRadius: 999,
	},
	section: { marginBottom: Spacing.lg },
	heading: {
		fontSize: FontSize.xl,
		fontWeight: "600",
		color: Colors.text,
		lineHeight: 28,
	},
	audioCard: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.lg,
		padding: Spacing.lg,
		alignItems: "center",
		marginBottom: Spacing.md,
	},
	audioStatus: {
		fontSize: FontSize.sm,
		fontWeight: "600",
		color: Colors.primary,
		textAlign: "center",
		marginBottom: Spacing.md,
	},
	equalizerRow: {
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "center",
		gap: 6,
		height: 40,
		marginBottom: Spacing.md,
	},
	equalizerBar: {
		width: 6,
		borderRadius: 999,
	},
	playButtonWrapper: {
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.sm,
	},
	playAura: {
		position: "absolute",
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: Colors.secondary,
		opacity: 0.4,
	},
	playButton: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	helperBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: Colors.secondary + "22",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 999,
	},
	helperText: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: Colors.textSecondary,
	},
	accessibleNote: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: Colors.secondary + "22",
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.sm,
		borderRadius: Radius.md,
		marginBottom: Spacing.lg,
	},
	accessibleNoteText: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: Colors.textSecondary,
		flex: 1,
	},
	optionsSection: {
		gap: Spacing.sm,
		marginBottom: Spacing.lg,
	},
	radioOption: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.surface,
		borderRadius: Radius.lg,
		paddingVertical: 17,
		paddingHorizontal: Spacing.md,
		gap: 12,
	},
	radioOptionSelected: {
		backgroundColor: Colors.secondary + "44",
	},
	radioCircle: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: Colors.border,
		alignItems: "center",
		justifyContent: "center",
	},
	radioCircleSelected: {
		borderColor: Colors.primary,
		backgroundColor: Colors.primary,
	},
	radioDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: Colors.surface,
	},
	radioLabel: {
		flex: 1,
		fontSize: FontSize.md,
		color: Colors.text,
	},
	radioLabelSelected: {
		fontWeight: "600",
	},
	bottomAction: {
		gap: Spacing.sm,
	},
	submitButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: Colors.primary,
		paddingVertical: Spacing.md,
		borderRadius: Radius.md,
		minHeight: 52,
	},
	submitButtonDisabled: {
		opacity: 0.5,
	},
	submitButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.surface,
		letterSpacing: 0.16,
	},
	skipButton: {
		alignItems: "center",
		paddingVertical: Spacing.sm,
	},
	skipButtonText: {
		fontSize: FontSize.sm,
		fontWeight: "500",
		color: Colors.textSecondary,
	},
});
