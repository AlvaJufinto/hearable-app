/** @format */

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { router } from "expo-router";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	ActionButton,
	ActionButtonText,
	AudioVisualizer,
	BadgeRow,
	CenterState,
	ModuleCard as SharedModuleCard,
	ProgressBar,
} from "@/components/modules";
import Text from "@/components/ui/Text";
import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import { useListeningSession } from "@/hooks/useListeningSession";
import type { ListeningQuestion } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";

const EQUALIZER_HEIGHTS = [16, 28, 36, 20, 32, 40, 24, 32, 16, 8, 8];

function formatTime(ms: number) {
	const totalSec = Math.floor(ms / 1000);
	const min = Math.floor(totalSec / 60);
	const sec = totalSec % 60;

	return `${min.toString().padStart(2, "0")}:${sec
		.toString()
		.padStart(2, "0")}`;
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
		if (status !== "playing") return;

		const interval = setInterval(() => {
			setBarIndex((index) => (index + 1) % EQUALIZER_HEIGHTS.length);
		}, 150);

		return () => clearInterval(interval);
	}, [status]);

	const isPlaying = status === "playing";
	const progressText =
		duration > 0
			? `${formatTime(position)} / ${formatTime(duration)}`
			: "Memuat audio...";

	return (
		<View style={styles.audioCard}>
			<Text style={styles.audioStatus}>
				{isPlaying ? `Memutar Suara... (${progressText})` : "Siap diputar"}
			</Text>

			<AudioVisualizer
				variant="equalizer"
				heights={EQUALIZER_HEIGHTS.map((height, index) =>
					isPlaying
						? EQUALIZER_HEIGHTS[(index + barIndex) % EQUALIZER_HEIGHTS.length]
						: height * 0.6,
				)}
			/>

			<View style={styles.playButtonWrapper}>
				<View style={styles.playAura} />

				<TouchableOpacity
					style={styles.playButton}
					activeOpacity={0.8}
					onPress={() => {
						if (audioUrl) loadAudio(audioUrl);
					}}
					disabled={!audioUrl}
					accessibilityRole="button"
					accessibilityLabel="Putar ulang audio"
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
				Tersedia petunjuk teks jika kamu tidak dapat mendengar suara dengan
				jelas.
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
			accessibilityRole="radio"
			accessibilityState={{ selected: Boolean(selected) }}
		>
			<View
				style={[styles.radioCircle, selected && styles.radioCircleSelected]}
			>
				{selected ? <View style={styles.radioDot} /> : null}
			</View>

			<Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
				{label}
			</Text>

			<Ionicons
				name={selected ? "checkmark-circle" : "chevron-forward"}
				size={selected ? 16 : 14}
				color={selected ? Colors.primary : Colors.textSecondary}
			/>
		</TouchableOpacity>
	);
}

function TextAnswerInput({
	value,
	onChangeText,
	placeholder,
	editable = true,
}: {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	editable?: boolean;
}) {
	return (
		<TextInput
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder ?? "Tulis jawabanmu di sini..."}
			placeholderTextColor={Colors.disabled}
			style={[styles.textInput, !editable && styles.textInputReadonly]}
			multiline={false}
			autoCapitalize="none"
			autoCorrect={false}
			returnKeyType="done"
			editable={editable}
			accessibilityLabel="Jawaban teks"
		/>
	);
}

type QuestionViewProps = {
	question: ListeningQuestion;
	currentIndex: number;
	total: number;
	selectedAnswerId: string | null;
	onSelectAnswer: (id: string) => void;
	textAnswer: string;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
	onSkip: () => void;
	onPrevious: () => void;
	onNext: () => void;
	canGoPrevious: boolean;
	canGoNext: boolean;
	isAnswered: boolean;
	isSubmitting?: boolean;
};

