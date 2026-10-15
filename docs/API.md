 <!-- @format -->

# HearAble API

REST API for **HearAble**, a listening and speaking practice application designed for hearing-aid users. The API supports authentication, listening exercises, speaking practice, AI-based feedback, and learning progress tracking.

## API Overview

| Property                 | Details                                  |
| ------------------------ | ---------------------------------------- |
| API Version              | 2.0.0                                    |
| API Style                | REST                                     |
| Specification            | OpenAPI 3.0                              |
| Base URL                 | `https://api.hearable.nighttealabs.tech` |
| Authentication           | JWT Bearer Token                         |
| Access Token Expiration  | 15 minutes                               |
| Refresh Token Expiration | 30 days                                  |
| Default Server Timezone  | `Asia/Jakarta`                           |

### API Documentation

The complete API specification is available in [`openapi.yaml`](./openapi.yaml).

Use the OpenAPI specification with Swagger UI or another compatible API client to explore endpoint definitions, request parameters, response schemas, and error responses.

## Features

- **Authentication:** Register, log in, refresh tokens, and log out.
- **Listening Practice:** Complete multiple-choice and input-based listening exercises.
- **Speaking Practice:** Submit audio recordings and receive automated feedback.
- **Progress Tracking:** Track weekly activity, completed sessions, and practice streaks.
- **Practice History:** Review previous listening and speaking sessions.
- **Session Recovery:** Resume in-progress sessions and retrieve previously saved results.

## Authentication

Protected endpoints require a valid access token in the `Authorization` header.

```http
Authorization: Bearer <access_token>
```

### Authentication Endpoints

| Method | Endpoint            | Description                                   |
| ------ | ------------------- | --------------------------------------------- |
| POST   | `/v1/auth/register` | Create an account and log in                  |
| POST   | `/v1/auth/login`    | Log in with email and password                |
| POST   | `/v1/auth/refresh`  | Exchange a refresh token for a new token pair |
| POST   | `/v1/auth/logout`   | Revoke a refresh token                        |
| GET    | `/v1/me`            | Retrieve the current user's profile           |

### Register Request

`POST /v1/auth/register`

```json
{
	"name": "Rian",
	"email": "rian@example.com",
	"password": "rahasia123",
	"accept_terms": true
}
```

The `accept_terms` field indicates that the user has accepted the terms of service.

A successful registration returns HTTP `201 Created`, including the user profile, access token, refresh token, token type, and access token expiration.

### Login Request

`POST /v1/auth/login`

```json
{
	"email": "rian@example.com",
	"password": "rahasia123"
}
```

A successful login returns HTTP `200 OK` with the authenticated user and token pair.

### Token Lifecycle

1. Register or log in to obtain an access token and a refresh token.
2. Include the access token in the `Authorization` header when calling protected endpoints.
3. When the access token expires, exchange the refresh token through `/v1/auth/refresh`.
4. Replace both stored tokens with the newly issued token pair.
5. Log out through `/v1/auth/logout` when the user ends their session.

**Important:** Refresh tokens are single-use and rotate whenever refreshed. Reusing an old refresh token revokes every refresh token belonging to that user.

Clients should therefore:

- Persist the latest refresh token securely.
- Replace the access and refresh tokens together after a successful refresh.
- Prevent concurrent refresh requests from using the same refresh token.
- Clear local authentication state when the session can no longer be refreshed.
- Discard the access token after logout; it may remain valid until its 15-minute expiration.

Authentication endpoints share a rate limit of **10 requests per minute per IP address**.

## Listening Practice

The listening module provides interactive exercises for listening comprehension.

### Listening Endpoints

| Method | Endpoint                                      | Description                                 |
| ------ | --------------------------------------------- | ------------------------------------------- |
| GET    | `/v1/listening/modules`                       | Retrieve available listening modules        |
| POST   | `/v1/listening/sessions`                      | Start a listening session                   |
| GET    | `/v1/listening/sessions/{sessionID}`          | Retrieve a session to resume or review      |
| POST   | `/v1/listening/sessions/{sessionID}/answers`  | Submit an answer or skip a question         |
| POST   | `/v1/listening/sessions/{sessionID}/complete` | Complete a session and retrieve its summary |

### Listening Workflow

1. Retrieve available modules.
2. Select a module and start a session.
3. Display the returned questions, audio resources, and answer options.
4. Submit an answer or skip the current question.
5. Update the interface using the returned answer and feedback.
6. Repeat until the session is finished.
7. Call the completion endpoint to retrieve the final summary.

### Retrieve Modules

`GET /v1/listening/modules`

An optional `difficulty` query parameter filters modules by difficulty level.

