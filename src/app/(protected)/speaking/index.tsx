/** @format */

import { useEffect, useState, useRef } from "react";
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
import { useSpeakingSession } from "@/hooks/useSpeakingSession";
import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import type { SpeakingModule, SpeakingSentence } from "@/types/api";

const WAVEFORM_BARS = [8, 12, 8, 16, 8, 12, 8];

function ModuleCard({
	module,
	onSelect,
}: {
	module: SpeakingModule;
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
				<Ionicons name="mic" size={20} color={Colors.primary} />
			</View>
			<View style={styles.moduleCardInfo}>
				<Text style={styles.moduleCardTitle}>{module.name}</Text>
				<Text style={styles.moduleCardMeta}>
					{module.sentence_count} kalimat · {difficultyLabel}
				</Text>
			</View>
			<Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
		</TouchableOpacity>
	);
}

function SyllableBox({
	syllable,
	highlighted,
	divider,
}: {
	syllable: string;
	highlighted?: boolean;
	divider?: boolean;
}) {
	return (
		<View style={styles.syllableWrapper}>
			<View
				style={[
					styles.syllableBox,
					highlighted
						? styles.syllableBoxHighlighted
						: styles.syllableBoxNormal,
				]}
			>
				<Text
					style={[
						styles.syllableText,
						highlighted ? styles.syllableTextHighlighted : null,
					]}
				>
					{syllable}
				</Text>
			</View>
			{divider && <View style={styles.divider} />}
		</View>
	);
}

