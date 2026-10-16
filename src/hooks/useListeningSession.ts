/** @format */

import { useCallback, useState } from "react";

import { listeningService } from "@/services/listening.service";
import type { ListeningModule, ListeningQuestion } from "@/types/api";

type SessionPhase =
	| { status: "idle" }
	| { status: "loading_modules" }
	| { status: "modules_error"; message: string }
	| { status: "module_list"; modules: ListeningModule[] }
	| { status: "starting_session" }
	| {
			status: "active";
			sessionId: string;
			currentIndex: number;
			total: number;
			questions: ListeningQuestion[];
			answers: Map<
				string,
				{ answerId?: string; correct?: boolean; score: number }
			>;
	  }
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
				questions: questions,
				answers: new Map(),
			});
		} catch (err: unknown) {
			const message =
				(err as { message?: string })?.message ?? "Gagal memulai sesi";
			setPhase({ status: "modules_error", message });
		}
	}, []);

	const submitAnswer = useCallback(
		async (questionId: string, answerId: string) => {
			const current = phase;
			if (current.status !== "active") return;

			setPhase({ status: "submitting_answer" });
			try {
				const result = await listeningService.submitAnswer(
					current.sessionId,
					questionId,
					{
						answerId,
					},
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
				} else {
					setPhase({
						...current,
						currentIndex: nextIndex,
						answers: newAnswers,
					});
				}
			} catch (err: unknown) {
				const message =
					(err as { message?: string })?.message ?? "Gagal mengirim jawaban";
				setPhase({ status: "answer_error", message });
			}
		},
		[phase],
	);

	const skipQuestion = useCallback(
		async (questionId: string) => {
			const current = phase;
			if (current.status !== "active") return;

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
				} else {
					setPhase({
						...current,
						currentIndex: nextIndex,
						answers: newAnswers,
					});
				}
			} catch (err: unknown) {
				const message =
					(err as { message?: string })?.message ?? "Gagal melanjutkan";
				setPhase({ status: "answer_error", message });
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
		reset,
	};
}
