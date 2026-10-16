/** @format */

export interface ApiError {
	code: string;
	message: string;
	retryable?: boolean;
}

export interface ApiErrorResponse {
	error: ApiError;
}

export interface User {
	id: string;
	email: string;
	name: string;
	created_at: string;
}

export interface AuthResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
	user: User;
}

export interface ListeningModule {
	id: string;
	label: string;
	title: string;
	description: string;
	difficulty: 1 | 2 | 3 | 4;
	difficulty_label: string;
	estimated_minutes: number;
	question_count: number;
}

export interface ListeningOption {
	id: string;
	text: string;
}

export interface ListeningQuestion {
	id: string;
	type: "multiple_choice" | "input";
	question: string;
	audio: Audio;
	options?: ListeningOption[];
	hint?: string;
}

export interface Audio {
	url: string;
	duration: number;
	hint_text: string;
}

export interface ListeningAnswer {
	question_id: string;
	selected_option_id?: string;
	answer_text?: string;
	skipped?: boolean;
	evaluation_failed?: boolean;
	correct?: boolean;
	score?: number;
	feedback?: string;
	explanation?: string;
	strengths?: string[];
	missed_points?: string[];
	suggestions?: string[];
	answered_at?: string;
}

export interface ListeningSession {
	id: string;
	module_id: string;
	module_name: string;
	status: "active" | "completed";
	done: number;
	total: number;
	current_question_index: number;
	questions: ListeningQuestion[];
	answers: ListeningAnswer[];
	started_at: string;
}

export interface ListeningSummary {
	answered: number;
	correct: number;
	skipped: number;
	total: number;
}

export interface SpeakingModule {
	id: string;
	label: string;
	title?: string;
	description: string;
	difficulty: 1 | 2 | 3 | 4;
	difficulty_label: string;
	estimated_minutes: number;
	sentence_count: number;
}

export interface Syllable {
	text: string;
	highlighted?: boolean;
	stress: boolean;
	break: boolean;
}

export interface Sentence {
	id: string;
	text: string;
	syllables?: Syllable[];
	audio_url?: string;
}

export interface SpeakingAttempt {
	sentence_id: string;
	audio_url?: string;
	transcript?: string;
	score?: number;
	clarity?: number;
	completeness?: number;
	explanation?: string;
	feedback?: string;
	strengths?: string[];
	improvements?: string[];
	suggestions?: string[];
	created_at?: string;
}

export interface SpeakingSession {
	id: string;
	module_id: string;
	module_name: string;
	status: "active" | "completed";
	done: number;
	total: number;
	current_sentence_index: number;
	sentences: Sentence[];
	attempts: SpeakingAttempt[];
	started_at: string;
}

export interface SpeakingSummary {
	session_id: string;
	module_name: string;
	total: number;
	evaluated: number;
	skipped: number;
	average_score: number;
	completed_at: string;
}

export interface DayActivity {
	date: string;
	weekday: string;
	sessions: number;
	is_active: boolean;
}

export interface Activity {
	timezone: string;
	week_start: string;
	week_end: string;
	days: DayActivity[];
	active_days: number;
	target_days: number;
	completed_sessions: number;
	by_type: {
		listening: number;
		speaking: number;
	};
	streak_days: number;
}

export interface HistoryItem {
	session_id: string;
	type: "listening" | "speaking";
	module_id: string;
	module_name: string;
	difficulty: 1 | 2 | 3 | 4;
	status: "in_progress" | "completed";
	started_at: string;
	progress?: {
		done: number;
		total: number;
	};
	correct?: number;
	average_score?: number;
	module_title: string;
}

export interface HistoryResponse {
	items: HistoryItem[];
	next_cursor?: string;
}
