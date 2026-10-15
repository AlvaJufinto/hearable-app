/** @format */

import { useEffect, useRef, useState } from "react";
import { authService } from "@/services/auth.service";
import { progressService } from "@/services/progress.service";
import { listeningService } from "@/services/listening.service";
import { speakingService } from "@/services/speaking.service";

type PracticeState =
	| { status: "idle" }
	| { status: "loading" }
			| {
					status: "authenticated";
					weeklyCompleted: number;
					weeklyGoal: number;
					listeningModules: { id: string; name: string; description: string; difficulty: number; question_count: number }[];
					speakingModules: { id: string; name: string; description: string; difficulty: number; sentence_count: number }[];
			  }
	| { status: "unauthenticated" };

export function usePracticeData() {
	const [state, setState] = useState<PracticeState>({ status: "idle" });
	const didLoadRef = useRef(false);

	useEffect(() => {
		if (didLoadRef.current) return;
		didLoadRef.current = true;

		setState({ status: "loading" });

		(async () => {
			try {
				const isAuth = await authService.isAuthenticated();
				if (!isAuth) {
					setState({ status: "unauthenticated" });
					return;
				}
				const [activity, listeningModules, speakingModules] = await Promise.all([
					progressService.getActivity(),
					listeningService.getModules(),
					speakingService.getModules(),
				]);
				setState({
					status: "authenticated",
					weeklyCompleted: activity.completed_sessions,
					weeklyGoal: activity.target_days,
					listeningModules,
					speakingModules,
				});
			} catch {
				setState({ status: "unauthenticated" });
			}
		})();
	}, []);

	return { state };
}
