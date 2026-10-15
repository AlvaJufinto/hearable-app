<!-- @format -->

# HearAble — Codebase Improvement & Implementation Guide

## 1. Mission

Improve the existing HearAble React Native application into a consistent, maintainable, and fully functional application through incremental codebase auditing, refactoring, and feature implementation.

The current codebase may contain duplicated components, inconsistent styling, oversized screen files, unnecessary abstractions, redundant state, unclear data flow, incomplete interactions, and inconsistent implementation patterns introduced during rapid AI-assisted development.

Your task is to inspect the entire repository, identify concrete problems, and implement meaningful improvements without unnecessarily rewriting the application.

**The primary focus is React Native UI code, code structure, and data flow.** API integration and backend functionality are important parts of the application, but they must fit into a clean, predictable implementation rather than driving unnecessary architectural complexity.

The objective is to improve how the application is built, how its code is organized, how its state flows, and how its features work.

### Main priorities

1. Clean and understandable React Native screens and components.
2. Consistent component architecture and file organization.
3. Predictable data flow and appropriate state ownership.
4. Removal of duplicated UI, business logic, and data transformations.
5. Functional user interactions and consistent application behavior.
6. Maintainable TypeScript contracts and appropriate separation of concerns.
7. Consistent styling and fidelity to the existing Figma design.
8. Reliable API integration based on documented contracts.
9. Appropriate loading, empty, success, error, and recovery states.
10. Meaningful verification of changes and prevention of regressions.

**Do not merely produce recommendations. Audit the repository, implement justified improvements, verify them, and continue through the major feature areas.**

## 2. Project Context

HearAble is a React Native application for deaf and hard-of-hearing learners to practice speech and auditory recognition independently.

The application includes:

- Authentication and onboarding.
- Speaking practice with recording and visual feedback.
- Listening and audio recognition exercises.
- Practice summaries and gamification.
- Learning progress and practice history.
- User profile and settings.

The application prioritizes visual instructions, accessible interactions, understandable feedback, and user privacy.

HearAble is a self-guided learning tool, not a clinical diagnostic tool or a replacement for professional speech therapy.

### Current development context

The project began in a UI-slicing phase and may contain incomplete features or temporary mock data.

Do not assume that all mock data is a defect. Determine whether each implementation is intentionally temporary, partially implemented, or incorrectly replacing an already-supported feature.

The codebase should evolve incrementally toward functional behavior while preserving existing UI and navigation.

## 3. Mandatory References

Before modifying the relevant parts of the application, inspect:

- `AGENTS.md` — permanent project rules, architecture, coding standards, and constraints.
- `docs/API_implementation.md` — API integration documentation process.
- `docs/API.md` — detailed API definitions, request parameters, and response schemas, when available.
- `constant/theme.ts` — existing design tokens.
- Figma — intended screen design, component proportions, layout, and styling.
- Existing source code — actual navigation, dependencies, state management, and working behavior.
- `package.json` and the lockfile — installed dependencies and available scripts.
- Existing tests and configuration — current validation methods and established conventions.

Use the actual file paths discovered in the repository.

When documentation, existing behavior, and the implementation disagree, investigate the discrepancy. Do not silently invent requirements.

Never invent API endpoints, response fields, navigation flows, design specifications, or business rules.

If a missing requirement materially affects correctness and cannot be determined from available evidence, document the blocker instead of fabricating an implementation.

## 4. Initial Repository Audit

Begin by understanding the actual codebase before refactoring.

Inspect the project structure, application entry points, routing, screens, components, hooks, services, types, constants, utilities, and configuration.

Do not immediately reorganize files or replace libraries simply because another architecture looks cleaner.

### 4.1 Inspect React Native UI

Review every major feature area and identify:

- Screens containing too much unrelated logic.
- Components with unclear responsibilities.
- Duplicate buttons, cards, headers, inputs, and other UI elements.
- Feature components that should remain local but have been placed in shared UI.
- Components that are almost identical but differ only in styling.
- Excessively configurable components with too many boolean props.
- Repeated inline styles and duplicated design tokens.
- Inconsistent typography, spacing, colors, and dimensions.
- Missing or inconsistent loading, empty, error, and success states.
- Interactive elements with incomplete or misleading behavior.
- Unnecessary component extraction that makes the code harder to follow.

Inspect actual usage before deciding whether a component should be merged, extracted, or kept separate.

### 4.2 Inspect code structure

Identify:

- Files responsible for too many unrelated concerns.
- Duplicated business logic across screens.
- Hooks that unnecessarily wrap simple functions.
- Services that duplicate request logic.
- Utilities with unclear or mixed responsibilities.
- Duplicate TypeScript definitions.
- Circular dependencies or confusing import relationships.
- Unnecessary architectural layers.
- Overly fragmented modules.
- Unused or redundant dependencies.
- Code that makes testing or future development unnecessarily difficult.

Prioritize problems that create actual maintenance or correctness issues over stylistic preferences.

### 4.3 Trace data flow

For each major feature, trace how data moves through the application.

Identify:

- Where the data originates.
- Which component, hook, service, or state store owns it.
- How user input changes it.
- How asynchronous requests update it.
- How responses reach the UI.
- Where data is transformed or validated.
- Whether multiple components maintain competing copies of the same data.
- Whether navigation causes state loss or stale data.
- Whether old requests can overwrite newer results.
- Whether loading and error states accurately represent the operation.

Pay particular attention to listening and speaking sessions, where module selection, session creation, answers, recordings, feedback, and completion may be connected.

### 4.4 Establish a baseline

Inspect the available scripts and run relevant checks before substantial changes when feasible.

Determine the existing status of:

- TypeScript.
- Linting.
- Formatting.
- Tests.
- Application builds.
- Android execution.
- Relevant existing feature behavior.

Record important pre-existing failures so they are not incorrectly attributed to subsequent refactoring.

Inspect the Git working tree before editing. Preserve existing user modifications and do not overwrite unrelated work.

### 4.5 Create an actionable checklist

Produce a concise, prioritized implementation checklist containing:

| Field           | Purpose                                         |
| --------------- | ----------------------------------------------- |
| Area            | Affected screen, component, service, or feature |
| Finding         | Concrete problem discovered                     |
| Impact          | Why the problem matters                         |
| Proposed change | Minimal justified improvement                   |
| Dependencies    | Related files or functionality                  |
| Verification    | How to confirm the change works                 |
| Status          | Not started, in progress, blocked, or completed |

After establishing the checklist, begin implementing the highest-priority actionable improvement.

Do not stop after producing the audit.

## 5. React Native UI Implementation Standards

### 5.1 Keep screens readable

Screen components should primarily compose the page, coordinate screen-level interactions, and render the current state.

A screen may:

- Read navigation parameters.
- Connect to feature-specific hooks.
- Arrange feature components.
- Pass data and callbacks to child components.
- Handle screen-level navigation.
- Render loading, empty, success, and error states.

Avoid combining extensive JSX, raw HTTP requests, business rules, form validation, response parsing, and unrelated state updates inside one component.

When a screen becomes difficult to understand, identify its actual responsibilities and extract meaningful sections or behavior.

Do not split a component merely because it exceeds an arbitrary line count.

### 5.2 Separate components by responsibility

Use feature directories for feature-specific UI and `components/ui/` for generic, reusable primitives.

For example:

```text
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── LoadingState.tsx
│   └── ErrorState.tsx
├── auth/
│   └── LoginForm.tsx
├── home/
│   └── ActivitySummary.tsx
├── speech-practice/
│   ├── RecordingControls.tsx
│   └── TargetSentence.tsx
├── audio-recognition/
│   └── ListeningQuestionCard.tsx
└── progress/
    └── HistoryItem.tsx
```

This is an example only. Adapt it to the actual repository and navigation structure.

Do not create these files if equivalent components already exist.

### 5.3 Reuse before creating

Before creating or extracting a component:

1. Search for equivalent components in `components/ui/`.
2. Search the relevant feature directory.
3. Inspect existing props and variants.
4. Compare behavior, responsibilities, and styling.
5. Determine whether an existing component can support the requirement through a small extension.

Create a new component only when it has a meaningful responsibility that existing components cannot reasonably support.

Do not merge components solely because their JSX looks similar.

### 5.4 Design component interfaces carefully

Props should be explicit and easy to understand.

Prefer:

```tsx
type ModuleCardProps = {
	title: string;
	description: string;
	onPress: () => void;
};
```

Avoid interfaces that expose unnecessary application state or require excessive configuration.

Do not pass an entire state object when only a few values are needed.

Do not pass navigation objects through several component layers merely to avoid defining a clear callback.

Keep shared components independent of feature-specific business logic.

### 5.5 Preserve UI fidelity

Use Figma as the visual reference for existing screens.

Before changing UI:

1. Locate the corresponding frame.
2. Inspect the existing shared components.
3. Inspect `constant/theme.ts`.
4. Implement the required changes.
5. Compare the result against Figma when visual inspection is available.