function SentenceCard({
	sentence,
	currentIndex,
	total,
	hasRecording,
}: {
	sentence: SpeakingSentence;
	currentIndex: number;
	total: number;
	hasRecording: boolean;
}) {
	return (
		<View style={styles.wordCard}>
			<Text style={styles.mainWord}>{sentence.text}</Text>
			<Text style={styles.syllableGuideLabel}>
				Panduan ketukan ritme suku kata:
			</Text>
			<View style={styles.syllableRow}>
				{(sentence.syllables ?? []).map((syl, i) => (
					<SyllableBox
						key={i}
						syllable={syl.text}
						highlighted={syl.highlighted}
						divider={i < (sentence.syllables?.length ?? 0) - 1}
					/>
				))}
			</View>
			<TouchableOpacity style={styles.playAudioButton} activeOpacity={0.8}>
				<Ionicons name="play" size={15} color={Colors.primary} />
				<Text style={styles.playAudioText}>Dengarkan contoh suara</Text>
			</TouchableOpacity>
			<View style={styles.staticWaveRow}>
				{WAVEFORM_BARS.map((h, i) => (
					<View key={i} style={[styles.waveBar, { height: h }]} />
				))}
			</View>
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
		return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
	};

	const normalizedMetering = metering !== null
		? Math.max(0, (metering + 60) / 60)
		: 0.3;

	const BASE_BARS = [8, 12, 8, 16, 8, 12, 8];

	return (
		<View style={styles.recordingZone}>
			<View style={styles.timerRow}>
				<Text style={styles.timerText}>{formatTime(duration)}</Text>
				<Text style={styles.timerHint}>
					{hasRecording
						? "Rekaman siap dikirim"
						: isRecording
							? "Ketuk STOP jika selesai merekam"
							: "Ketuk untuk mulai merekam."}
				</Text>
			</View>
			<View style={styles.liveWaveRow}>
				{BASE_BARS.map((baseH, i) => {
					const scaled = isRecording
						? Math.max(4, baseH * (0.4 + normalizedMetering * 0.8 + (i % 2) * 0.2))
						: baseH * 0.5;
					return (
						<View
							key={i}
							style={[
								styles.liveWaveBar,
								{
									height: scaled,
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
					style={[styles.recordButton, isRecording && styles.recordButtonRecording]}
					activeOpacity={0.8}
					onPress={onStartRecording}
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

	const currentIndex =
		phase.status === "active"
			? (phase as Extract<typeof phase, { status: "active" }>).currentIndex
			: null;

	useEffect(() => {
		if (currentIndex !== prevIndexRef.current) {
			prevIndexRef.current = currentIndex;
			if (recorder.isRecording) {
				recorder.stopRecording();
			}
			setHasRecording(false);
			setRecordingUri(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- recorder is a stable ref from useAudioRecorder
	}, [currentIndex]);

	const handleStartRecording = async () => {
		if (recorder.isRecording) {
			const uri = await recorder.stopRecording();
			setRecordingUri(uri);
			setHasRecording(!!uri);
		} else {
			await recorder.startRecording();
		}
	};

	const handleSubmit = async () => {
		const current = phase;
		if (current.status !== "active") return;
		const sentence = current.sentences[current.currentIndex];
		const uri = recordingUri ?? "file:///tmp/mock-recording.m4a";
		submitAttempt(sentence.id, uri);
	};

	const handleSkip = () => {
		if (phase.status !== "active") return;
		const sentence = (phase as Extract<typeof phase, { status: "active" }>).sentences[
			(phase as Extract<typeof phase, { status: "active" }>).currentIndex
		];
		skipSentence(sentence.id);
	};

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
	} else if (activePhase.status === "answer_error") {
		content = (
			<View style={styles.centerState}>
				<Ionicons name="alert-circle" size={40} color={Colors.error} />
				<Text style={styles.errorText}>{activePhase.message}</Text>
				<TouchableOpacity
					style={styles.retryButton}
					activeOpacity={0.8}
					onPress={() => {
						const current = phase;
						if (current.status === "active") {
							const sentence = current.sentences[current.currentIndex];
							skipSentence(sentence.id);
						}
					}}
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
					Latih pelafalan kata dan kalimat
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
	} else if (
		activePhase.status === "starting_session" ||
		activePhase.status === "submitting" ||
		activePhase.status === "completing"
	) {
		content = (
			<View style={styles.centerState}>
				<ActivityIndicator size="large" color={Colors.primary} />
				<Text style={styles.stateText}>
					{activePhase.status === "completing"
						? "Menyelesaikan sesi..."
						: activePhase.status === "starting_session"
							? "Memulai sesi..."
							: "Mengirim rekaman..."}
				</Text>
			</View>
		);
	} else if (activePhase.status === "active") {
		const active = activePhase as Extract<typeof activePhase, { status: "active" }>;
		const sentence: SpeakingSentence = active.sentences[active.currentIndex];

		content = (
			<>
				<View style={styles.badgeRow}>
					<View style={styles.badge}>
						<Ionicons name="mic" size={14} color={Colors.primary} />
						<Text style={styles.badgeText}>{sentence.text}</Text>
					</View>
					<View style={styles.progressPill}>
						<Text style={styles.progressPillText}>
							{active.currentIndex + 1} dari {active.total}
						</Text>
					</View>
				</View>

				<View style={styles.progressTrack}>
					<View
						style={[
							styles.progressFill,
							{ width: `${((active.currentIndex + 1) / active.total) * 100}%` },
						]}
					/>
				</View>

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
					<TouchableOpacity
						style={[
							styles.primaryButton,
							(!hasRecording || phase.status !== "active") &&
								styles.primaryButtonDisabled,
						]}
						activeOpacity={0.8}
						onPress={handleSubmit}
						disabled={!hasRecording || phase.status !== "active"}
					>
						{phase.status === "submitting" ? (
							<ActivityIndicator size="small" color={Colors.textSecondary} />
						) : (
							<>
								<Ionicons
									name="checkmark-circle-outline"
									size={15}
									color={Colors.textSecondary}
								/>
								<Text style={styles.primaryButtonText}>Periksa Suara</Text>
							</>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.secondaryButton}
						activeOpacity={0.8}
						onPress={handleSkip}
						disabled={phase.status !== "active"}
					>
						<Ionicons
							name="play-forward-outline"
							size={10}
							color={Colors.textSecondary}
						/>
						<Text style={styles.secondaryButtonText}>Lewati kata ini</Text>
					</TouchableOpacity>
				</View>
			</>
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
				showsVerticalScrollIndicator={false}
			>
				{content}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: Colors.secondary + "22" },
	scrollView: { flex: 1 },
	scrollContent: { paddingHorizontal: Spacing.lg },
	centerState: {
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
	moduleListSection: { gap: Spacing.md, paddingTop: Spacing.md },
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
		paddingTop: Spacing.md,
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
		borderRadius: Radius.full,
	},
	progressPillText: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: Colors.textSecondary,
	},
	progressTrack: {
		height: 8,
		backgroundColor: Colors.primary,
		borderRadius: Radius.full,
		marginBottom: Spacing.lg,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: Colors.primary,
		borderRadius: Radius.full,
	},
	wordCard: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.md,
		padding: Spacing.lg,
		alignItems: "center",
		marginBottom: Spacing.md,
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
		marginBottom: Spacing.lg,
	},
	syllableWrapper: {
		flexDirection: "row",
		alignItems: "center",
	},
	syllableBox: {
		borderRadius: Radius.sm,
		justifyContent: "center",
		alignItems: "center",
	},
	syllableBoxNormal: {
		backgroundColor: Colors.secondary + "22",
	},
	syllableBoxHighlighted: {
		backgroundColor: Colors.primary,
	},
	syllableText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.text,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	syllableTextHighlighted: {
		color: Colors.surface,
	},
	divider: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: Colors.textSecondary,
		marginHorizontal: 3,
		opacity: 0.4,
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
	staticWaveRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
	},
	waveBar: {
		width: 6,
		backgroundColor: Colors.primary,
		borderRadius: Radius.full,
	},
	recordingZone: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.md,
		padding: Spacing.lg,
		alignItems: "center",
		marginBottom: Spacing.md,
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
		backgroundColor: Colors.surface,
		opacity: 0.02,
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
	primaryButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: Colors.secondary + "22",
		paddingVertical: Spacing.md,
		borderRadius: Radius.md,
		marginBottom: Spacing.sm,
		minHeight: 52,
	},
	primaryButtonDisabled: {
		opacity: 0.5,
	},
	primaryButtonText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.textSecondary,
	},
	secondaryButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: Colors.secondary + "22",
		paddingVertical: Spacing.md,
		borderRadius: Radius.md,
	},
	secondaryButtonText: {
		fontSize: FontSize.sm,
		fontWeight: "500",
		color: Colors.textSecondary,
	},
});
