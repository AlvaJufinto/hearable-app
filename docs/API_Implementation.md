<!-- @format -->

# OpenCode Implementation Guide — HearAble API Integration

## Objective

Iteratively implement real functionality in the HearAble React Native application by connecting existing UI screens to the documented backend API.

The objective is to evolve the current UI prototype into a functional application while preserving the existing design, navigation, accessibility, and maintainability.

This is an incremental implementation task, not a complete rewrite.

**Priorities:**

1. Implement real functionality using the documented API.
2. Preserve the existing UI and match Figma.
3. Reuse existing components and follow `AGENTS.md`.
4. Keep API communication separate from presentation.
5. Verify every implemented feature before moving to the next one.

Do not attempt to implement the entire application in a single, unverified change.

## 1. Mandatory References

Before making changes, inspect these files and resources:

- `AGENTS.md` — mandatory project conventions, architecture, accessibility, and implementation workflow.
- `docs/API.md` — authoritative API integration documentation.
- `docs/openapi.yaml` — authoritative endpoint definitions, request parameters, response schemas, and error formats.
- `constant/theme.ts` — shared design tokens.
- Existing navigation, screens, components, hooks, services, types, and installed dependencies.
- The corresponding Figma frames whenever UI changes are necessary.

If a reference uses a different path in the actual repository, inspect the repository and use the correct path.

**Precedence rules:**

- Follow `AGENTS.md` for project conventions and code quality.
- Follow `docs/API.md` and `docs/openapi.yaml` for backend contracts.
- Follow Figma for intended visual design.
- Follow existing source code for established navigation and implementation patterns, unless they conflict with documented requirements.

Never invent endpoints, request fields, response fields, authentication behavior, or backend capabilities.

If the documentation is incomplete or contradictory, investigate the available evidence and explicitly report the unresolved issue. Do not silently invent a solution.

## 2. Initial Repository Audit

Before implementing anything, inspect the current application.

Identify:

- The framework and React Native version.
- The navigation structure and screen routes.
- Existing authentication and onboarding screens.
- Listening practice screens and components.
- Speaking practice screens and components.
- Home dashboard, progress, history, profile, and settings screens.
- Existing API clients, service modules, hooks, and TypeScript types.
- Current state-management and persistence solutions.
- Existing audio recording and playback functionality.
- Existing permission handling.
- Available lint, type-check, test, and build commands.
- Existing mock data and hardcoded placeholder behavior.

Determine which screens already exist, which interactions are functional, and which features are only visual placeholders.

Do not assume that a screen is unfinished merely because its implementation differs from an ideal architecture.

### Audit deliverable

Create a concise implementation checklist based on the actual repository.

For each feature, identify:

- Current implementation status.
- Relevant screens and files.
- Required API endpoints.
- Missing functionality.
- Dependencies or blockers.
- Verification method.

Do not modify unrelated files during the audit.

## 3. Implementation Strategy

Work in small, independently verifiable increments.

Use the following general implementation order, adjusting it only when the actual navigation or feature dependencies justify doing so.

### Phase 1 — API foundation

Implement the minimum infrastructure required for reliable API communication.

Requirements:

- Configure the documented API base URL.
- Reuse an existing HTTP client if one already exists.
- Otherwise, introduce the smallest suitable API client using existing dependencies or available platform APIs.
- Define shared request and response types from `docs/openapi.yaml`.
- Implement consistent handling for network failures and documented API errors.
- Support authenticated requests through the documented Bearer token mechanism.
- Keep endpoint-specific request logic out of shared UI components.
- Make configuration appropriate for local development and production builds.
- Never hardcode credentials, real user passwords, or issued tokens in source code.

Do not build an elaborate networking framework for this application.

### Phase 2 — Authentication

