/** @format */

import { useState, useEffect, useRef } from "react";
import { authService } from "@/services/auth.service";
import { progressService } from "@/services/progress.service";
import type { Activity, HistoryItem } from "@/types/api";

type HomeState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "authenticated"; activity: Activity; history: HistoryItem[]; userName: string }
	| { status: "unauthenticated" };

export function useHomeData() {
	const [state, setState] = useState<HomeState>({ status: "idle" });
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
				const [activity, user, historyRes] = await Promise.all([
					progressService.getActivity(),
					authService.getMe(),
					progressService.getHistory(),
				]);
				setState({ status: "authenticated", activity, history: historyRes.items, userName: user.name });
			} catch {
				setState({ status: "unauthenticated" });
			}
		})();
	}, []);

	return { state };
}