function QuestionView({
	question,
	currentIndex,
	total,
	selectedAnswerId,
	onSelectAnswer,
	textAnswer,
	onChangeText,
	onSubmit,
	onSkip,
	onPrevious,
	onNext,
	canGoPrevious,
	canGoNext,
	isAnswered,
	isSubmitting,
}: QuestionViewProps) {
	const isTextQuestion = question.type === "input";

	const hasAnswer = isTextQuestion
		? textAnswer.trim().length > 0
		: Boolean(selectedAnswerId);

	return (
		<>
			<BadgeRow
				label={question.question}
				progressText={`${currentIndex + 1} dari ${total}`}
			/>

			<ProgressBar progress={total > 0 ? (currentIndex + 1) / total : 0} />

			<View style={styles.section}>
				<Text style={styles.heading}>{question.audio.hint_text}</Text>
			</View>

			<AudioCard audioUrl={question.audio.url} />
			<AccessibleNote />

			<View style={styles.optionsSection}>
				{isTextQuestion ? (
					<TextAnswerInput
						value={textAnswer}
						onChangeText={onChangeText}
						editable={!isAnswered}
					/>
				) : (
					question.options?.map((option) => (
						<RadioOption
							key={option.id}
							label={option.text}
							selected={selectedAnswerId === option.id}
							onSelect={() => onSelectAnswer(option.id)}
						/>
					))
				)}
			</View>

			<View style={styles.navigationActions}>
				<ActionButton
					variant="secondary"
					onPress={onPrevious}
					disabled={!canGoPrevious || isSubmitting}
				>
					<Ionicons name="arrow-back" size={16} color={Colors.text} />
					<ActionButtonText variant="secondary">Sebelumnya</ActionButtonText>
				</ActionButton>

				{canGoNext && (
					<ActionButton
						variant="secondary"
						onPress={onNext}
						disabled={isSubmitting}
					>
						<ActionButtonText variant="secondary">Berikutnya</ActionButtonText>
						<Ionicons name="arrow-forward" size={16} color={Colors.text} />
					</ActionButton>
				)}
			</View>

			<View style={styles.bottomAction}>
				<ActionButton
					variant="primary"
					onPress={onSubmit}
					disabled={(!isAnswered && !hasAnswer) || Boolean(isSubmitting)}
				>
					{isSubmitting ? (
						<ActivityIndicator size="small" color={Colors.surface} />
					) : (
						<>
							<Ionicons
								name={isAnswered ? "arrow-forward-circle" : "checkmark-circle"}
								size={18}
								color={Colors.surface}
							/>
							<ActionButtonText variant="primary">
								{isAnswered ? "Lanjutkan" : "Periksa Jawaban"}
							</ActionButtonText>
						</>
					)}
				</ActionButton>

				{!isAnswered && (
					<ActionButton
						variant="secondary"
						onPress={onSkip}
						disabled={Boolean(isSubmitting)}
					>
						<ActionButtonText variant="secondary">Lewati</ActionButtonText>
					</ActionButton>
				)}
			</View>
		</>
	);
}