Implement the documented authentication flow:

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET /v1/me`

Connect the existing registration and login screens to the backend.

Requirements:

- Validate user input appropriately.
- Display loading, success, and failure states.
- Prevent accidental duplicate submissions while a request is pending.
- Persist authentication credentials using a suitable secure storage solution supported by the current project.
- Restore the user's authenticated state when the application starts.
- Retrieve the current user profile through the documented endpoint.
- Handle logout and clear locally stored credentials appropriately.
- Follow the actual request and response schemas in the OpenAPI specification.

#### Critical token rotation rules

The access token expires after 15 minutes. The refresh token expires after 30 days and is single-use.

When refreshing:

1. Send the currently valid refresh token to the documented refresh endpoint.
2. Process the returned token pair according to the actual response schema.
3. Replace both stored tokens atomically where the storage implementation permits.
4. Ensure that concurrent requests do not independently submit the same refresh token.
5. Handle refresh failures without entering an infinite retry loop.
6. If the session cannot be recovered, clear invalid authentication state and require the appropriate sign-in flow.

Do not retry a failed refresh using the same rotated refresh token.

Do not invent additional refresh policies that contradict the backend documentation.

### Phase 3 — Listening practice

Implement the documented listening workflow:

- `GET /v1/listening/modules`
- `POST /v1/listening/sessions`
- `GET /v1/listening/sessions/{sessionID}`
- `POST /v1/listening/sessions/{sessionID}/answers`
- `POST /v1/listening/sessions/{sessionID}/complete`

Connect the existing listening screens to real API data.

Requirements:

- Retrieve available modules.
- Display module information and difficulty using the documented schemas.
- Start a session using the documented request payload.
- Load the current question and its available answer options.
- Submit selected answers or skip questions according to the documented contract.
- Handle pending requests, submission errors, and transitions between questions.
- Complete the session and display the returned summary.
- Support resuming or reviewing a session when supported by the documented API and existing UI.

Respect the documented scoring rules:

- Multiple-choice answers are graded exactly by the backend.
- Input-based answers are evaluated against a trusted reference answer, with paraphrases accepted.
- A score of at least 70 counts as correct for input-based questions.

Do not implement independent client-side scoring that overrides the backend result.

Do not expose trusted reference answers before submission unless the API explicitly permits it.

### Phase 4 — Speaking practice

Implement the documented speaking workflow:

- `GET /v1/speaking/modules`
- `POST /v1/speaking/sessions`
- `GET /v1/speaking/sessions/{sessionID}`
- `POST /v1/speaking/sessions/{sessionID}/attempts`
- `POST /v1/speaking/sessions/{sessionID}/complete`

Connect the existing speaking practice screens to real session data and backend feedback.

Requirements:

- Retrieve available speaking modules.
- Start and retrieve speaking sessions.
- Display the target sentence and any documented syllable information.
- Implement audio recording using an existing compatible solution when available.
- Request microphone permission only when needed.
- Start recording only following an appropriate user action.
- Provide visible recording, processing, success, and failure states.
- Submit recordings or skip sentences using the documented request format.
- Display returned speech recognition and evaluation feedback.
- Allow the user to continue practicing and complete the session.
- Display the returned practice summary.

Inspect `docs/openapi.yaml` carefully to determine the exact audio submission format, content type, field names, and required metadata.

Do not guess whether the backend expects a file upload, multipart form, encoded audio, or another representation.

Do not permanently store raw recordings. Clean up temporary audio files when they are no longer needed, subject to the recording library's requirements.

#### Feedback limitations

Speaking scores represent speech recognizability and transcript completeness. They do not directly measure pronunciation accuracy and must not be presented as clinical assessments.

Preserve these distinctions in the UI.

### Phase 5 — Home dashboard and progress

Implement:

- `GET /v1/me/activity`
- `GET /v1/me/history`

Connect the existing home and progress screens to real activity and history data.

Requirements:

- Display weekly activity using the documented response schema.
- Display daily activity indicators and streak information when returned.
- Retrieve listening and speaking practice history.
- Display available session summaries and results.
- Support loading, empty, and error states.
- Format dates and numerical values consistently with the existing application.

Do not calculate or fabricate streaks, historical sessions, progress scores, or completed activities when the API does not provide the necessary information.

Use local formatting for presentation, but treat backend data as authoritative for persisted learning progress.

### Phase 6 — Profile and onboarding

Integrate profile and onboarding screens with actual authentication and user data where supported.

Use `GET /v1/me` for the current user profile.

Inspect the documented API before implementing profile updates or persisting onboarding responses.

If the backend does not expose an operation, do not invent one. Keep the unsupported behavior clearly identified and ask for clarification when it materially affects the intended user flow.

## 4. Architecture and Code Quality

Follow the existing structure and conventions documented in `AGENTS.md`.

The conceptual organization is:

```text
components/
├── ui/
├── auth/
├── onboarding/
├── home/
├── speech-practice/
├── audio-recognition/
├── progress/
└── profile/

