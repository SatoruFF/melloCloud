# Desktop build

The app runs as a desktop application by default with **Tauri**. Electron is available as an alternative.

## Commands (Tauri — default)

From the `frontend` directory:

| Command | Description |
|--------|-------------|
| `pnpm dev:desktop` | Start Vite and open the app in a Tauri window (hot reload). |
| `pnpm build:desktop` | Build the app and run the built binary. |
| `pnpm pack:desktop` | Build and create installers (macOS `.app`/`.dmg`, Windows `.msi`/`.exe`, Linux) in `src-tauri/target/release/bundle/`. |

**Requirements:** Node.js, [Rust](https://www.rust-lang.org/tools/install), and platform dev tools (e.g. Xcode Command Line Tools on macOS).

## Commands (Electron — optional)

| Command | Description |
|--------|-------------|
| `pnpm dev:desktop:electron` | Vite + Electron window (hot reload). |
| `pnpm build:desktop:electron` | Build for Electron and run the app. |
| `pnpm pack:desktop:electron` | Build and package installers into `frontend/release/`. |

**Requirements:** Node.js only (no Rust).

## Behaviour

- **Development:** The desktop window loads `http://localhost:5173` (Vite). Tauri starts the dev server automatically; for Electron you get it via `dev:desktop:electron`.
- **Production:** The built app is served from `dist/` with `base: "./"` so assets work from the bundled app.

Backend is unchanged: the desktop app talks to your API (e.g. `http://localhost:8000` or your deployed URL) as configured in the frontend.
