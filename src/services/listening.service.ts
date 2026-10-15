/** @format */

import { apiClient } from "./api/client";
import type {
	ListeningModule,
	ListeningSession,
	ListeningSummary,
	ListeningAnswer,
} from "@/types/api";

export const listeningService = {
	async getModules(difficulty?: number): Promise<ListeningModule[]> {
		const path = difficulty ? `/v1/listening/modules?difficulty=${difficulty}` : "/v1/listening/modules";
		return apiClient.get<ListeningModule[]>(path, true);
	},

	async startSession(moduleId: string): Promise<{ session: ListeningSession }> {
		return apiClient.post<{ session: ListeningSession }>(
			"/v1/listening/sessions",
			{ module_id: moduleId },
			true
		);
	},

	async getSession(sessionId: string): Promise<ListeningSession> {
		return apiClient.get<ListeningSession>(
			`/v1/listening/sessions/${sessionId}`,
			true
		);
	},

	async submitAnswer(
		sessionId: string,
		questionId: string,
		answer: { answerId?: string; textAnswer?: string; skipped?: boolean }
	): Promise<ListeningAnswer> {
		return apiClient.post<ListeningAnswer>(
			`/v1/listening/sessions/${sessionId}/answers`,
			{
				question_id: questionId,
				...(answer.answerId !== undefined && { selected_option_id: answer.answerId }),
				...(answer.textAnswer !== undefined && { answer_text: answer.textAnswer }),
				...(answer.skipped !== undefined && { skipped: answer.skipped }),
			},
			true
		);
	},

	async completeSession(sessionId: string): Promise<ListeningSummary> {
		return apiClient.post<ListeningSummary>(
			`/v1/listening/sessions/${sessionId}/complete`,
			{},
			true
		);
	},
};
