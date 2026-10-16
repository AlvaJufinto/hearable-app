/** @format */

import { useCallback, useEffect, useRef } from "react";

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
import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import { useSpeakingSession } from "@/hooks/useSpeakingSession";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import type { Sentence, SpeakingModule } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
	background: "#F6FAFA",
	surface: "#FFFFFF",
	primary: "#369FA6",
	primaryLight: "#E6F5F5",
	secondary: "#89D1D9",
	text: "#243638",
	muted: "#718184",
	border: "#DCE8E8",
	success: "#27866F",
	successLight: "#E8F6F0",
	warning: "#FCE289",
	danger: "#C24141",
	dangerLight: "#FDECEC",
};

function getObjectValue(source: unknown, keys: string[]): unknown {
	if (!source || typeof source !== "object") {
		return undefined;
	}

	const object = source as Record<string, unknown>;

	for (const key of keys) {
		const value = object[key];

		if (value !== undefined && value !== null) {
			return value;
		}
	}

	return undefined;
}

function getDisplayText(
	source: unknown,
	keys: string[],
	fallback: string,
): string {
	const value = getObjectValue(source, keys);

	if (typeof value === "string" && value.trim()) {
		return value;
	}

	if (typeof value === "number") {
		return String(value);
	}

	return fallback;
}

function getSentenceGuide(sentence: Sentence): string | null {
	const guide = getObjectValue(sentence, [
		"syllables",
		"syllable_guide",
		"syllableGuide",
		"pronunciation_guide",
		"pronunciationGuide",
	]);

	if (typeof guide === "string" && guide.trim()) {
		return guide;
	}

	if (Array.isArray(guide)) {
		const parts = guide
			.map((item) => {
				if (typeof item === "string") {
					return item;
				}

				return getDisplayText(item, ["text", "syllable", "value"], "");
			})
			.filter(Boolean);

		return parts.length > 0 ? parts.join(" · ") : null;
	}

	return null;
}

function PrimaryButton({
	label,
	icon,
	onPress,
	disabled = false,
	loading = false,
}: {
	label: string;
	icon: React.ComponentProps<typeof Ionicons>["name"];
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
}) {
	return (
		<TouchableOpacity
			activeOpacity={0.8}
			disabled={disabled || loading}
			onPress={onPress}
			style={[
				styles.primaryButton,
				(disabled || loading) && styles.disabledButton,
			]}
		>
			{loading ? (
				<ActivityIndicator color="#FFFFFF" />
			) : (
				<Ionicons name={icon} size={20} color="#FFFFFF" />
			)}

			<Text style={styles.primaryButtonText}>{label}</Text>
		</TouchableOpacity>
	);
}