```http
GET /v1/listening/modules?difficulty=1
```

The response contains a `modules` array. An empty array means that no content is currently available for the requested level.

### Start a Session

`POST /v1/listening/sessions`

```json
{
	"module_id": "<module_uuid>"
}
```

The response includes:

- Session metadata and status.
- Current progress (`done` and `total`).
- Questions, their positions, and prompt text.
- Audio URLs, durations, and optional hint text.
- Answer options for multiple-choice questions.

Correct answers are not included when a session starts.

### Submit an Answer

`POST /v1/listening/sessions/{sessionID}/answers`

Submit exactly one of the following answer types:

**Multiple-choice answer**

```json
{
	"question_id": "<question_uuid>",
	"selected_option_id": "<option_uuid>"
}
```

**Input-based answer**

```json
{
	"question_id": "<question_uuid>",
	"answer_text": "Contoh jawaban pengguna"
}
```

**Skip a question**

```json
{
	"question_id": "<question_uuid>",
	"skipped": true
}
```

Each question can be answered only once per session under normal operation.

If AI evaluation fails, the answer may be saved with the `evaluation_failed` status while the API returns HTTP `502` or `503`. When the error is retryable, resend the **same request** to retry the evaluation rather than creating a different answer.

Listening answer submissions are limited to **20 requests per minute per user**.

### Listening Scoring

HearAble supports two types of listening questions:

- **Multiple choice:** Graded exactly. A correct answer receives `100`; an incorrect answer receives `0`. No AI evaluation is involved.
- **Input-based questions:** AI compares the submitted answer against a trusted reference answer and accepts paraphrases. A score of at least `70` counts as correct.

The answer response may include the score, correctness, feedback criteria, explanation, strengths, missed points, suggestions, and answer timestamp, depending on the question type and evaluation result.

### Complete a Session

`POST /v1/listening/sessions/{sessionID}/complete`

The completion endpoint returns the session and a summary containing:

- `total`: Total questions.
- `answered`: Questions answered.
- `skipped`: Questions skipped or left unanswered.
- `correct`: Questions counted as correct.

The endpoint is idempotent. Unanswered questions count as skipped.

Calling this endpoint finishes the session; it should not be used merely to advance to the next question.

## Speaking Practice

The speaking module lets users practice target phrases by recording their speech and receiving automated feedback.

### Speaking Endpoints

| Method | Endpoint                                     | Description                                 |
| ------ | -------------------------------------------- | ------------------------------------------- |
| GET    | `/v1/speaking/modules`                       | Retrieve available speaking modules         |
| POST   | `/v1/speaking/sessions`                      | Start a speaking session                    |
| GET    | `/v1/speaking/sessions/{sessionID}`          | Retrieve a session to resume or review      |
| POST   | `/v1/speaking/sessions/{sessionID}/attempts` | Submit a recording or skip a sentence       |
| POST   | `/v1/speaking/sessions/{sessionID}/complete` | Complete a session and retrieve its summary |

### Speaking Workflow

1. Retrieve available speaking modules.
2. Start a session using the selected module.
3. Display the target sentences and their syllable information.
4. Let the user listen to example audio when available.
5. Record and submit an attempt, or skip the sentence.
6. Display the returned transcript, score, and feedback.
7. Complete the session to retrieve the final summary.

### Submit a Recording

`POST /v1/speaking/sessions/{sessionID}/attempts`

This endpoint uses `multipart/form-data`, not a JSON request body.

Required fields:

| Field         | Type        | Description                              |
| ------------- | ----------- | ---------------------------------------- |
| `sentence_id` | UUID        | Identifier of the target sentence        |
| `audio`       | Binary file | Recorded audio; required unless skipping |
| `skipped`     | String      | Indicates that the sentence is skipped   |

**Recording constraints**

- Maximum recording size: 10 MB.
- Supported formats: WebM, OGG, M4A/MP4, WAV, MP3, and FLAC.
- The server detects the format from the file contents.
- Each sentence can be submitted once per session.
- Speaking attempts are limited to 20 requests per minute per user.

A recording is sent to the speech-to-text provider for transcription and is not stored by the API. Only the transcript and feedback are saved.

If the recording produces an empty transcript or the speech-to-text provider fails, the attempt is not saved. The user can record and upload again.

### Example Multipart Request

