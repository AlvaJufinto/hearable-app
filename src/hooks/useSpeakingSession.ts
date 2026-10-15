/** @format */

import { useState, useCallback } from "react";
import { speakingService } from "@/services/speaking.service";
import type { SpeakingModule, SpeakingSentence } from "@/types/api";

type SessionPhase =
	| { status: "idle" }
	| { status: "loading_modules" }
	| { status: "modules_error"; message: string }
	| { status: "module_list"; modules: SpeakingModule[] }
	| { status: "starting_session" }
	| {
			status: "active";
			sessionId: string;
			currentIndex: number;
			total: number;
			sentences: SpeakingSentence[];
			attempts: Map<
				string,
				{ transcript?: string; score?: number; clarity?: number; completeness?: number }
			>;
	  }
	| { status: "submitting" }
	| { status: "answer_error"; message: string }
	| { status: "completing" }
	| {
			status: "done";
			sessionId: string;
			averageScore: number;
			totalSentences: number;
	  };

export function useSpeakingSession() {
	const [phase, setPhase] = useState<SessionPhase>({ status: "idle" });

	const loadModules = useCallback(async () => {
		setPhase({ status: "loading_modules" });
		try {
			const modules = await speakingService.getModules();
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
			const { session } = await speakingService.startSession(moduleId);
			setPhase({
				status: "active",
				sessionId: session.id,
				currentIndex: 0,
				total: session.sentences.length,
				sentences: session.sentences,
				attempts: new Map(),
			});
		} catch (err: unknown) {
			const message =
				(err as { message?: string })?.message ?? "Gagal memulai sesi";
			setPhase({ status: "modules_error", message });
		}
	}, []);

	const submitAttempt = useCallback(
		async (sentenceId: string, audioUri: string) => {
			const current = phase;
			if (current.status !== "active") return;

			setPhase({ status: "submitting" });
			try {
				const result = await speakingService.submitAttempt(
					current.sessionId,
					sentenceId,
					audioUri
				);
				const newAttempts = new Map(current.attempts);
				newAttempts.set(sentenceId, result);

				const nextIndex = current.currentIndex + 1;
				if (nextIndex >= current.sentences.length) {
					setPhase({ status: "completing" });
					const summary = await speakingService.completeSession(
						current.sessionId
					);
					setPhase({
						status: "done",
						sessionId: current.sessionId,
						averageScore: summary.average_score,
						totalSentences: summary.total,
					});
				} else {
					setPhase({
						...current,
						currentIndex: nextIndex,
						attempts: newAttempts,
					});
				}
			} catch (err: unknown) {
				const message =
					(err as { message?: string })?.message ?? "Gagal mengirim rekaman";
				setPhase({ status: "answer_error", message });
			}
		},
		[phase]
	);

	const skipSentence = useCallback(
		async (sentenceId: string) => {
			const current = phase;
			if (current.status !== "active") return;

			setPhase({ status: "submitting" });
			try {
				await speakingService.skipSentence(current.sessionId, sentenceId);
				const newAttempts = new Map(current.attempts);
				newAttempts.set(sentenceId, {});

				const nextIndex = current.currentIndex + 1;
				if (nextIndex >= current.sentences.length) {
					setPhase({ status: "completing" });
					const summary = await speakingService.completeSession(
						current.sessionId
					);
					setPhase({
						status: "done",
						sessionId: current.sessionId,
						averageScore: summary.average_score,
						totalSentences: summary.total,
					});
				} else {
					setPhase({
						...current,
						currentIndex: nextIndex,
						attempts: newAttempts,
					});
				}
			} catch (err: unknown) {
				const message =
					(err as { message?: string })?.message ?? "Gagal melewati kalimat";
				setPhase({ status: "answer_error", message });
			}
		},
		[phase]
	);

	const reset = useCallback(() => {
		setPhase({ status: "idle" });
	}, []);

	return { phase, loadModules, startSession, submitAttempt, skipSentence, reset };
}
