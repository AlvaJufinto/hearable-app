/** @format */

import { useCallback, useState } from "react";

import {
	ExpoSpeechRecognitionModule,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export function useSpeechToText() {
	const [transcript, setTranscript] = useState("");
	const [isListening, setIsListening] = useState(false);
	const [isFinal, setIsFinal] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useSpeechRecognitionEvent("start", () => {
		setIsListening(true);
	});

	useSpeechRecognitionEvent("end", () => {
		setIsListening(false);
	});

	useSpeechRecognitionEvent("result", (event) => {
		const results = event.results;
		const latestResult = results[results.length - 1];
		const recognizedText = latestResult?.transcript;

		if (typeof recognizedText === "string") {
			setTranscript(recognizedText);
		}

		if (event.isFinal) {
			setIsFinal(true);
		}
	});

	useSpeechRecognitionEvent("error", (event) => {
		setIsListening(false);
		setError(event.message || "Gagal mengenali ucapan.");
	});

	const startListening = useCallback(async () => {
		try {
			const permission =
				await ExpoSpeechRecognitionModule.requestPermissionsAsync();

			if (!permission.granted) {
				setError("Izin mikrofon dan pengenalan ucapan diperlukan.");
				return;
			}

			if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
				setError("Speech recognition tidak tersedia di perangkat ini.");
				return;
			}

			setTranscript("");
			setIsFinal(false);
			setError(null);

			ExpoSpeechRecognitionModule.start({
				lang: "id-ID",
				interimResults: true,
				continuous: false,
				maxAlternatives: 1,
			});
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: "Gagal memulai speech recognition.",
			);
		}
	}, []);

	const stopListening = useCallback(() => {
		ExpoSpeechRecognitionModule.stop();
	}, []);

	const resetTranscript = useCallback(() => {
		setTranscript("");
		setIsFinal(false);
		setError(null);
	}, []);

	return {
		transcript,
		isListening,
		isFinal,
		error,
		startListening,
		stopListening,
		resetTranscript,
	};
}
