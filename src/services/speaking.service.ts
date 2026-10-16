/** @format */

import type {
	Sentence,
	SpeakingAttempt,
	SpeakingModule,
	SpeakingSession,
	SpeakingSummary,
} from "@/types/api";

import { apiClient } from "./api/client";

export const speakingService = {
	async getModules(difficulty?: number): Promise<SpeakingModule[]> {
		const path = difficulty
			? `/v1/speaking/modules?difficulty=${difficulty}`
			: "/v1/speaking/modules";

		const response = await apiClient.get<{ modules: SpeakingModule[] }>(
			path,
			true,
		);

		return response.modules ?? [];
	},

	async startSession(moduleId: string): Promise<{
		session: SpeakingSession;
		sentences: Sentence[];
		progress: { done: number; total: number };
	}> {
		return apiClient.post<{
			session: SpeakingSession;
			sentences: Sentence[];
			progress: { done: number; total: number };
		}>("/v1/speaking/sessions", { module_id: moduleId }, true);
	},

	async getSession(sessionId: string): Promise<SpeakingSession> {
		return apiClient.get<SpeakingSession>(
			`/v1/speaking/sessions/${sessionId}`,
			true,
		);
	},

	async submitAttempt(
		sessionId: string,
		sentenceId: string,
		transcript: string,
	): Promise<SpeakingAttempt> {
		const formData = new FormData();

		formData.append("sentence_id", sentenceId);
		formData.append("transcript", transcript);

		return apiClient.postFormData<SpeakingAttempt>(
			`/v1/speaking/sessions/${sessionId}/attempts`,
			formData,
			true,
		);
	},

	async skipSentence(sessionId: string, sentenceId: string): Promise<void> {
		const formData = new FormData();

		formData.append("sentence_id", sentenceId);
		formData.append("skipped", "true");

		await apiClient.postFormData(
			`/v1/speaking/sessions/${sessionId}/attempts`,
			formData,
			true,
		);
	},

	async completeSession(sessionId: string): Promise<SpeakingSummary> {
		return apiClient.post<SpeakingSummary>(
			`/v1/speaking/sessions/${sessionId}/complete`,
			{},
			true,
		);
	},
};
