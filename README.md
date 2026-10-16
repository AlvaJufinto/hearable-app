<!-- @format -->

# HearAble

An Android application for independent speech practice and auditory recognition, designed for deaf and hard-of-hearing learners.

## Project Overview

HearAble is a self-guided learning tool for practicing speech and audio recognition. Users speak target sentences displayed on screen and receive text-based transcription feedback. Separate listening exercises present audio questions with multiple-choice or text-input answers.

HearAble is not a clinical diagnostic tool and does not replace professional speech therapy or audiology services.

## Key Features

**Speaking Practice**

- Select from available speaking modules
- Read a target sentence displayed on screen
- Speak into the device microphone; speech is transcribed using on-device speech recognition
- Review transcription results and submit or skip each sentence
- Complete a session and view a summary

**Listening / Auditory Recognition**

- Select from available listening modules
- Play audio and select from multiple-choice options or enter a text answer
- Navigate between questions and submit answers
- Complete a session and view a summary

**Progress Tracking**

- Weekly activity overview (sessions completed, active days, streak)
- Practice history with in-progress and completed sessions
- Resume or retry previous sessions

**Authentication**

- Register and log in with email and password
- JWT-based sessions with access token (15 minutes) and refresh token (30 days, single-use rotation)
- Automatic token refresh on 401 responses
- Secure credential storage using device keychain

**Onboarding**

- Three-step introduction to the application's learning approach

## Technology Stack

| Layer              | Technology                                 |
| ------------------ | ------------------------------------------ |
| Framework          | React Native 0.86.3, Expo SDK 57           |
| Routing            | Expo Router (file-based)                   |
| Language           | TypeScript ~6.0                            |
| Audio Recording    | expo-audio                                 |
| Speech Recognition | expo-speech-recognition (Google on-device) |
| Audio Playback     | expo-audio                                 |
| Secure Storage     | expo-secure-store                          |
| Android Build      | Expo EAS Build                             |

### Listening Session Flow

1. Load modules from `GET /v1/listening/modules`
2. Start session via `POST /v1/listening/sessions`
3. Display current question (audio playback via `useAudioPlayer`)
4. Submit answer via `POST /v1/listening/sessions/{id}/answers`
5. Navigate or repeat until all questions answered
6. Complete via `POST /v1/listening/sessions/{id}/complete`

### Speaking Session Flow

1. Load modules from `GET /v1/speaking/modules`
2. Start session via `POST /v1/speaking/sessions`
3. Display target sentence
4. Start speech recognition via `expo-speech-recognition` (on-device, not server-side)
5. Submit transcript via `POST /v1/speaking/sessions/{id}/attempts` (FormData with `sentence_id` and `transcript` text field)
6. Navigate or repeat until all sentences processed
7. Complete via `POST /v1/speaking/sessions/{id}/complete`

## Project Structure

```
HearAble/
├── app/                        # Expo Router screens (file-based routing)
│   ├── (auth)/                 # Login, register routes
│   ├── (protected)/            # Auth-guarded routes
│   │   ├── (tabs)/            # Tab navigation: home, practice, progress, profile
│   │   ├── speaking/          # Speaking practice screen
│   │   ├── recognition/       # Listening / auditory recognition screen
│   │   └── completion/        # Session summary screen
│   ├── onboarding/            # Welcome + 3-step onboarding flow
│   └── _layout.tsx            # Root layout with font loading and AuthProvider
├── src/
│   ├── components/
│   │   ├── ui/                # Shared primitives (Text, Brand, AuthHeader, ThemedText)
│   │   ├── modules/            # Feature-shared components (ModuleCard, ProgressBar, AudioVisualizer, ...)
│   │   └── auth/              # LoginForm, RegisterScreen, AuthInput, AuthButton
│   ├── contexts/              # AuthContext (session state, login/logout/register)
│   ├── hooks/                 # useSpeechToText, useAudioRecorder, useAudioPlayer,
│   │                          # useSpeakingSession, useListeningSession, useHomeData,
│   │                          # useExerciseProgress, usePracticeData
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts       # apiClient, token refresh, error handling, FormData upload
│   │   │   └── storage.ts     # expo-secure-store wrapper for tokens
│   │   ├── auth.service.ts    # register, login, logout, getMe, isAuthenticated
│   │   ├── listening.service.ts
│   │   ├── speaking.service.ts
│   │   ├── progress.service.ts
│   │   └── authErrorEmitter.ts
│   ├── types/
│   │   └── api.ts             # TypeScript interfaces for all API entities
│   └── constant/
│       └── theme.ts           # Design tokens (Colors, Spacing, Radius, FontSize, Fonts)
├── assets/
│   ├── fonts/                 # Poppins font family
│   └── images/                # App icons, splash, tab icons
├── docs/
│   ├── API.md                 # API documentation (endpoints, schemas, auth)
│   └── API_Implementation.md  # Implementation guide for connecting UI to API
├── app.json                   # Expo configuration (package: com.anonymous.HearAble)
├── eas.json                   # EAS Build configuration
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 20 or later
- npm 10+ (or Bun)
- Android Studio (for Android emulator) or a physical Android device
- Expo CLI (`npx expo`)
- EAS CLI (`npm install -g eas-cli`) — for building Android APKs

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd HearAble

# Install dependencies
npm install
```

## Environment Configuration

The API base URL is hardcoded in `src/services/api/client.ts` as:

```
https://api.hearable.nighttealabs.tech
```