```http
POST /v1/speaking/sessions/{sessionID}/attempts
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

Example form fields:

```text
sentence_id: <sentence_uuid>
audio: <recording_file>
```

For a skipped sentence, send the required `sentence_id` and `skipped` field according to the API's multipart schema. The `audio` field is not required when `skipped` is `true`.

### Speaking Feedback

Speaking evaluation follows two stages:

1. **Speech recognition:** The recording is transcribed into text.
2. **AI evaluation:** The transcript is compared with the target phrase.

The resulting score ranges from `0` to `100` and reflects:

- **Kejelasan (Clarity):** How recognizable the speech was to the speech recognition system.
- **Kelengkapan (Completeness):** How completely the transcript matches the target phrase.

Speaking scores do **not** directly measure pronunciation accuracy. They are intended as practice feedback, not as a clinical assessment.

The response may include the transcript, score, explanation, feedback criteria, strengths, improvements, suggestions, and creation timestamp.

### Complete a Speaking Session

`POST /v1/speaking/sessions/{sessionID}/complete`

The response includes a summary containing:

- `total`: Total sentences in the session.
- `evaluated`: Sentences with evaluated attempts.
- `skipped`: Sentences skipped or left without an attempt.
- `average_score`: Average speaking score.

The endpoint is idempotent. Sentences without an attempt count as skipped.

## Progress Tracking

HearAble provides endpoints for displaying weekly learning activity and reviewing previous sessions.

### Progress Endpoints

| Method | Endpoint          | Description                                                                 |
| ------ | ----------------- | --------------------------------------------------------------------------- |
| GET    | `/v1/me/activity` | Retrieve weekly activity, daily activity indicators, and streak information |
| GET    | `/v1/me/history`  | Retrieve listening and speaking practice history                            |

### Weekly Activity

`GET /v1/me/activity`

An optional `week_of` query parameter accepts any date within the desired week.

```http
GET /v1/me/activity?week_of=2026-10-12
```

The response includes:

| Field                | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| `timezone`           | Server timezone used for the activity calculation                              |
| `week_start`         | Start date of the requested week                                               |
| `week_end`           | End date of the requested week                                                 |
| `days`               | Daily activity data, including date, weekday, session count, and active status |
| `active_days`        | Number of active days in the week                                              |
| `target_days`        | Weekly activity goal; documented default is `5`                                |
| `completed_sessions` | Number of completed sessions                                                   |
| `by_type`            | Completed listening and speaking sessions by type                              |
| `streak_days`        | Consecutive active days                                                        |

The API returns a Monday–Sunday week in the server's configured timezone, which defaults to `Asia/Jakarta`.

A day is active when at least one listening or speaking session is completed on that day. The streak counts consecutive active days ending today, or yesterday if the user has not practiced today.

### Practice History

`GET /v1/me/history`

The endpoint returns listening and speaking sessions, newest first.

Supported query parameters:

| Parameter | Description                                                          |
| --------- | -------------------------------------------------------------------- |
| `limit`   | Maximum number of history items per page; default is `20`            |
| `cursor`  | Pagination cursor returned as `next_cursor` by the previous response |
| `status`  | Optional filter: `in_progress` or `completed`                        |

Example:

```http
GET /v1/me/history?status=in_progress&limit=1
```

Use this query for the application's **Lanjutkan belajar** card.

The response includes an `items` array and may include `next_cursor` for pagination. Each item can contain the session type, session and module identifiers, module title, difficulty, status, timestamps, progress, correct-answer count, and average score.

For complete feedback and saved session details, call the appropriate session-detail endpoint:

- `GET /v1/listening/sessions/{sessionID}`
- `GET /v1/speaking/sessions/{sessionID}`

Previously saved results are returned without calling the AI provider again.

## Difficulty Levels

The API uses four difficulty levels.

| Level | Name     |
| ----- | -------- |
| 1     | Pemula   |
| 2     | Dasar    |
| 3     | Menengah |
| 4     | Mahir    |

The `difficulty` query parameter can be used to filter both listening and speaking modules.

## Error Handling

API errors use a consistent JSON structure.

```json
{
	"error": {
		"code": "ERROR_CODE",
		"message": "Pesan kesalahan dalam Bahasa Indonesia",
		"retryable": false
	}
}
```

The `retryable` field is optional. Error messages are provided in Bahasa Indonesia and are intended to be safe to display to users.

### Common HTTP Status Codes

| Status | Meaning                                            | Recommended Client Behavior                                            |
| ------ | -------------------------------------------------- | ---------------------------------------------------------------------- |
| `400`  | Malformed request                                  | Check the request payload and parameters                               |
| `401`  | Missing, invalid, or expired credentials           | Attempt token refresh when appropriate; otherwise require login        |
| `404`  | Resource not found or not accessible to the caller | Display an appropriate message and verify session state                |
| `409`  | Invalid session state or item already answered     | Refresh session state instead of blindly resubmitting                  |
| `413`  | Recording exceeds the size limit                   | Ask the user to record a smaller file                                  |
| `415`  | Unsupported audio format                           | Check the recording format                                             |
| `422`  | Input validation failed                            | Display the relevant validation message                                |
| `429`  | Rate limit exceeded                                | Respect the retryability information and avoid rapid repeated requests |
| `502`  | AI provider failure or overload                    | Retry only when indicated by the response                              |
| `503`  | AI provider unavailable or overloaded              | Retry only when indicated by the response                              |

The exact response codes vary by endpoint. Consult `openapi.yaml` for endpoint-specific responses.

### Client Error-Handling Guidelines

- Use the HTTP status and error `code` to identify the failure.
- Display the returned `message` when appropriate.
- Check `retryable` before offering a retry action.
- Avoid retrying non-idempotent operations blindly.
- For failed listening AI evaluation, resend the same answer request when the API indicates that retrying is appropriate.
- For failed speaking transcription, allow the user to record and upload again because the failed attempt is not saved.
- Handle `401` responses centrally so that token refresh and session expiration follow a consistent flow.

## System Endpoints

| Method | Endpoint  | Description              |
| ------ | --------- | ------------------------ |
| GET    | `/health` | Check API service health |

The health endpoint can be used to check whether the API service is responding.

## API Schemas

The OpenAPI specification defines the request and response schemas used by the API, including:

- Authentication: `RegisterRequest`, `LoginRequest`, `RefreshRequest`, `AuthResponse`, `User`
- Sessions: `StartSessionRequest`, `Session`, `Progress`
- Modules: `ModuleBase`, `ListeningModule`, `SpeakingModule`
- Listening: `ListeningQuestion`, `ListeningFeedback`, `ListeningAnswer`, `ListeningSessionDetail`, `SubmitAnswerRequest`, `ListeningSummary`
- Speaking: `Syllable`, `Sentence`, `SpeakingAttempt`, `SpeakingSessionDetail`, `SpeakingSummary`
- Progress: `Activity`, `HistoryItem`, `History`
- Shared responses: `Error`, `SimpleMessage`

Refer to [`openapi.yaml`](./openapi.yaml) for the complete schema definitions, required fields, and endpoint-specific response details.

## Implementation Notes for React Native

### API Client

Keep API requests in a dedicated API layer rather than implementing HTTP calls directly inside screen components.

A suggested structure is:

```text
src/
  api/
    client.ts
    auth.api.ts
    listening.api.ts
    speaking.api.ts
    progress.api.ts
  types/
    api.types.ts
  services/
    auth.service.ts
