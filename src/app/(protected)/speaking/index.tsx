/** @format */

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { router } from "expo-router";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
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
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import { useSpeakingSession } from "@/hooks/useSpeakingSession";
import type { Sentence } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";

const WAVEFORM_BARS = [8, 12, 8, 16, 8, 12, 8];

function SyllableBox({
	syllable,
	stressed = false,
}: {
	syllable: string;
	stressed?: boolean;
}) {
	return (
		<View
			style={[
				styles.syllableBox,
				stressed ? styles.syllableBoxHighlighted : styles.syllableBoxNormal,
			]}
		>
			<Text
				style={[
					styles.syllableText,
					stressed && styles.syllableTextHighlighted,
				]}
			>
				{syllable}
			</Text>

			{stressed && <View style={styles.stressIndicator} />}
		</View>
	);
}

function WordBreak() {
	return (
		<View style={styles.wordBreak} accessibilityLabel="Jeda antar kata">
			<View style={styles.wordBreakLine} />
		</View>
	);
}

function SentenceCard({
	sentence,
}: {
	sentence: Sentence;
	currentIndex: number;
	total: number;
	hasRecording: boolean;
}) {
	return (
		<View style={styles.wordCard}>
			<Text style={styles.mainWord}>{sentence.text}</Text>

			<Text style={styles.syllableGuideLabel}>
				Panduan ketukan ritme suku kata
			</Text>

			<View style={styles.syllableRow}>
				{(sentence.syllables ?? []).map((syl, i) => {
					if (syl.break) {
						return <WordBreak key={`break-${i}`} />;
					}

					if (!syl.text) {
						return null;
					}

					return (
						<SyllableBox
							key={`syllable-${i}`}
							syllable={syl.text}
							stressed={Boolean(syl.stress)}
						/>
					);
				})}
			</View>

			<View style={styles.stressLegend}>
				<View style={styles.stressLegendDot} />
				<Text style={styles.stressLegendText}>
					Suku kata berwarna menunjukkan penekanan
				</Text>
			</View>

			<TouchableOpacity
				style={styles.playAudioButton}
				activeOpacity={0.8}
				accessibilityRole="button"
				accessibilityLabel="Dengarkan contoh suara"
			>
				<Ionicons name="play-circle" size={22} color={Colors.primary} />
				<Text style={styles.playAudioText}>Dengarkan contoh suara</Text>
			</TouchableOpacity>

			<AudioVisualizer variant="wave" heights={WAVEFORM_BARS} />
		</View>
	);
}

