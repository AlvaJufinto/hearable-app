/** @format */

import { useCallback, useState } from "react";

import { listeningService } from "@/services/listening.service";
import type { ListeningModule, ListeningQuestion } from "@/types/api";

type SavedAnswer = {
	answerId?: string;
	textAnswer?: string;
	correct?: boolean;
	score: number;
};

type ActiveSession = {
	status: "active";
	sessionId: string;
	currentIndex: number;
	total: number;
	questions: ListeningQuestion[];
	answers: Map<string, SavedAnswer>;
};

type SessionPhase =
	| { status: "idle" }
	| { status: "loading_modules" }
	| { status: "modules_error"; message: string }
	| { status: "module_list"; modules: ListeningModule[] }
	| { status: "starting_session" }
	| ActiveSession
	| { status: "submitting_answer" }
	| { status: "answer_error"; message: string }
	| { status: "completing" }
	| {
			status: "done";
			sessionId: string;
			correctAnswers: number;
			totalQuestions: number;
	  };

export function useListeningSession() {
	const [phase, setPhase] = useState<SessionPhase>({ status: "idle" });

	const loadModules = useCallback(async () => {
		setPhase({ status: "loading_modules" });

		try {
			const modules = await listeningService.getModules();
			setPhase({ status: "module_list", modules });
		} catch (err: unknown) {
			const message =
				(err as { message?: string })?.message ?? "Gagal memuat modul";

			setPhase({ status: "modules_error", message });
		}
	}, []);

	const startSession = useCallback(async (moduleId: string) => {
		setPhase({ status: "starting_session" });

		try {
			const { session, questions, progress } =
				await listeningService.startSession(moduleId);

			setPhase({
				status: "active",
				sessionId: session.id,
				currentIndex: 0,
				total: progress.total,
				questions,
				answers: new Map(),
			});
		} catch (err: unknown) {
			const message =
				(err as { message?: string })?.message ?? "Gagal memulai sesi";

			setPhase({ status: "modules_error", message });
		}
	}, []);

	const previousQuestion = useCallback(() => {
		setPhase((current) => {
			if (current.status !== "active" || current.currentIndex <= 0) {
				return current;
			}

			return {
				...current,
				currentIndex: current.currentIndex - 1,
			};
		});
	}, []);

	const nextQuestion = useCallback(() => {
		setPhase((current) => {
			if (current.status !== "active") return current;

			const currentQuestion = current.questions[current.currentIndex];
			const currentAnswer = current.answers.get(currentQuestion.id);

			if (
				!currentAnswer ||
				current.currentIndex >= current.questions.length - 1
			) {
				return current;
			}

			return {
				...current,
				currentIndex: current.currentIndex + 1,
			};
		});
	}, []);

	const submitAnswer = useCallback(
		async (questionId: string, answerId?: string, textAnswer?: string) => {
			const current = phase;

			if (current.status !== "active") return;

			const existingAnswer = current.answers.get(questionId);

			// Jangan mengirim ulang jawaban yang sudah berhasil dikirim.
			if (existingAnswer) return;

			setPhase({ status: "submitting_answer" });

			try {
				const result = await listeningService.submitAnswer(
					current.sessionId,
					questionId,
					{ answerId, textAnswer },
				);

				const newAnswers = new Map(current.answers);

				newAnswers.set(questionId, {
					answerId: result.selected_option_id ?? answerId,
					textAnswer,
					correct: result.correct,
					score: result.score ?? 0,
				});

				const nextIndex = current.currentIndex + 1;

				if (nextIndex >= current.questions.length) {
					setPhase({ status: "completing" });

					const summary = await listeningService.completeSession(
						current.sessionId,
					);

					console.log("[Listening] Complete session response:", summary);

					setPhase({
						status: "done",
						sessionId: current.sessionId,
						correctAnswers: summary.correct,
						totalQuestions: summary.total,
					});

					setPhase({
						status: "done",
						sessionId: current.sessionId,
						correctAnswers: summary.correct,
						totalQuestions: summary.total,
					});

					return;
				}

				setPhase({
					...current,
					currentIndex: nextIndex,
					answers: newAnswers,
				});
			} catch (err: unknown) {
				const message =
					(err as { message?: string })?.message ?? "Gagal mengirim jawaban";

				// Pertahankan sesi agar pengguna bisa mencoba lagi.
				setPhase({
					...current,
					status: "active",
				});

				console.error("[Listening] Submit answer failed:", message);
			}
		},
		[phase],
	);

	const skipQuestion = useCallback(
		async (questionId: string) => {
			const current = phase;

			if (current.status !== "active") return;

			// Soal yang sudah dijawab tidak perlu dikirim ulang sebagai skip.
			if (current.answers.has(questionId)) return;

			setPhase({ status: "submitting_answer" });

			try {
				const result = await listeningService.submitAnswer(
					current.sessionId,
					questionId,
					{ skipped: true },
				);

				const newAnswers = new Map(current.answers);

				newAnswers.set(questionId, {
					answerId: result.selected_option_id,
					correct: result.correct,
					score: result.score ?? 0,
				});

				const nextIndex = current.currentIndex + 1;

				if (nextIndex >= current.questions.length) {
					setPhase({ status: "completing" });

					const summary = await listeningService.completeSession(
						current.sessionId,
					);

					setPhase({
						status: "done",
						sessionId: current.sessionId,
						correctAnswers: summary.correct,
						totalQuestions: summary.total,
					});

					return;
				}

				setPhase({
					...current,
					currentIndex: nextIndex,
					answers: newAnswers,
				});
			} catch (err: unknown) {
				const message =
					(err as { message?: string })?.message ?? "Gagal melanjutkan";

				setPhase({
					...current,
					status: "active",
				});

				console.error("[Listening] Skip question failed:", message);
			}
		},
		[phase],
	);

	const reset = useCallback(() => {
		setPhase({ status: "idle" });
	}, []);

	return {
		phase,
		loadModules,
		startSession,
		submitAnswer,
		skipQuestion,
		previousQuestion,
		nextQuestion,
		reset,
	};
}
