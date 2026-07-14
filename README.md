# IRONLOG — Mobile App

A dark-themed iOS workout tracker built with React Native and Expo.
Log every set, browse a 1,300+ exercise library with animated
demonstrations, and watch your progress in history, personal records, and a
body-weight graph.

> **Tagline:** Train hard. Track everything.

This is the mobile client. It talks to a separate backend
([`workout-api`](../workout-api)) for saving and syncing workout data.

---

## Download

IRONLOG is distributed through the App Store.

<!-- App Store QR code / badge image goes here once published -->
_App Store link and QR code coming soon._

---

## Features

- **Today** — start a session, log weight/reps per set, check sets off,
  add/remove exercises, and finish (which syncs to the backend). Finished
  workouts can be reopened and edited.
- **Exercise library** — 1,300+ exercises with animated GIF demos and
  step-by-step instructions, filterable by target muscle.
- **Routines** — build reusable templates and start a session from one tap.
- **History** — finished workouts with per-session breakdowns, volume
  charts, and a collapsible set-by-set view.
- **Profile** — lifetime stats, automatic personal records, and body-weight
  logging with a progression graph.
- **Settings** — switch between lbs and kg anytime (weights are stored in
  lbs and converted only for display).

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Expo](https://docs.expo.dev/) SDK 54, [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing) |
| Language | TypeScript |
| UI | [NativeWind](https://www.nativewind.dev/) (Tailwind for RN), [Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| Auth | [Clerk](https://clerk.com/) (`@clerk/expo`) |
| Media | [`expo-image`](https://docs.expo.dev/versions/latest/sdk/image/) (disk-cached exercise GIFs) |
| State | [Zustand](https://github.com/pmndrs/zustand) + AsyncStorage for local persistence |
| Backend | REST API ([`workout-api`](../workout-api)) on Vercel, backed by Supabase |

---

## Architecture

Screens depend only on repository **interfaces**
([`lib/data/repositories.ts`](lib/data/repositories.ts)), never on a concrete
source — so the data layer can change without touching UI.

- **Exercises** come from a bundled dataset
  ([`lib/data/mock/exercises.json`](lib/data/mock/exercises.json), ~1,324
  entries), so browsing is instant and works offline.
- **Workouts** keep the live session local for instant, offline logging and
  sync finished sessions to the backend via
  [`SyncedWorkoutRepository`](lib/data/remote/SyncedWorkoutRepository.ts).
- **Networking** goes through one authed client
  ([`lib/data/remote/apiClient.ts`](lib/data/remote/apiClient.ts)) that
  attaches the Clerk session token and enforces a request timeout.

```
app/                      # Expo Router routes (file = screen)
  (onboarding)/           # First-launch intro
  (auth)/                 # Clerk sign-in / sign-up
  (tabs)/                 # Today, History, Routines, Profile
  add-exercise.tsx        # Exercise picker (multi-select)
  create-routine.tsx      # Build a routine
  summary/[id].tsx        # Workout summary + charts
  video/[exerciseId].tsx  # Exercise detail (GIF + instructions)
  body-weight.tsx         # Body-weight progression screen
components/                # Reusable UI (ui/, today/, history/, profile/…)
constants/                # Design tokens (colors, layout, workout defaults)
lib/                      # Data layer, hooks, settings, helpers
```

---

## Design system

- **Colors** — background `#131313`, surfaces `#1E1E1E`/`#242424`, single
  accent burnt-orange `#E8590C`, primary text `#E5E2E1`.
- **Type** — Oswald (bold, all-caps display) + Inter (body).
- **Shape** — 12px cards, 8px buttons, a floating pill tab bar.

---

## Credits

Exercise data and GIFs are derived from the public
[free exercise datasets](https://github.com/hasaneyldrm/exercises-dataset);
media © [Gym Visual](https://gymvisual.com/).