Preserve layout, spacing, typography, colors, hierarchy, and proportions unless a change is explicitly required.

Do not redesign unrelated screens during code cleanup.

## 6. Code Structure and Separation of Concerns

### 6.1 Keep related logic together

A function does not automatically require its own file.

Split files when the separation meaningfully improves responsibility boundaries, readability, reuse, or testability.

Avoid excessive fragmentation such as:

- A component file containing only a trivial wrapper.
- Multiple files forwarding the same function calls without adding value.
- Generic abstractions used by only one simple operation.
- Utility modules mixing unrelated business logic.
- Duplicated implementations in shared and feature-specific directories.

Prefer the simplest maintainable structure.

### 6.2 Use the right layer for each responsibility

Use these boundaries as general guidance:

| Layer             | Primary responsibility                     |
| ----------------- | ------------------------------------------ |
| UI component      | Visual rendering and direct interaction    |
| Feature component | Feature-specific UI composition            |
| Screen            | Screen-level orchestration and navigation  |
| Hook              | Reusable stateful behavior, when justified |
| Service           | API and external system communication      |
| Utility           | Focused reusable operations                |
| Type definitions  | Data and component contracts               |
| Theme/constants   | Shared configuration and design tokens     |

Not every feature needs every layer.

For example, a button that toggles local visibility does not require a service, repository, and custom hook.

### 6.3 Avoid unnecessary architecture

Do not introduce:

- A second state-management library without a concrete need.
- Multiple competing API clients.
- Generic repository patterns for simple API operations.
- Excessive wrapper components.
- Hooks that only rename trivial operations.
- Large abstractions for a small feature.
- Dependency injection frameworks without a clear requirement.
- Complex factories and generic utilities for straightforward code.
- Premature optimization.

An abstraction is justified when it eliminates real duplication, isolates a complicated responsibility, improves correctness, or makes testing meaningfully easier.

### 6.4 TypeScript quality

- Avoid `any` unless there is a documented, unavoidable reason.
- Prefer clear, specific types.
- Reuse existing type definitions for equivalent contracts.
- Avoid unnecessary type assertions and non-null assertions.
- Handle optional and nullable values explicitly.
- Use discriminated unions where they clarify mutually exclusive states.
- Align API types with the actual OpenAPI contract.
- Avoid creating duplicate types for the same data structure.
- Avoid sophisticated generic types when a simple interface is sufficient.

Never invent response fields to make an implementation compile.

## 7. Data Flow and State Management

**Maintain one clear source of truth for each piece of application data wherever practical.**

Data flow should be traceable without requiring developers to inspect numerous unrelated files.

A common data flow for a backend-driven screen is:

```text
User Interaction
       |
       v
Screen / Feature Component
       |
       v
Feature Hook or Existing State Logic
       |
       v
Service / API Client
       |
       v
Backend
       |
       v
Response and Error Handling
       |
       v
Feature State Update
       |
       v
Rendered UI
```

This is a conceptual example, not a requirement to introduce a new hook for every screen.

### 7.1 State ownership

Choose the appropriate owner for each piece of state.

**Local UI state**

Use component-local state for temporary presentation behavior, such as dialog visibility, password visibility, and local selection controls.

**Feature state**

Keep feature-specific state near the feature that uses it.

Examples include the active listening question, speaking recording status, or current practice step.

**Shared application state**

Use the existing shared-state solution for information genuinely needed across multiple screens, such as authenticated user information when appropriate.

Do not place every state variable in a global store.

**Server state**

Keep backend data associated with a clear source of truth and update lifecycle.

If the project already uses a data-fetching library, follow its existing patterns instead of introducing a competing implementation.

### 7.2 Avoid redundant state

Avoid storing duplicate values that can be reliably derived from existing state.

For example, do not maintain a selected answer and several separate booleans describing the same selection when the necessary state can be represented directly.

Avoid:

- Multiple booleans describing mutually exclusive states.
- State that simply mirrors props.
- Duplicated copies of server data.
- Effects used only to synchronize derived values.
- Redundant loading and success flags that can contradict one another.

Use a clear state representation for asynchronous operations and complex recording workflows.

### 7.3 Handle asynchronous operations correctly

Review:

- Pending states.
- Request failures.
- Duplicate submissions.
- Stale responses.
- Component unmounting and navigation changes.
- Obsolete requests.
- Promise rejections.
- Resource cleanup.

Use cancellation when supported and appropriate.