services/
hooks/
types/
utils/
constant/
└── theme.ts
```

Adapt to the repository's actual structure rather than reorganizing it wholesale.

### API service layer

Keep network communication in the established service layer.

Example organization, only if the repository does not already provide an appropriate equivalent:

```text
services/
├── api/
│   ├── client.ts
│   └── errors.ts
├── auth.service.ts
├── listening.service.ts
├── speaking.service.ts
└── progress.service.ts
```

This is an example, not a requirement to create every file.

Each service should expose focused operations corresponding to documented API capabilities.

### Hooks and screens

Use existing hooks and state-management conventions where possible.

Hooks may manage feature-specific request state, such as loading, returned data, and errors, when doing so improves clarity.

Screens should coordinate user interactions and present application state. They should not contain duplicated HTTP request implementations.

### Components

- Reuse existing components before creating new ones.
- Keep `components/ui/` independent of backend business logic.
- Keep feature-specific behavior in the relevant feature directory.
- Do not duplicate buttons, cards, inputs, or loading indicators.
- Avoid wrappers and abstractions without a concrete benefit.
- Preserve the existing React Native `StyleSheet.create()` styling approach.
- Reuse tokens from `constant/theme.ts`.

Do not introduce a new state-management library, HTTP client, or styling framework unless the existing implementation cannot reasonably satisfy the requirement.

## 5. Real Functionality vs. Mock Data

The application must distinguish actual backend functionality from temporary UI placeholders.

For each integrated feature:

- Fetch real data from the documented endpoint.
- Submit real user actions to the appropriate endpoint.
- Render the returned response.
- Handle errors without crashing.
- Preserve relevant state during the interaction.
- Remove obsolete mock data from the production execution path when the integration is complete.

Do not silently fall back to fabricated successful responses when a request fails.

If mock data remains necessary for development, keep it isolated from the production API flow and label it clearly.

Never claim that registration, authentication, recording submission, scoring, progress tracking, or another backend-dependent feature works until it has been verified.

## 6. UI, Accessibility, and Privacy

Backend integration must not become an excuse to redesign the existing application.

- Preserve the existing screen layout and navigation.
- Consult Figma for affected screens.
- Reuse `constant/theme.ts` tokens.
- Use React Native styling conventions already established by the project.
- Keep all essential instructions and feedback available visually.
- Provide understandable loading, success, empty, and error states.
- Do not communicate essential states through color alone.
- Maintain accessible labels and usable touch targets.
- Handle microphone permission denial gracefully.
- Never start recording without an appropriate user action.
- Do not introduce permanent raw-audio storage.
- Do not describe AI-generated scores as clinical diagnoses.

Any UI changes should be limited to what is necessary to support real functionality and documented interaction states.

## 7. Error Handling

Use the documented API error structure:

```json
{
	"error": {
		"code": "ERROR_CODE",
		"message": "Pesan kesalahan dalam Bahasa Indonesia",
		"retryable": false
	}
}
```

The `retryable` field is optional.

Requirements:

- Parse error responses defensively.
- Use documented error codes for application-level handling when available.
- Display appropriate backend messages in Bahasa Indonesia when safe and relevant.
- Handle network failures, unexpected responses, timeouts, and permission failures.
- Avoid displaying raw stack traces or sensitive implementation details.
- Do not assume every error response matches the example exactly.
- Do not retry non-idempotent operations blindly.
- Follow the token rotation rules for authentication failures.
- Keep errors recoverable whenever the application can reasonably offer a recovery action.

Avoid introducing a large error-handling framework for a small set of documented response patterns.

## 8. Verification Requirements

After implementing each feature, run the relevant available checks.

Examples include:

- TypeScript type-checking.
- ESLint or the repository's configured linter.
- Relevant automated tests.
- Application build.
- Android emulator or physical-device testing.

Use the scripts and dependencies that actually exist in the repository.

Verify applicable scenarios:

**Authentication**

- Successful registration and login.
- Invalid credentials or validation errors.
- Authenticated application startup.
- Expired access token and refresh behavior.
- Logout and invalid refresh token handling.

**Listening**

- Module loading.
- Session creation.
- Answer submission and skipping.
- Session completion.
- Empty and error states.

**Speaking**

- Module loading and session creation.
- Microphone permission granted or denied.
- Recording and submission.
- Backend feedback display.
- Session completion and recording failure.

**Progress**

- Activity loading.
- History loading.
- Empty history.
- Network and API errors.

Do not claim that a scenario passed unless it was actually tested.

If the backend is unreachable or credentials are unavailable, distinguish implementation verification from live backend verification.

If a check cannot be performed, state the reason explicitly.

## 9. Iterative Execution Protocol

Follow this protocol for every implementation increment.

### Step 1 — Inspect

Read the relevant documentation and source files. Identify existing reusable code and the exact API contract.

### Step 2 — Plan

State:

- The feature being implemented.
- The files likely to change.
- The endpoints involved.
- The expected user-visible behavior.
- The verification steps.
- Any unresolved blockers.

Keep the plan proportional to the task.

### Step 3 — Implement

Make the smallest complete change that satisfies the selected feature.

Do not implement unrelated features or perform broad refactoring.

### Step 4 — Verify

Run the relevant checks and inspect the resulting diff.

Fix regressions introduced by the change before proceeding.

### Step 5 — Report

Summarize:

- What functionality was implemented.
- Which API endpoints are integrated.
- Which files changed.
- Which checks were run and their actual results.
- What remains incomplete.
- Any backend, environment, or documentation blockers.

### Step 6 — Continue

After completing an increment, select the next logical incomplete feature based on dependencies and implementation readiness.

Maintain an explicit checklist so work can resume without repeating completed tasks.

Do not stop after merely creating service files or API types. The objective is to connect the actual UI interactions to the backend and verify the resulting behavior.

Do not proceed through every phase blindly if a dependency or undocumented contract prevents reliable implementation. Resolve the blocker or move to an independent feature when appropriate.

## 10. Definition of Done

An individual feature is complete when applicable requirements are satisfied:

- [ ] The actual UI interaction is connected to the documented API.
- [ ] Request and response handling follow `docs/openapi.yaml`.
- [ ] Appropriate loading, success, empty, and error states are implemented.
- [ ] Authentication and token handling follow the documented lifecycle.
- [ ] Existing navigation and unrelated functionality remain intact.
- [ ] UI changes remain consistent with Figma and `constant/theme.ts`.
- [ ] Accessibility and privacy requirements are preserved.
- [ ] Existing components are reused where appropriate.
- [ ] No undocumented API behavior has been invented.
- [ ] Relevant checks have been performed and reported honestly.
- [ ] Remaining limitations are documented.

The application as a whole is complete only when all required, supported user flows have been implemented and verified to the extent permitted by the available backend and testing environment.

## Final Instruction to OpenCode

Start by auditing the actual repository and producing the implementation checklist. Then begin with the highest-priority incomplete feature whose requirements are sufficiently documented.

Implement real, end-to-end functionality incrementally. Preserve the current UI, reuse existing code, follow `AGENTS.md`, and treat `docs/API.md` and `docs/openapi.yaml` as the backend contract.

**Do not merely prepare the architecture. Implement, connect, test, and report each feature before moving on.**
