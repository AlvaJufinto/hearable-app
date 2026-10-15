/** @format */

import { useEffect, useRef, useState } from "react";
import { authService } from "@/services/auth.service";
import { progressService } from "@/services/progress.service";
import type { Activity, HistoryItem } from "@/types/api";

type ProgressState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "authenticated"; activity: Activity; history: HistoryItem[] }
	| { status: "error" };

export function useProgressData() {
	const [state, setState] = useState<ProgressState>({ status: "idle" });
	const didLoadRef = useRef(false);

	useEffect(() => {
		if (didLoadRef.current) return;
		didLoadRef.current = true;

		setState({ status: "loading" });

		(async () => {
			try {
				const isAuth = await authService.isAuthenticated();
				if (!isAuth) {
					setState({ status: "error" });
					return;
				}
				const [activity, historyRes] = await Promise.all([
					progressService.getActivity(),
					progressService.getHistory(),
				]);
				setState({ status: "authenticated", activity, history: historyRes.items });
			} catch {
				setState({ status: "error" });
			}
		})();
	}, []);

	return { state };
}
