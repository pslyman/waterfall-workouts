# Waterfall Workouts - AGENTS

This repository is an Ionic + Angular + Capacitor application for tracking workouts using a
"waterfall/kanban" approach: workouts are prioritized by how overdue they are (most overdue first).
All data is stored locally via Ionic Storage; there is no backend/API.

Key locations
- Main UI: `src/app/tab1/` (workout list + add/edit flow)
- Navigation shell: `src/app/tabs/`
- Persistence: `src/app/services/storage.service.ts` (wrapper around `@ionic/storage-angular`)
- Theme tokens: `src/theme/variables.scss` and global Ionic CSS in `src/global.scss`
- Android native project: `android/`

## Build / Run / Lint / Test

Install
```bash
npm install
```

Web development
```bash
npm run start              # Angular dev server (ng serve)
# Optional (requires Ionic CLI available on PATH):
ionic serve
```

Build
```bash
npm run build
npm run build -- --configuration production
npm run build -- --configuration ci
```
Notes
- Angular build output path is `www/` (see `angular.json`), and Capacitor `webDir` is `www`
  (see `capacitor.config.ts`).

Android (Capacitor)
```bash
npm run build && npx cap sync android
npx cap run android
npx cap open android        # open Android Studio
```

Lint
```bash
npm run lint                # runs: ng lint
# Auto-fix what can be safely fixed:
npm run lint -- --fix
```
Notes
- Linting is wired up via ESLint + `angular-eslint` (see `eslint.config.js`).
- A legacy `tslint.json` exists and is still useful as style guidance (quotes, semicolons, max line
  length 140, selector conventions, etc.).

Unit tests (Jasmine + Karma)
```bash
npm test
npm test -- --configuration ci
npm test -- --watch=false --browsers=ChromeHeadless
```

Run a single unit test
```bash
# Preferred: run a single spec file (Angular CLI supports --include)
npm test -- --include=src/app/tab1/tab1.page.spec.ts

# If you need to run a single test case by name, use Jasmine focused tests temporarily:
# - change `describe(...)` -> `fdescribe(...)`
# - or `it(...)` -> `fit(...)`
# Then revert before merging.
```

E2E tests (legacy Protractor)
```bash
npm run e2e
npm run e2e -- --specs=e2e/src/app.e2e-spec.ts
```

## Code Style Guidelines

General principles
- Keep diffs small; do not reformat unrelated code.
- Prefer correctness + readability over cleverness; this app runs on mobile hardware.
- Storage is the source of truth; changes must persist and survive reloads.

### Imports
- Group imports with a blank line between groups: Angular -> Ionic/Capacitor -> other third-party ->
  app-relative.
- Combine imports from the same module (avoid multiple `from '@ionic/angular'` lines).
- App code uses relative imports (`./`, `../`). Dependencies use package imports.
- Do not import from `rxjs/Rx` (blacklisted in `tslint.json`).

### Formatting
- Indentation: 2 spaces (TS/HTML/SCSS) unless the file clearly uses a different style.
- Semicolons: include them.
- Quotes: the repo is mixed today; when editing a file, match that file's existing quote style.
  For new TS files, prefer single quotes (matches `tslint.json`).
- Line length: keep under ~140 chars where practical.

### TypeScript / Angular
- Prefer `const`/`let`; avoid `var`.
- Avoid `any` in new/changed code. Use real interfaces/types, unions, or `unknown` + narrowing.
- Add explicit types at module boundaries: service methods, exported helpers, and public component
  APIs.
- Prefer `private readonly` for injected services unless they are referenced from templates.
- Avoid heavy logic in templates (especially inside list loops). Precompute or cache derived values.
- Templates in this repo use Angular control flow (`@if`, `@for`). For lists, use `track` with a
  stable key when possible (e.g., `track item.name`).

### Naming
- Classes: `PascalCase` and end in `Page` or `Component` (see `tslint.json`).
- Selectors: `app-...` (see `tslint.json`).
- Variables/functions: `camelCase`; booleans start with `is/has/can/should`.
- Constants: `SCREAMING_SNAKE_CASE`.
- Types/interfaces: `PascalCase` (existing `workoutsInt` is legacy; prefer `Workout` in new code).
- Files/folders: kebab-case (Angular/Ionic conventions).

### Error handling + user feedback
- Favor user-visible feedback via Ionic UI (toasts/alerts) over `console.*` (console is restricted
  by `tslint.json`).
- Guard storage reads: keys may be missing/null (fresh install, cleared storage).
- When parsing stored JSON, wrap `JSON.parse` in try/catch and fall back to defaults.
- When calling Capacitor plugins (StatusBar, SplashScreen), always gate with platform checks
  (`this.platform.is('android')`) and handle rejected Promises.

### Styling (Ionic + SCSS)
- Use Ionic components (`ion-*`) for consistent theming and mobile UX.
- Prefer Ionic CSS variables and theme tokens in `src/theme/variables.scss`.
- Avoid inline styles in templates unless there is a strong reason.

### Tests
- Unit tests live next to components as `*.spec.ts` and use Jasmine + Angular TestBed.
- Prefer clear arrange/act/assert blocks; keep tests deterministic.

## Domain-specific conventions (from existing instructions)

Storage keys and behaviors to preserve
- `workouts`: JSON string array of workout objects.
- `theme`: string like `light` or `dark`; applied as a class on `#body-theme`.
- `useMetricDefault`: string `'true'` or `'false'` controlling `kg` vs `lbs` suffix.

Workout model (current)
- `days`, `name`, `sets`, `reps`, `weight` (string with unit), `countdown`, `originDate`,
  `setsDone`, `notes`.

Algorithm notes
- Workouts are sorted by "overdue"; avoid changes that break the user's expected ordering.
- Completing all sets resets `setsDone` and updates `originDate`.

## Cursor / Copilot instructions

Cursor rules
- No `.cursor/rules/` or `.cursorrules` found in this repository.

Copilot rules
- No `.github/copilot-instructions.md` found.
- A repository-specific guidance file exists at `.copilot-instructions.md`; treat it as the
  canonical high-level overview (stack, architecture, and UX expectations).
