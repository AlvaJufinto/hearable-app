/** @format */

import { useReducer, useEffect } from "react";

interface ExerciseState {
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

function reducer(state: ExerciseState, action: ExerciseAction): ExerciseState {
	switch (action.type) {
		case "SET_RECOGNITION_DONE":
			return { ...state, recognitionDone: true, recognitionScore: action.score, recognitionTotal: action.total };
		case "SET_SPEAKING_DONE":
			return { ...state, speakingDone: true, speakingScore: action.score, speakingTotal: action.total };
		case "RESET":
			return {
				recognitionDone: false,
				recognitionScore: 0,
				recognitionTotal: 0,
				speakingDone: false,
				speakingScore: 0,
				speakingTotal: 0,
			};
		default:
			return state;
	}
}

const initialState: ExerciseState = {
	recognitionDone: false,
	recognitionScore: 0,
	recognitionTotal: 0,
	speakingDone: false,
	speakingScore: 0,
	speakingTotal: 0,
};

let globalState: ExerciseState = { ...initialState };
const listeners: ((s: ExerciseState) => void)[] = [];

function notify() {
	listeners.forEach((l) => l(globalState));
}

export function useExerciseProgress() {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		listeners.push(forceUpdate);
		return () => {
			const idx = listeners.indexOf(forceUpdate);
			if (idx > -1) listeners.splice(idx, 1);
		};
	}, []);

	const setRecognitionDone = (score: number, total: number) => {
		globalState = reducer(globalState, { type: "SET_RECOGNITION_DONE", score, total });
		notify();
	};

	const setSpeakingDone = (score: number, total: number) => {
		globalState = reducer(globalState, { type: "SET_SPEAKING_DONE", score, total });
		notify();
	};

	const reset = () => {
		globalState = reducer(globalState, { type: "RESET" });
		notify();
	};

	const getState = () => globalState;

	return { state: globalState, setRecognitionDone, setSpeakingDone, reset, getState };
}
