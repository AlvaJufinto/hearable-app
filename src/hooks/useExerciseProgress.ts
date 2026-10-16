/** @format */

import { useCallback, useSyncExternalStore } from "react";

export type ExerciseType = "listening" | "speaking";

interface ExerciseState {
	exerciseType: ExerciseType | null;
	recognitionDone: boolean;
	recognitionScore: number;
	recognitionTotal: number;
	speakingDone: boolean;
	speakingScore: number;
	speakingTotal: number;
}

type ExerciseAction =
	| { type: "SET_RECOGNITION_DONE"; score: number; total: number }
	| { type: "SET_SPEAKING_DONE"; score: number; total: number }
	| { type: "RESET" };

const initialState: ExerciseState = {
	exerciseType: null,
	recognitionDone: false,
	recognitionScore: 0,
	recognitionTotal: 0,
	speakingDone: false,
	speakingScore: 0,
	speakingTotal: 0,
};

function toValidNumber(value: number): number {
	return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function reducer(state: ExerciseState, action: ExerciseAction): ExerciseState {
	switch (action.type) {
		case "SET_RECOGNITION_DONE":
			return {
				...initialState,
				exerciseType: "listening",
				recognitionDone: true,
				recognitionScore: toValidNumber(action.score),
				recognitionTotal: toValidNumber(action.total),
			};

		case "SET_SPEAKING_DONE":
			return {
				...initialState,
				exerciseType: "speaking",
				speakingDone: true,
				speakingScore: toValidNumber(action.score),
				speakingTotal: toValidNumber(action.total),
			};

		case "RESET":
			return { ...initialState };
	}
}

let globalState: ExerciseState = { ...initialState };
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	return globalState;
}

function notify() {
	listeners.forEach((listener) => listener());
}

export function useExerciseProgress() {
	const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

	const setRecognitionDone = useCallback((score: number, total: number) => {
		globalState = reducer(globalState, {
			type: "SET_RECOGNITION_DONE",
			score,
			total,
		});
		notify();
	}, []);

	const setSpeakingDone = useCallback((score: number, total: number) => {
		globalState = reducer(globalState, {
			type: "SET_SPEAKING_DONE",
			score,
			total,
		});
		notify();
	}, []);

	const reset = useCallback(() => {
		globalState = reducer(globalState, { type: "RESET" });
		notify();
	}, []);

	return {
		state,
		setRecognitionDone,
		setSpeakingDone,
		reset,
		getState: getSnapshot,
	};
}
