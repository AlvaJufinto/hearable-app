/** @format */

import { apiClient } from "./api/client";
import type { Activity, HistoryResponse } from "@/types/api";

export const progressService = {
	async getActivity(weekOf?: string): Promise<Activity> {
		const path = weekOf ? `/v1/me/activity?week_of=${weekOf}` : "/v1/me/activity";
		return apiClient.get<Activity>(path, true);
	},

	async getHistory(params?: {
		limit?: number;
		cursor?: string;
		status?: "in_progress" | "completed";
	}): Promise<HistoryResponse> {
		const searchParams = new URLSearchParams();
		if (params?.limit) searchParams.set("limit", String(params.limit));
		if (params?.cursor) searchParams.set("cursor", params.cursor);
		if (params?.status) searchParams.set("status", params.status);
		const qs = searchParams.toString();
		const path = qs ? `/v1/me/history?${qs}` : "/v1/me/history";
		return apiClient.get<HistoryResponse>(path, true);
	},
};