export default function RecognitionScreen() {
	const {
		phase,
		loadModules,
		startSession,
		submitAnswer,
		skipQuestion,
		previousQuestion,
		nextQuestion,
	} = useListeningSession();

	const { setRecognitionDone, getState } = useExerciseProgress();

	const [pendingAnswerId, setPendingAnswerId] = useState<string | null>(null);
	const [pendingTextAnswer, setPendingTextAnswer] = useState("");
	const prevIndexRef = useRef<number | null>(null);
	const completionHandledRef = useRef(false);

	useEffect(() => {
		if (phase.status === "idle") {
			loadModules();
		}
	}, [phase.status, loadModules]);

	const currentIndex = phase.status === "active" ? phase.currentIndex : null;

	useEffect(() => {
		if (phase.status !== "active") return;

		if (currentIndex !== prevIndexRef.current) {
			prevIndexRef.current = currentIndex;

			const question = phase.questions[phase.currentIndex];
			const savedAnswer = phase.answers.get(question.id);

			setPendingAnswerId(savedAnswer?.answerId ?? null);
			setPendingTextAnswer(savedAnswer?.textAnswer ?? "");
		}
	}, [phase, currentIndex]);

	useEffect(() => {
		if (phase.status !== "done" || completionHandledRef.current) return;

		completionHandledRef.current = true;

		console.log("[Recognition] Final score:", {
			correctAnswers: phase.correctAnswers,
			totalQuestions: phase.totalQuestions,
		});

		setRecognitionDone(phase.correctAnswers, phase.totalQuestions);

		console.log("[Recognition] Saved progress:", getState());

		router.replace("/completion");
	}, [phase, setRecognitionDone, getState]);

	let content: ReactNode;

	if (phase.status === "idle" || phase.status === "loading_modules") {
		content = (
			<CenterState>
				<ActivityIndicator size="large" color={Colors.primary} />
				<Text style={styles.stateText}>Memuat modul...</Text>
			</CenterState>
		);
	} else if (phase.status === "modules_error") {
		content = (
			<CenterState>
				<Ionicons name="alert-circle" size={40} color={Colors.error} />
				<Text style={styles.errorText}>{phase.message}</Text>

				<ActionButton variant="retry" onPress={loadModules}>
					<ActionButtonText variant="retry">Coba Lagi</ActionButtonText>
				</ActionButton>
			</CenterState>
		);
	} else if (phase.status === "module_list") {
		content = (
			<View style={styles.moduleListSection}>
				<View>
					<Text style={styles.sectionTitle}>Pilih Modul</Text>
					<Text style={styles.sectionSubtitle}>
						Latih pendengaranmu dengan berbagai jenis suara.
					</Text>
				</View>

				{phase.modules.map((module) => (
					<SharedModuleCard
						key={module.id}
						title={module.title}
						description={module.description}
						meta={[
							{
								label: `${module.question_count} soal`,
								icon: "document-text-outline",
							},
						]}
						difficulty={module.difficulty}
						onPress={() => {
							prevIndexRef.current = null;
							completionHandledRef.current = false;
							setPendingAnswerId(null);
							setPendingTextAnswer("");
							startSession(module.id);
						}}
					/>
				))}
			</View>
		);
	} else if (phase.status === "starting_session") {
		content = (
			<CenterState>
				<ActivityIndicator size="large" color={Colors.primary} />
				<Text style={styles.stateText}>Memulai sesi...</Text>
			</CenterState>
		);
	} else if (phase.status === "active") {
		const question: ListeningQuestion = phase.questions[phase.currentIndex];
		const savedAnswer = phase.answers.get(question.id);
		const isAnswered = Boolean(savedAnswer);

		content = (
			<QuestionView
				question={question}
				currentIndex={phase.currentIndex}
				total={phase.total}
				selectedAnswerId={pendingAnswerId ?? savedAnswer?.answerId ?? null}
				onSelectAnswer={setPendingAnswerId}
				textAnswer={pendingTextAnswer}
				onChangeText={setPendingTextAnswer}
				isAnswered={isAnswered}
				canGoPrevious={phase.currentIndex > 0}
				canGoNext={
					isAnswered && phase.currentIndex < phase.questions.length - 1
				}
				onPrevious={previousQuestion}
				onNext={nextQuestion}
				onSubmit={() => {
					if (isAnswered) {
						nextQuestion();
						return;
					}

					if (question.type === "input") {
						const answer = pendingTextAnswer.trim();
						if (!answer) return;

						submitAnswer(question.id, undefined, answer);
						return;
					}

					if (!pendingAnswerId) return;

					submitAnswer(question.id, pendingAnswerId);
				}}
				onSkip={() => skipQuestion(question.id)}
			/>
		);
	} else if (
		phase.status === "submitting_answer" ||
		phase.status === "completing"
	) {
		content = (
			<CenterState>
				<ActivityIndicator size="large" color={Colors.primary} />
				<Text style={styles.stateText}>
					{phase.status === "completing"
						? "Menyelesaikan sesi..."
						: "Mengirim jawaban..."}
				</Text>
			</CenterState>
		);
	} else if (phase.status === "answer_error") {
		content = (
			<CenterState>
				<Ionicons name="alert-circle" size={40} color={Colors.error} />
				<Text style={styles.errorText}>{phase.message}</Text>
				<ActionButton
					variant="retry"
					onPress={() => {
						prevIndexRef.current = null;
						loadModules();
					}}
				>
					<ActionButtonText variant="retry">Kembali ke Modul</ActionButtonText>
				</ActionButton>
			</CenterState>
		);
	} else {
		content = (
			<CenterState>
				<ActivityIndicator size="large" color={Colors.primary} />
			</CenterState>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{content}
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
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: Spacing.lg,
		paddingTop: Spacing.md,
		paddingBottom: Spacing.xl,
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
	moduleListSection: {
		gap: Spacing.md,
	},
	sectionTitle: {
		fontSize: FontSize.xl,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: Spacing.xs,
	},
	sectionSubtitle: {
		fontSize: FontSize.md,
		color: Colors.textSecondary,
		lineHeight: 22,
	},
	section: {
		marginBottom: Spacing.lg,
	},
	heading: {
		fontSize: FontSize.xl,
		fontWeight: "600",
		color: Colors.text,
		lineHeight: 28,
	},
	audioCard: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.lg,
		alignItems: "center",
		marginBottom: Spacing.md,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	audioStatus: {
		fontSize: FontSize.sm,
		fontWeight: "600",
		color: Colors.primary,
		textAlign: "center",
		marginBottom: Spacing.md,
	},
	playButtonWrapper: {
		alignItems: "center",
		justifyContent: "center",
		marginVertical: Spacing.md,
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
		borderRadius: Radius.full,
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
		lineHeight: 18,
	},
	optionsSection: {
		gap: Spacing.sm,
		marginBottom: Spacing.lg,
	},
	navigationActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: Spacing.sm,
		marginBottom: Spacing.md,
	},
	radioOption: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.surface,
		borderRadius: Radius.lg,
		paddingVertical: 17,
		paddingHorizontal: Spacing.md,
		gap: 12,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	radioOptionSelected: {
		backgroundColor: Colors.secondary + "44",
		borderColor: Colors.primary,
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
	textInput: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.lg,
		paddingHorizontal: Spacing.md,
		paddingVertical: 14,
		fontSize: FontSize.md,
		color: Colors.text,
		minHeight: 52,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	textInputReadonly: {
		opacity: 0.7,
	},
	bottomAction: {
		gap: Spacing.sm,
	},
});