Prevent stale responses from overwriting current data when the interaction requires it.

Do not blindly retry non-idempotent requests or create complex synchronization mechanisms without a concrete need.

### 7.4 Keep transformations consistent

Avoid duplicating the same business rule across screens.

Place data transformations where they can be understood, reused, and tested appropriately.

For example:

- Services handle external communication.
- Shared transformations live in focused utilities when appropriate.
- Feature hooks coordinate related stateful behavior.
- Screens compose the relevant data.
- UI components handle presentation-specific formatting.

Do not create a mapper for every response unless it solves an actual problem.

### 7.5 Practice session consistency

Trace the complete listening and speaking workflows.

Verify that the active session, current question or sentence, submitted answer or recording, returned feedback, and final summary remain consistent.

Follow the actual API contract for session identifiers, progression, skipping, and completion.

Do not fabricate progress or scoring results when the server has not returned them.

## 8. Reference Code Examples

The following examples show the expected implementation quality. They are illustrative patterns, not exact code to copy without inspecting the project.

### 8.1 Prefer an explicit asynchronous state

Avoid:

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(false);
const [success, setSuccess] = useState(false);
```

These states can contradict one another.

Prefer a discriminated union when the operation has mutually exclusive states:

```tsx
type AsyncState<T> =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "success"; data: T };
```

Render these states explicitly:

```tsx
if (state.status === "loading") {
	return <LoadingState />;
}

if (state.status === "error") {
	return <ErrorState message={state.message} onRetry={reload} />;
}

return <ModuleList modules={state.data} />;
```

Handle empty collections separately when appropriate.

Do not force this abstraction onto every simple interaction.

### 8.2 Keep presentational components simple

A feature card might look like this:

```tsx
type ModuleCardProps = {
	title: string;
	description: string;
	onPress: () => void;
};

export function ModuleCard({ title, description, onPress }: ModuleCardProps) {
	return (
		<Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.description}>{description}</Text>
		</Pressable>
	);
}
```

The card owns its presentation. The parent or feature layer decides which action to perform.

Avoid embedding authentication requests, API calls, or feature-specific navigation inside a generic card.

### 8.3 Keep network requests out of presentational components

An illustrative service:

```tsx
import { apiClient } from "@/services/api/client";
import type { ListeningModule } from "@/types/listening";

export async function getListeningModules(): Promise<ListeningModule[]> {
	const response = await apiClient.get<ListeningModule[]>(
		"/v1/listening/modules",
	);

	return response.data;
}
```

This assumes the existing API client returns an object with a `data` field and that the endpoint returns the indicated shape. Verify both assumptions against the real implementation and OpenAPI schema before using this example.

Reuse the existing API client and error-handling convention.

Do not introduce another HTTP library just to match the example.

### 8.4 Keep screen components focused on rendering

A listening screen may follow this general pattern:

```tsx
function ListeningScreen() {
	const { state, reload } = useListeningModules();

	if (state.status === "loading") {
		return <LoadingState />;
	}

	if (state.status === "error") {
		return <ErrorState message={state.message} onRetry={reload} />;
	}

	if (state.data.length === 0) {
		return <EmptyState />;
	}

	return (
		<FlatList
			data={state.data}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => (
				<ModuleCard
					title={item.name}
					description={item.description}
					onPress={() => {
						// Use the existing navigation pattern.
					}}
				/>
			)}
		/>
	);
}
```

The identifiers, response fields, hook names, and component props are illustrative. Inspect the actual types and navigation before implementation.

Reuse existing loading and empty-state components rather than creating duplicates.

### 8.5 Use effects for actual side effects

Use `useEffect` when synchronization with an external system is required, not as a default way to derive data.

For example, do not create an effect just to copy a value from props into state when directly using the prop would suffice.

For data fetching, use the existing request-management pattern and handle obsolete operations or stale results appropriately.

Do not add memoization or effects to every component without a concrete reason.

### 8.6 Use theme tokens consistently

An illustrative style:

```tsx
const styles = StyleSheet.create({
	button: {
		backgroundColor: theme.colors.primary,
		padding: theme.spacing.md,
		borderRadius: theme.radius.md,
	},
});
```

Inspect `constant/theme.ts` for the actual export names before using this example.

Do not introduce duplicate color palettes or change global tokens to fix an isolated component.

### 8.7 Keep code proportional to the problem

For a local toggle, a straightforward component state update may be sufficient:

```tsx
const [isVisible, setIsVisible] = useState(false);
```

Do not create a service, utility module, global store, and custom hook merely to manage a simple local interaction.

Conversely, do not force complex feature state, API handling, and audio resource management into a single component just to avoid creating files.

Choose the simplest structure that keeps the code understandable and correct.

## 9. Feature and API Integration

Once the code structure and existing behavior are understood, implement the documented functionality incrementally.

### 9.1 API foundation

Before implementing API-dependent features:

- Inspect the existing HTTP client and services.
- Confirm the API base URL and configuration.
- Inspect actual request and response schemas.
- Establish appropriate shared request and error handling.
- Align TypeScript types with the API contract.
- Keep secrets and credentials out of source control.

Do not create unnecessary service modules before their requirements are established.

### 9.2 Authentication

The documented endpoints include:

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET /v1/me`