No additional environment variables are required for local development. The app uses `expo-secure-store` for token persistence, which stores credentials in the Android Keystore.

## Running the Application

### Development with Expo

```bash
npm start
```

This starts the Expo development server. Open the output URL in an Android emulator or scan the QR code with the Expo Go app on a physical device.

### Android Device (adb)

```bash
npm run android
```

Requires the device to be connected via `adb` or reachable on the same network.

### EAS Development Build

For a custom dev client (required when the app uses native modules that Expo Go cannot provide):

```bash
eas build --profile development --platform android
eas run-android --profile development
```

### Building a Production APK

```bash
eas build --profile production --platform android
```

Or with local build:

```bash
eas build --profile production --platform android --local
```

## API and Speech-Processing Workflow

### Authentication

| Endpoint            | Method | Description              |
| ------------------- | ------ | ------------------------ |
| `/v1/auth/register` | POST   | Create account           |
| `/v1/auth/login`    | POST   | Log in                   |
| `/v1/auth/refresh`  | POST   | Refresh access token     |
| `/v1/auth/logout`   | POST   | Revoke refresh token     |
| `/v1/me`            | GET    | Get current user profile |

Tokens are stored via `expo-secure-store`. The API client intercepts 401 responses, refreshes the access token, and retries the original request. Concurrent refresh requests are deduplicated via a shared promise.

### Listening Modules

| Endpoint                               | Method | Description                               |
| -------------------------------------- | ------ | ----------------------------------------- |
| `/v1/listening/modules`                | GET    | List modules (optional `?difficulty=1-4`) |
| `/v1/listening/sessions`               | POST   | Start a session                           |
| `/v1/listening/sessions/{id}`          | GET    | Get session detail                        |
| `/v1/listening/sessions/{id}/answers`  | POST   | Submit an answer                          |
| `/v1/listening/sessions/{id}/complete` | POST   | Complete session, get summary             |

### Speaking Modules

| Endpoint                              | Method | Description                   |
| ------------------------------------- | ------ | ----------------------------- |
| `/v1/speaking/modules`                | GET    | List modules                  |
| `/v1/speaking/sessions`               | POST   | Start a session               |
| `/v1/speaking/sessions/{id}`          | GET    | Get session detail            |
| `/v1/speaking/sessions/{id}/attempts` | POST   | Submit transcript (FormData)  |
| `/v1/speaking/sessions/{id}/complete` | POST   | Complete session, get summary |

### Progress

| Endpoint          | Method | Description                                             |
| ----------------- | ------ | ------------------------------------------------------- |
| `/v1/me/activity` | GET    | Weekly activity (optional `?week_of=YYYY-MM-DD`)        |
| `/v1/me/history`  | GET    | Practice history (supports `limit`, `cursor`, `status`) |

## Privacy and Security

**Microphone access**: Requested only when the user initiates a speaking exercise (`useSpeechToText` requests permission via `ExpoSpeechRecognitionModule.requestPermissionsAsync`). The listening recognition screen does not use the microphone.

**Speech recognition**: Uses `expo-speech-recognition`, which invokes Google's on-device speech recognition on Android (`com.google.android.googlequicksearchbox`). Audio is processed locally on the device. Only the resulting transcript text is submitted to the backend.

**Audio playback**: Listening exercises load audio from the backend via HTTP and play it through the device speaker using `expo-audio`.

**Recording storage**: `useAudioRecorder` (expo-audio) is implemented but not currently connected to the active speaking flow. Recorded audio files, if any, are not persisted beyond the session lifecycle.

**Token storage**: Access and refresh tokens are stored in the Android Keystore via `expo-secure-store`. Refresh tokens rotate on each use (single-use).

**Credentials**: Passwords are never stored on-device. API credentials are not included in source code.

## Known Limitations

1. **Speech recognition accuracy**: Recognition accuracy for deaf and hard-of-hearing speakers may be reduced compared to typical speakers, as speech recognition systems are typically trained on hearing voices.

2. **Transcript vs. pronunciation**: Speaking feedback represents speech recognizability and transcript completeness, not clinical pronunciation assessment. Scores must not be presented as clinical diagnoses.

3. **Listening session duplicate state**: `src/hooks/useListeningSession.ts` contains a duplicate `setPhase` call (lines 155–167) that sets the same `"done"` status twice. This should be cleaned up to prevent confusion.

4. **Progress is in-memory**: `useExerciseProgress` uses a module-level global variable for state. It does not persist across app restarts. Progress data shown on the home screen comes from the API (`/v1/me/activity`, `/v1/me/history`).

5. **Speaking service submits transcript, not audio**: The current speaking flow submits the speech recognition transcript as a text field, not the raw audio recording. The actual audio is processed on-device by `expo-speech-recognition`. A separate audio recording/upload path may be required if the API contract changes.

6. **No offline support**: The application requires network connectivity. Cached modules and offline practice are not implemented.

7. **Accessibility validation**: Accessibility features (labels, touch targets, color contrast) have not been validated with actual target users.

## Future Development

- Offline module caching and practice
- Persistent progress storage (local database)
- Accessibility audit with target users
- Expanded difficulty levels and learning modules
- Session resume across app restarts
- Cross-device progress synchronization
- Privacy policy and data deletion endpoints

## Contributors

- **Hansel** — Technical architecture, speech-processing integration, database management
- **Zaidan** — UI design, learning workflows, gamification

## License

MIT License. See `LICENSE` for details.