export default function SpeakingScreen() {
	const {
		phase,
		loadModules,
		startSession,
		submitAttempt,
		skipSentence,
		reset,
	} = useSpeakingSession();

	const {
		transcript,
		isListening,
		isFinal,
		error: speechError,
		startListening,
		stopListening,
		resetTranscript,
	} = useSpeechToText();

	const { setSpeakingDone } = useExerciseProgress();

	const completionHandled = useRef(false);

	useEffect(() => {
		void loadModules();
	}, [loadModules]);

	useEffect(() => {
		if (phase.status === "active") {
			resetTranscript();
		}
	}, [
		phase.status,
		phase.status === "active" ? phase.currentIndex : -1,
		resetTranscript,
	]);

	useEffect(() => {
		if (phase.status !== "done" || completionHandled.current) {
			return;
		}

		completionHandled.current = true;

		setSpeakingDone(1, phase.totalSentences);
		router.push("/completion");
	}, [phase, setSpeakingDone]);

	const handleStartSession = useCallback(
		async (moduleId: string) => {
			completionHandled.current = false;
			resetTranscript();
			await startSession(moduleId);
		},
		[startSession, resetTranscript],
	);

	const handleToggleListening = useCallback(async () => {
		if (isListening) {
			stopListening();
			return;
		}

		resetTranscript();
		await startListening();
	}, [isListening, resetTranscript, startListening, stopListening]);

	const handleSubmit = useCallback(async () => {
		if (phase.status !== "active") {
			return;
		}

		if (isListening || !isFinal || !transcript.trim()) {
			return;
		}

		const sentence = phase.sentences[phase.currentIndex];

		if (!sentence) {
			return;
		}

		await submitAttempt(sentence.id, transcript.trim());
	}, [phase, isListening, isFinal, transcript, submitAttempt]);

	const handleSkip = useCallback(async () => {
		if (phase.status !== "active") {
			return;
		}

		const sentence = phase.sentences[phase.currentIndex];

		if (!sentence) {
			return;
		}

		if (isListening) {
			stopListening();
		}

		await skipSentence(sentence.id);
	}, [phase, isListening, stopListening, skipSentence]);

	const handleBackToModules = useCallback(() => {
		if (isListening) {
			stopListening();
		}

		resetTranscript();
		reset();
		void loadModules();
	}, [isListening, stopListening, resetTranscript, reset, loadModules]);

	const renderHeader = (subtitle: string) => (
		<View style={styles.header}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={() => {
					if (isListening) {
						stopListening();
					}

					router.back();
				}}
				style={styles.backButton}
			>
				<Ionicons name="chevron-back" size={24} color={COLORS.text} />
			</TouchableOpacity>

			<View style={styles.headerTextContainer}>
				<Text style={styles.headerTitle}>Latihan Berbicara</Text>

				<Text style={styles.headerSubtitle}>{subtitle}</Text>
			</View>
		</View>
	);

	const renderLoading = (message: string) => (
		<View style={styles.centerContainer}>
			<ActivityIndicator size="large" color={COLORS.primary} />

			<Text style={styles.loadingText}>{message}</Text>
		</View>
	);

	const renderError = (title: string, message: string, onRetry: () => void) => (
		<View style={styles.centerContainer}>
			<View style={styles.errorIconContainer}>
				<Ionicons name="alert-circle-outline" size={36} color={COLORS.danger} />
			</View>

			<Text style={styles.emptyTitle}>{title}</Text>

			<Text style={styles.emptyDescription}>{message}</Text>

			<PrimaryButton
				label="Coba Lagi"
				icon="refresh-outline"
				onPress={onRetry}
			/>
		</View>
	);

	const renderModuleList = (modules: SpeakingModule[]) => (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={styles.scrollContent}
		>
			<View style={styles.introCard}>
				<View style={styles.introIcon}>
					<Ionicons name="mic-outline" size={30} color={COLORS.primary} />
				</View>

				<Text style={styles.introTitle}>Ayo berlatih berbicara!</Text>

				<Text style={styles.introDescription}>
					Pilih modul, ucapkan kalimat yang ditampilkan, lalu periksa hasil
					transkripsi ucapanmu.
				</Text>
			</View>

			<Text style={styles.sectionTitle}>Pilih Modul</Text>

			{modules.length === 0 ? (
				<View style={styles.emptyCard}>
					<Ionicons name="book-outline" size={32} color={COLORS.muted} />

					<Text style={styles.emptyTitle}>Belum ada modul</Text>

					<Text style={styles.emptyDescription}>
						Modul latihan belum tersedia saat ini.
					</Text>

					<PrimaryButton
						label="Muat Ulang"
						icon="refresh-outline"
						onPress={() => void loadModules()}
					/>
				</View>
			) : (
				modules.map((module, index) => {
					const title = getDisplayText(
						module,
						["title", "name", "module_name", "moduleName"],
						`Modul ${index + 1}`,
					);

					const description = getDisplayText(
						module,
						["description"],
						"Latihan pengucapan Bahasa Indonesia.",
					);

					const difficulty = getDisplayText(
						module,
						["difficulty_label", "difficultyLabel"],
						"Latihan",
					);

					return (
						<TouchableOpacity
							key={module.id}
							activeOpacity={0.8}
							onPress={() => void handleStartSession(module.id)}
							style={styles.moduleCard}
						>
							<View style={styles.moduleIcon}>
								<Ionicons
									name="chatbubble-ellipses-outline"
									size={24}
									color={COLORS.primary}
								/>
							</View>

							<View style={styles.moduleInfo}>
								<Text style={styles.moduleTitle}>{title}</Text>

								<Text style={styles.moduleDescription}>{description}</Text>

								<View style={styles.difficultyBadge}>
									<Text style={styles.difficultyText}>{difficulty}</Text>
								</View>
							</View>

							<Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
						</TouchableOpacity>
					);
				})
			)}
		</ScrollView>
	);

	const renderActiveSession = (
		sentence: Sentence,
		currentIndex: number,
		total: number,
	) => {
		const sentenceText = getDisplayText(
			sentence,
			[
				"text",
				"sentence",
				"content",
				"phrase",
				"target_text",
				"targetText",
				"word",
			],
			"Kalimat latihan",
		);

		const guide = getSentenceGuide(sentence);
		const progress =
			total > 0 ? Math.min(((currentIndex + 1) / total) * 100, 100) : 0;

		const canSubmit = transcript.trim().length > 0 && isFinal && !isListening;

		return (
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.progressSection}>
					<View style={styles.progressLabels}>
						<Text style={styles.progressLabel}>
							Kalimat {currentIndex + 1} dari {total}
						</Text>

						<Text style={styles.progressPercentage}>
							{Math.round(progress)}%
						</Text>
					</View>

					<View style={styles.progressTrack}>
						<View style={[styles.progressFill, { width: `${progress}%` }]} />
					</View>
				</View>

				<View style={styles.sentenceCard}>
					<View style={styles.sentenceLabelRow}>
						<Ionicons
							name="chatbox-ellipses-outline"
							size={18}
							color={COLORS.primary}
						/>

						<Text style={styles.sentenceLabel}>UCAPKAN KALIMAT INI</Text>
					</View>

					<Text style={styles.sentenceText}>{sentenceText}</Text>

					{guide ? (
						<View style={styles.guideContainer}>
							<Text style={styles.guideLabel}>Panduan pengucapan</Text>

							<Text style={styles.guideText}>{guide}</Text>
						</View>
					) : null}
				</View>

				<View style={styles.recordingCard}>
					<View style={styles.recordingHeader}>
						<View style={styles.recordingIcon}>
							<Ionicons
								name={isListening ? "radio-outline" : "mic-outline"}
								size={23}
								color={COLORS.primary}
							/>
						</View>

						<View style={styles.recordingHeaderText}>
							<Text style={styles.cardTitle}>
								{isListening ? "Mendengarkan ucapan..." : "Latihan pengucapan"}
							</Text>

							<Text style={styles.cardDescription}>
								{isListening
									? "Ucapkan kalimat dengan jelas."
									: "Tekan tombol mikrofon untuk mulai berbicara."}
							</Text>
						</View>
					</View>

					<TouchableOpacity
						activeOpacity={0.8}
						onPress={() => void handleToggleListening()}
						style={[styles.micButton, isListening && styles.micButtonActive]}
					>
						<Ionicons
							name={isListening ? "stop" : "mic"}
							size={30}
							color="#FFFFFF"
						/>
					</TouchableOpacity>

					<Text style={styles.micButtonLabel}>
						{isListening ? "Selesaikan ucapan" : "Mulai berbicara"}
					</Text>

					{speechError ? (
						<View style={styles.errorMessage}>
							<Ionicons
								name="alert-circle-outline"
								size={18}
								color={COLORS.danger}
							/>

							<Text style={styles.errorMessageText}>{speechError}</Text>
						</View>
					) : null}

					<View style={styles.transcriptContainer}>
						<View style={styles.transcriptHeader}>
							<Text style={styles.transcriptLabel}>Hasil Transkripsi</Text>

							{isFinal && transcript.trim() ? (
								<View style={styles.finalBadge}>
									<Ionicons
										name="checkmark-circle"
										size={14}
										color={COLORS.success}
									/>

									<Text style={styles.finalBadgeText}>Selesai</Text>
								</View>
							) : null}
						</View>

						<Text
							style={[
								styles.transcriptText,
								!transcript && styles.transcriptPlaceholder,
							]}
						>
							{transcript ||
								(isListening
									? "Menunggu ucapanmu..."
									: "Transkrip akan muncul di sini.")}
						</Text>

						{isListening ? (
							<View style={styles.listeningIndicator}>
								<ActivityIndicator size="small" color={COLORS.primary} />

								<Text style={styles.listeningText}>Sedang mengenali suara</Text>
							</View>
						) : null}
					</View>

					{transcript.trim() && !isListening ? (
						<TouchableOpacity
							activeOpacity={0.7}
							onPress={resetTranscript}
							style={styles.resetTranscriptButton}
						>
							<Ionicons
								name="refresh-outline"
								size={16}
								color={COLORS.primary}
							/>

							<Text style={styles.resetTranscriptText}>Ulangi ucapan</Text>
						</TouchableOpacity>
					) : null}
				</View>

				<View style={styles.actionsContainer}>
					<PrimaryButton
						label="Periksa Jawaban"
						icon="checkmark-circle-outline"
						onPress={() => void handleSubmit()}
						disabled={!canSubmit}
					/>

					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => void handleSkip()}
						disabled={isListening}
						style={[
							styles.secondaryButton,
							isListening && styles.disabledSecondaryButton,
						]}
					>
						<Ionicons
							name="play-skip-forward-outline"
							size={19}
							color={COLORS.text}
						/>

						<Text style={styles.secondaryButtonText}>Lewati kalimat ini</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		);
	};

	return (
		<SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
			{renderHeader(
				phase.status === "active"
					? "Latihan pengucapan"
					: "Pilih latihan yang ingin kamu coba",
			)}

			{phase.status === "idle" || phase.status === "loading_modules"
				? renderLoading("Memuat modul latihan...")
				: null}

			{phase.status === "modules_error"
				? renderError(
						"Gagal memuat modul",
						phase.message,
						() => void loadModules(),
					)
				: null}

			{phase.status === "module_list" ? renderModuleList(phase.modules) : null}

			{phase.status === "starting_session"
				? renderLoading("Menyiapkan sesi latihan...")
				: null}

			{phase.status === "active"
				? renderActiveSession(
						phase.sentences[phase.currentIndex],
						phase.currentIndex,
						phase.total,
					)
				: null}

			{phase.status === "submitting"
				? renderLoading("Memeriksa jawaban...")
				: null}

			{phase.status === "completing"
				? renderLoading("Menyelesaikan sesi latihan...")
				: null}

			{phase.status === "done"
				? renderLoading("Membuka hasil latihan...")
				: null}

			{phase.status === "answer_error"
				? renderError(
						"Gagal memproses jawaban",
						phase.message,
						handleBackToModules,
					)
				: null}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 14,
		backgroundColor: COLORS.surface,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	backButton: {
		width: 42,
		height: 42,
		borderRadius: 14,
		backgroundColor: COLORS.background,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	headerTextContainer: {
		flex: 1,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.text,
	},
	headerSubtitle: {
		fontSize: 12,
		color: COLORS.muted,
		marginTop: 3,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 32,
	},
	centerContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 28,
	},
	loadingText: {
		fontSize: 14,
		color: COLORS.muted,
		marginTop: 14,
		textAlign: "center",
	},
	introCard: {
		backgroundColor: COLORS.primaryLight,
		borderRadius: 20,
		padding: 22,
		marginBottom: 26,
		alignItems: "flex-start",
	},
	introIcon: {
		width: 54,
		height: 54,
		borderRadius: 17,
		backgroundColor: COLORS.surface,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 15,
	},
	introTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.text,
	},
	introDescription: {
		fontSize: 14,
		lineHeight: 21,
		color: COLORS.muted,
		marginTop: 8,
	},
	sectionTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: COLORS.text,
		marginBottom: 14,
	},
	moduleCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.surface,
		borderRadius: 17,
		borderWidth: 1,
		borderColor: COLORS.border,
		padding: 16,
		marginBottom: 12,
	},
	moduleIcon: {
		width: 48,
		height: 48,
		borderRadius: 15,
		backgroundColor: COLORS.primaryLight,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 14,
	},
	moduleInfo: {
		flex: 1,
		paddingRight: 8,
	},
	moduleTitle: {
		fontSize: 15,
		fontWeight: "700",
		color: COLORS.text,
	},
	moduleDescription: {
		fontSize: 12,
		lineHeight: 18,
		color: COLORS.muted,
		marginTop: 5,
	},
	difficultyBadge: {
		alignSelf: "flex-start",
		backgroundColor: COLORS.primaryLight,
		borderRadius: 7,
		paddingHorizontal: 9,
		paddingVertical: 5,
		marginTop: 9,
	},
	difficultyText: {
		fontSize: 11,
		fontWeight: "600",
		color: COLORS.primary,
	},
	progressSection: {
		marginBottom: 22,
	},
	progressLabels: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	progressLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: COLORS.text,
	},
	progressPercentage: {
		fontSize: 13,
		fontWeight: "700",
		color: COLORS.primary,
	},
	progressTrack: {
		height: 8,
		borderRadius: 99,
		backgroundColor: COLORS.border,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		borderRadius: 99,
		backgroundColor: COLORS.primary,
	},
	sentenceCard: {
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 20,
		padding: 22,
		marginBottom: 18,
	},
	sentenceLabelRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 18,
	},
	sentenceLabel: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.8,
		color: COLORS.primary,
		marginLeft: 8,
	},
	sentenceText: {
		fontSize: 25,
		fontWeight: "700",
		lineHeight: 36,
		color: COLORS.text,
	},
	guideContainer: {
		marginTop: 22,
		padding: 14,
		backgroundColor: COLORS.primaryLight,
		borderRadius: 13,
	},
	guideLabel: {
		fontSize: 12,
		color: COLORS.muted,
		marginBottom: 7,
	},
	guideText: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.primary,
		lineHeight: 24,
	},
	recordingCard: {
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 20,
		padding: 20,
		alignItems: "center",
	},
	recordingHeader: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "stretch",
		marginBottom: 22,
	},
	recordingIcon: {
		width: 46,
		height: 46,
		borderRadius: 14,
		backgroundColor: COLORS.primaryLight,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	recordingHeaderText: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 15,
		fontWeight: "700",
		color: COLORS.text,
	},
	cardDescription: {
		fontSize: 12,
		color: COLORS.muted,
		lineHeight: 18,
		marginTop: 4,
	},
	micButton: {
		width: 76,
		height: 76,
		borderRadius: 38,
		backgroundColor: COLORS.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	micButtonActive: {
		backgroundColor: COLORS.danger,
	},
	micButtonLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: COLORS.text,
		marginTop: 12,
		marginBottom: 22,
	},
	transcriptContainer: {
		width: "100%",
		backgroundColor: COLORS.background,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 14,
		padding: 15,
	},
	transcriptHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 11,
	},
	transcriptLabel: {
		fontSize: 12,
		fontWeight: "700",
		color: COLORS.text,
	},
	finalBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.successLight,
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 5,
	},
	finalBadgeText: {
		fontSize: 10,
		fontWeight: "600",
		color: COLORS.success,
		marginLeft: 4,
	},
	transcriptText: {
		fontSize: 15,
		lineHeight: 23,
		color: COLORS.text,
	},
	transcriptPlaceholder: {
		color: COLORS.muted,
	},
	listeningIndicator: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 12,
	},
	listeningText: {
		fontSize: 12,
		color: COLORS.primary,
		marginLeft: 8,
	},
	errorMessage: {
		flexDirection: "row",
		alignItems: "flex-start",
		alignSelf: "stretch",
		padding: 12,
		marginBottom: 12,
		backgroundColor: COLORS.dangerLight,
		borderRadius: 10,
	},
	errorMessageText: {
		flex: 1,
		fontSize: 12,
		lineHeight: 18,
		color: COLORS.danger,
		marginLeft: 8,
	},
	resetTranscriptButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 13,
	},
	resetTranscriptText: {
		fontSize: 12,
		fontWeight: "600",
		color: COLORS.primary,
		marginLeft: 6,
	},
	actionsContainer: {
		marginTop: 20,
	},
	primaryButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		minHeight: 52,
		paddingHorizontal: 18,
		borderRadius: 14,
		backgroundColor: COLORS.primary,
	},
	primaryButtonText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#FFFFFF",
		marginLeft: 9,
	},
	disabledButton: {
		opacity: 0.45,
	},
	secondaryButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		minHeight: 50,
		marginTop: 10,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surface,
	},
	secondaryButtonText: {
		fontSize: 13,
		fontWeight: "600",
		color: COLORS.text,
		marginLeft: 8,
	},
	disabledSecondaryButton: {
		opacity: 0.45,
	},
	emptyCard: {
		alignItems: "center",
		backgroundColor: COLORS.surface,
		padding: 24,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	emptyTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: COLORS.text,
		textAlign: "center",
		marginTop: 14,
	},
	emptyDescription: {
		fontSize: 13,
		lineHeight: 20,
		color: COLORS.muted,
		textAlign: "center",
		marginTop: 8,
		marginBottom: 20,
	},
	errorIconContainer: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: COLORS.dangerLight,
		alignItems: "center",
		justifyContent: "center",
	},
});