Inspect the existing registration, login, session-restoration, and logout flows.

Integrate the UI using the actual request and response schemas.

The documented access token expires after 15 minutes. Refresh tokens expire after 30 days and are single-use with rotation.

Follow the API contract for refresh requests, credential storage, session restoration, logout, and failed refresh behavior.

Prevent concurrent refresh operations from reusing the same rotating refresh token.

Use suitable secure storage for credentials based on the application's existing dependencies and environment.

Do not invent authentication behavior.

### 9.3 Listening practice

The documented endpoints include:

- `GET /v1/listening/modules`
- `POST /v1/listening/sessions`
- `GET /v1/listening/sessions/{sessionID}`
- `POST /v1/listening/sessions/{sessionID}/answers`
- `POST /v1/listening/sessions/{sessionID}/complete`

Trace the flow from module selection to session completion.

Ensure that the screen, feature state, service requests, and response handling use consistent session data.

Follow the documented scoring behavior. Do not override backend results with fabricated client-side scores.

### 9.4 Speaking practice

The documented endpoints include:

- `GET /v1/speaking/modules`
- `POST /v1/speaking/sessions`
- `GET /v1/speaking/sessions/{sessionID}`
- `POST /v1/speaking/sessions/{sessionID}/attempts`
- `POST /v1/speaking/sessions/{sessionID}/complete`

Inspect the existing audio recording and playback implementation.

Verify the documented submission format before transmitting recordings. Do not guess the audio content type, payload structure, or required metadata.

Represent microphone permissions, recording, processing, submission, feedback, cancellation, and cleanup accurately.

Speaking feedback represents recognizability and transcript completeness. It must not be presented as direct pronunciation measurement or clinical assessment.

### 9.5 Progress and history

The documented endpoints include:

- `GET /v1/me/activity`
- `GET /v1/me/history`

Connect the existing dashboard and history UI to the appropriate server data.

Do not create fabricated historical sessions, streaks, or progress values in production execution paths.

Handle loading, empty, and error states consistently.

### 9.6 Unsupported backend functionality

If a desired feature has no documented supporting endpoint, do not invent one.

Document the limitation and avoid presenting mock behavior as persisted backend functionality.

Retain clearly identified mock data when it remains necessary for UI development.

## 10. Dependency, Performance, and Resource Management

Inspect dependencies before adding, replacing, or removing them.

Prefer existing project capabilities unless a real requirement justifies additional packages.

Avoid:

- Multiple libraries solving the same problem.
- New global state libraries without a concrete need.
- Premature memoization.
- Unnecessary caching layers.
- Excessive rendering work.
- Duplicated API requests.
- Inefficient list rendering.
- Unmanaged subscriptions and event listeners.
- Unreleased audio resources.
- Permanent raw-audio storage.

Optimize demonstrated problems instead of speculating about performance bottlenecks.

Preserve the current Expo or React Native native workflow.

## 11. Accessibility and Privacy

HearAble's accessibility requirements are part of functional correctness.

- Essential instructions and feedback must remain available visually.
- Important states must not rely on color alone.
- Interactive elements must have appropriate accessible labels and roles.
- Text and controls must remain usable.
- Loading, processing, success, and failure states must be understandable.
- Microphone permission must be requested only when required.
- Recording must begin only following an appropriate user action.
- Audio failures must be handled without crashing the application.
- Raw recordings must not be permanently stored without an explicitly documented requirement.

Do not log credentials, authorization headers, or sensitive user information.

Preserve these constraints while refactoring UI, data flow, and services.

## 12. Verification and Testing

Every meaningful change must be checked against the behavior it is intended to improve.

Use the scripts and testing tools actually available in the repository.

Run relevant checks as appropriate:

- TypeScript type-checking.
- Linting and formatting.
- Automated tests.
- Application builds.
- Android emulator or physical-device testing.
- Functional verification against the backend when available.

Prioritize verification based on the risk and scope of the change.

For shared components, hooks, or services, check dependent screens and features rather than validating only the file that changed.

Distinguish between implementation and verified behavior.

Never claim that a test, build, API request, or visual comparison passed unless it was actually performed.

When backend access, credentials, or device testing is unavailable, document the specific limitation.

## 13. Execution Strategy

Work through the repository in small, reviewable batches.

### Phase 1 — Audit

Inspect the complete repository structure, important user flows, shared modules, dependencies, and verification tools.

Build a prioritized checklist of actual findings.

### Phase 2 — Fix high-priority defects

Address broken interactions, incorrect state transitions, unsafe asynchronous operations, and other high-impact correctness issues.

Preserve unrelated behavior.

### Phase 3 — Improve shared UI

Review repeated buttons, cards, inputs, loading states, error states, headers, and other shared primitives.

Consolidate genuinely equivalent implementations and introduce meaningful variants only when justified.

### Phase 4 — Improve code structure

Refactor oversized screens, unclear component responsibilities, duplicated business logic, redundant types, and unnecessary abstractions.

Keep related functionality together when additional layers would only make the code harder to follow.

### Phase 5 — Improve data flow

Trace feature state, request lifecycles, data transformations, session state, and shared application state.

Resolve redundant state, inconsistent updates, stale responses, and unclear ownership where supported by evidence.

### Phase 6 — Complete documented functionality

Connect existing UI interactions to documented backend capabilities.

Prioritize functionality that is already designed and whose requirements are sufficiently clear.

Verify request handling, returned data, errors, and resulting UI states.

### Phase 7 — Verify and review

Run relevant checks, inspect the final diff, and test affected user flows where feasible.

Check for regressions introduced by shared component or service changes.

### Phase 8 — Continue coverage

Update the checklist and continue through other major feature areas.

Do not consider a repository-wide cleanup complete after modifying only one screen or shared component.

Do not rewrite everything simultaneously. Choose focused batches that can be reviewed and verified.

## 14. Required Reporting

After each substantial implementation batch, report:

### Changes made

Summarize the specific functionality, UI code, data flow, or architecture that changed.

### Files affected

List the major changed files and their responsibilities.

### Problems resolved

Explain which concrete problems were addressed.

### Verification

List the commands and functional checks actually performed, with their results.

### Remaining issues

Identify unfinished work, blocked functionality, unverified assumptions, or pre-existing failures.

Maintain the implementation checklist throughout the task to avoid repeating completed work and to ensure major feature areas receive attention.

## 15. Definition of Done

An individual change is complete when the applicable requirements are satisfied:

- [ ] The existing implementation and dependent code were inspected.
- [ ] The change addresses an identifiable problem or requirement.
- [ ] React Native component responsibilities remain clear.
- [ ] Existing components were reused where appropriate.
- [ ] Duplicated logic was consolidated only when behavior and responsibilities justified it.
- [ ] State ownership and data flow are understandable.
- [ ] Redundant state and unnecessary effects were reviewed.
- [ ] Asynchronous operations and relevant UI states are handled.
- [ ] API communication follows documented contracts where applicable.
- [ ] TypeScript types reflect the actual data and component interfaces.
- [ ] Styling follows `constant/theme.ts` and relevant Figma designs.
- [ ] Accessibility and privacy requirements remain intact.
- [ ] Navigation and unrelated functionality remain intact.
- [ ] Unnecessary dependencies and abstractions were avoided.
- [ ] Relevant checks were performed and reported honestly.
- [ ] Remaining limitations are documented.

A repository-wide improvement task additionally requires a review of all major feature areas, shared components, and data-flow boundaries.

Do not claim that the entire application is clean, production-ready, or fully verified when major areas remain unreviewed or untested.

## 16. Final Instruction

Start by auditing the actual HearAble repository and creating the prioritized checklist.

Then implement the first high-priority improvement and continue incrementally through the major UI, code-structure, and data-flow issues.

Do not limit the task to suggestions, a newly created architecture, or API service scaffolding.

Work with the existing React Native application. Improve the actual screens, components, hooks, services, state transitions, and user interactions.

Use the documented API contracts for backend functionality. Preserve the existing design and navigation, and verify each meaningful change before proceeding.

**The guiding principle is simple: clear UI code, appropriate component reuse, predictable data flow, working functionality, and the smallest maintainable implementation.**