function RecordingZone({
	isRecording,
	hasRecording,
	duration,
	metering,
	onStartRecording,
}: {
	isRecording: boolean;
	hasRecording: boolean;
	duration: number;
	metering: number | null;
	onStartRecording: () => void;
}) {
	const formatTime = (ms: number) => {
		const totalSec = Math.floor(ms / 1000);
		const min = Math.floor(totalSec / 60);
		const sec = totalSec % 60;

		return `${min.toString().padStart(2, "0")}:${sec
			.toString()
			.padStart(2, "0")}`;
	};

	const normalizedMetering =
		metering !== null ? Math.max(0, Math.min(1, (metering + 60) / 60)) : 0.3;

	return (
		<View style={styles.recordingZone}>
			<View style={styles.timerRow}>
				<Text style={styles.timerText}>{formatTime(duration)}</Text>

				<Text style={styles.timerHint}>
					{hasRecording
						? "Rekaman siap dikirim"
						: isRecording
							? "Ketuk STOP jika selesai merekam"
							: "Ketuk untuk mulai merekam"}
				</Text>
			</View>

			<View style={styles.liveWaveRow}>
				{WAVEFORM_BARS.map((baseHeight, i) => {
					const scaledHeight = isRecording
						? Math.max(
								4,
								baseHeight * (0.4 + normalizedMetering * 0.8 + (i % 2) * 0.2),
							)
						: baseHeight * 0.5;

					return (
						<View
							key={i}
							style={[
								styles.liveWaveBar,
								{
									height: scaledHeight,
									opacity: isRecording ? 1 : 0.3,
								},
							]}
						/>
					);
				})}
			</View>

			<View style={styles.recordButtonArea}>
				<View style={styles.recordShadowRing} />

				<TouchableOpacity
					style={[
						styles.recordButton,
						isRecording && styles.recordButtonRecording,
					]}
					activeOpacity={0.8}
					onPress={onStartRecording}
					accessibilityRole="button"
					accessibilityLabel={
						isRecording ? "Berhenti merekam" : "Mulai merekam"
					}
				>
					<Ionicons
						name={isRecording ? "stop" : "mic"}
						size={21}
						color={Colors.surface}
					/>

					<Text style={styles.recordButtonText}>
						{isRecording ? "STOP" : "REKAM"}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

export default function SpeakingScreen() {
	const { phase, loadModules, startSession, submitAttempt, skipSentence } =
		useSpeakingSession();

	const { setSpeakingDone } = useExerciseProgress();
	const recorder = useAudioRecorder();

	const [hasRecording, setHasRecording] = useState(false);
	const [recordingUri, setRecordingUri] = useState<string | null>(null);

	const prevIndexRef = useRef<number | null>(null);

	useEffect(() => {
		if (phase.status === "idle") {
			loadModules();
		}
	}, [phase.status, loadModules]);

	useEffect(() => {
		if (phase.status === "done") {
			setSpeakingDone(1, phase.totalSentences);
			router.push("/completion");
		}
	}, [phase, setSpeakingDone]);

	const currentIndex = phase.status === "active" ? phase.currentIndex : null;

	useEffect(() => {
		if (currentIndex !== prevIndexRef.current) {
			prevIndexRef.current = currentIndex;

			if (recorder.isRecording) {
				void recorder.stopRecording();
			}

			setHasRecording(false);
			setRecordingUri(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentIndex]);

	const handleStartRecording = async () => {
		if (recorder.isRecording) {
			const uri = await recorder.stopRecording();
			setRecordingUri(uri);
			setHasRecording(Boolean(uri));
		} else {
			await recorder.startRecording();
		}
	};

	const handleSubmit = () => {
		if (phase.status !== "active" || !hasRecording) {
			return;
		}

		const sentence = phase.sentences[phase.currentIndex];
		const uri = recordingUri ?? "file:///tmp/mock-recording.m4a";

		submitAttempt(sentence.id, uri);
	};

	const handleSkip = () => {
		if (phase.status !== "active") {
			return;
		}

		const sentence = phase.sentences[phase.currentIndex];
		skipSentence(sentence.id);
	};

	const activePhase = phase;
	let content: ReactNode;

	if (
		activePhase.status === "idle" ||
		activePhase.status === "loading_modules"
	) {
		content = (
			<CenterState>
				<ActivityIndicator size="large" color={Colors.primary} />
				<Text style={styles.stateText}>Memuat modul...</Text>
			</CenterState>
		);
	} else if (activePhase.status === "modules_error") {
		content = (
			<CenterState>
				<Ionicons name="alert-circle" size={40} color={Colors.error} />
				<Text style={styles.errorText}>{activePhase.message}</Text>

				<ActionButton variant="retry" onPress={loadModules}>
					<ActionButtonText variant="retry">Coba Lagi</ActionButtonText>
				</ActionButton>
			</CenterState>
		);
	} else if (activePhase.status === "answer_error") {
		content = (
			<CenterState>
				<Ionicons name="alert-circle" size={40} color={Colors.error} />
				<Text style={styles.errorText}>{activePhase.message}</Text>

				<ActionButton
					variant="retry"
					onPress={() => {
						if (phase.status === "active") {
							const sentence = phase.sentences[phase.currentIndex];

							skipSentence(sentence.id);
						}
					}}
				>
					<ActionButtonText variant="retry">Coba Lagi</ActionButtonText>
				</ActionButton>
			</CenterState>
		);
	} else if (activePhase.status === "module_list") {
		content = (
			<View style={styles.moduleListSection}>
				<View style={styles.moduleListHeader}>
					<View style={styles.moduleListHeading}>
						<Text style={styles.sectionTitle}>Pilih Modul</Text>
						<Text style={styles.sectionSubtitle}>
							Pilih latihan sesuai kemampuanmu
						</Text>
					</View>

					<View style={styles.moduleCountBadge}>
						<Text style={styles.moduleCountText}>
							{activePhase.modules.length} modul
						</Text>
					</View>
				</View>

				{activePhase.modules.map((module) => (
					<SharedModuleCard
						key={module.id}
						title={module.title ?? module.label}
						description={module.description}
						icon="mic-outline"
						meta={[
							{
								icon: "document-text-outline",
								label: `${module.sentence_count} kalimat`,
							},
							{
								icon: "time-outline",
								label: `${module.estimated_minutes} menit`,
							},
						]}
						difficulty={module.difficulty}
						onPress={() => startSession(module.id)}
					/>
				))}
			</View>
		);
	} else if (
		activePhase.status === "starting_session" ||
		activePhase.status === "submitting" ||
		activePhase.status === "completing"
	) {
		content = (
			<CenterState>
				<ActivityIndicator size="large" color={Colors.primary} />
				<Text style={styles.stateText}>
					{activePhase.status === "completing"
						? "Menyelesaikan sesi..."
						: activePhase.status === "starting_session"
							? "Memulai sesi..."
							: "Mengirim rekaman..."}
				</Text>
			</CenterState>
		);
	} else if (activePhase.status === "active") {
		const active = activePhase;
		const sentence: Sentence = active.sentences[active.currentIndex];

		const progress =
			active.total > 0 ? (active.currentIndex + 1) / active.total : 0;

		content = (
			<>
				<BadgeRow
					label="Latihan Bicara"
					progressText={`${active.currentIndex + 1} dari ${active.total}`}
					paddingTop={16}
				/>

				<ProgressBar progress={progress} />

				<SentenceCard
					sentence={sentence}
					currentIndex={active.currentIndex}
					total={active.total}
					hasRecording={hasRecording}
				/>

				<RecordingZone
					isRecording={recorder.isRecording}
					hasRecording={hasRecording}
					duration={recorder.duration}
					metering={recorder.metering}
					onStartRecording={handleStartRecording}
				/>

				<View style={styles.actionButtons}>
					<ActionButton
						variant="primary"
						onPress={handleSubmit}
						disabled={!hasRecording}
					>
						<Ionicons
							name="checkmark-circle-outline"
							size={19}
							color={Colors.surface}
						/>
						<ActionButtonText variant="primary" disabled={!hasRecording}>
							Periksa Suara
						</ActionButtonText>
					</ActionButton>

					<ActionButton variant="secondary" onPress={handleSkip}>
						<Ionicons
							name="play-forward-outline"
							size={16}
							color={Colors.textSecondary}
						/>
						<ActionButtonText variant="secondary">
							Lewati kata ini
						</ActionButtonText>
					</ActionButton>
				</View>
			</>
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
			>
				{content}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: Colors.secondary + "22",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
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
		paddingTop: Spacing.md,
		paddingBottom: Spacing.lg,
	},
	moduleListHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: Spacing.lg,
		gap: Spacing.sm,
	},
	moduleListHeading: {
		flex: 1,
		gap: Spacing.xs,
	},
	sectionTitle: {
		fontSize: FontSize.xl,
		fontWeight: "700",
		color: Colors.text,
	},
	sectionSubtitle: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
		lineHeight: 20,
	},
	moduleCountBadge: {
		backgroundColor: Colors.surface,
		borderWidth: 1,
		borderColor: Colors.border,
		paddingHorizontal: Spacing.sm,
		paddingVertical: 6,
		borderRadius: Radius.full,
	},
	moduleCountText: {
		fontSize: FontSize.xs,
		fontWeight: "600",
		color: Colors.textSecondary,
	},
	wordCard: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.lg,
		padding: Spacing.lg,
		alignItems: "center",
		marginBottom: Spacing.md,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	mainWord: {
		fontSize: 28,
		fontWeight: "700",
		color: Colors.text,
		textAlign: "center",
		marginBottom: Spacing.xs,
	},
	syllableGuideLabel: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: Colors.textSecondary,
		textAlign: "center",
		marginBottom: Spacing.md,
	},
	syllableRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: Spacing.md,
		paddingVertical: Spacing.xs,
	},
	syllableBox: {
		minWidth: 44,
		minHeight: 48,
		borderRadius: Radius.md,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		overflow: "hidden",
	},
	syllableBoxNormal: {
		backgroundColor: Colors.secondary + "18",
		borderColor: Colors.border,
	},
	syllableBoxHighlighted: {
		backgroundColor: Colors.primary,
		borderColor: Colors.primary,
	},
	syllableText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.text,
		paddingHorizontal: 10,
		paddingTop: 8,
		paddingBottom: 6,
	},
	syllableTextHighlighted: {
		color: Colors.surface,
		fontWeight: "700",
	},
	stressIndicator: {
		width: 16,
		height: 3,
		borderRadius: Radius.full,
		backgroundColor: Colors.surface,
		marginBottom: 5,
	},
	wordBreak: {
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: 3,
		minWidth: 30,
		paddingHorizontal: 2,
	},
	wordBreakLine: {
		width: 16,
		height: 1,
		backgroundColor: Colors.textSecondary,
		opacity: 0.4,
	},
	wordBreakText: {
		fontSize: 8,
		fontWeight: "700",
		color: Colors.textSecondary,
		letterSpacing: 0.5,
	},
	stressLegend: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		marginBottom: Spacing.lg,
	},
	stressLegendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: Colors.primary,
	},
	stressLegendText: {
		fontSize: FontSize.xs,
		color: Colors.textSecondary,
	},
	playAudioButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: Colors.secondary + "22",
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.sm,
		borderRadius: Radius.md,
		marginBottom: Spacing.md,
	},
	playAudioText: {
		fontSize: FontSize.sm,
		fontWeight: "600",
		color: Colors.primary,
	},
	recordingZone: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.lg,
		padding: Spacing.lg,
		alignItems: "center",
		marginBottom: Spacing.md,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	timerRow: {
		alignItems: "center",
		marginBottom: Spacing.md,
	},
	timerText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.text,
		marginBottom: 4,
	},
	timerHint: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: Colors.textSecondary,
		textAlign: "center",
		paddingHorizontal: 20,
	},
	liveWaveRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		marginBottom: Spacing.lg,
		height: 32,
	},
	liveWaveBar: {
		width: 4,
		backgroundColor: Colors.primary,
		borderRadius: Radius.full,
	},
	recordButtonArea: {
		alignItems: "center",
		justifyContent: "center",
		height: 120,
	},
	recordShadowRing: {
		position: "absolute",
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: Colors.primary,
		opacity: 0.08,
	},
	recordButton: {
		width: 104,
		height: 104,
		borderRadius: 52,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
	},
	recordButtonRecording: {
		backgroundColor: Colors.error,
	},
	recordButtonText: {
		fontSize: 10,
		fontWeight: "700",
		color: Colors.surface,
		letterSpacing: 0.5,
	},
	actionButtons: {
		marginBottom: Spacing.lg,
	},
});