```

Adapt the directory names to the existing project structure rather than introducing duplicate layers.

### Authentication State

- Keep token lifecycle logic centralized in the API client or authentication service.
- Store refresh tokens using secure device storage appropriate for sensitive credentials.
- Do not store passwords after authentication.
- Do not hardcode tokens or credentials in the source code.
- Avoid multiple simultaneous refresh requests using the same refresh token.
- Clear authenticated state when refresh fails and the session cannot be recovered.

### Loading and Error States

Screens that depend on API responses should handle:

- Initial loading.
- Empty data.
- Successful responses.
- Recoverable failures.
- Authentication expiration.
- In-progress submissions.
- Duplicate submission prevention.

For listening and speaking sessions, keep server-returned session identifiers as the source of truth. Do not assume that a local screen transition means the server has recorded the answer or completed the session.

### Audio Uploads

- Request microphone permission before recording.
- Validate file size and supported formats before upload when possible.
- Use `multipart/form-data` for speaking attempts.
- Ensure the file URI and filename are correctly mapped to the React Native upload request.
- Prevent accidental duplicate submissions while an upload is in progress.
- Provide a clear retry or re-record action when transcription fails.

### API Types

Use TypeScript types matching the OpenAPI schemas for request payloads and responses.

Keep request and response types in the API layer so that UI components do not need to duplicate API-specific structures. Use the actual schema definitions as the source of truth instead of inferring missing fields from sample responses.

## Important Notes

- Access tokens expire after 15 minutes.
- Refresh tokens expire after 30 days and can only be used once.
- Reusing a rotated refresh token revokes all refresh tokens belonging to that user.
- Listening multiple-choice questions are graded exactly without AI.
- Listening input answers are evaluated against trusted reference answers, with paraphrases accepted.
- Speaking recordings are transcribed but are not stored by the API.
- Speaking feedback evaluates speech recognizability and transcript completeness, not pronunciation directly.
- All AI scores range from `0` to `100` and are intended for practice feedback, not clinical assessment.
- In-progress sessions can be retrieved and resumed through their session-detail endpoints.
- Rate limits apply to authentication, listening answers, and speaking attempts as documented above.

## License

Refer to the repository's license file for licensing information.
