# Desktop build (Electron)

The app can run as a desktop application via Electron. No Rust or extra toolchains are required; only Node.js.

## Commands

From the `frontend` directory:

| Command | Description |
|--------|-------------|
| `pnpm dev:desktop` | Start Vite dev server and open the app in an Electron window (hot reload). |
| `pnpm build:desktop` | Build the web app for Electron and run the built app in Electron (no installer). |
| `pnpm pack:desktop` | Build and package installers (macOS `.dmg` / `.app`, Windows `.exe`, Linux) into `frontend/release/`. |

## Requirements

- Node.js (LTS)
- For `pack:desktop`: platform-specific tools (e.g. on macOS, Xcode Command Line Tools; on Windows, optional signing/setup)

## Behaviour

- **Development:** Electron loads `http://localhost:5173`; the Vite dev server must be running (started automatically by `dev:desktop`).
- **Production:** The built app is loaded from `dist/` with `base: "./"` so assets work when opened from `file://`.

Backend is unchanged: the desktop app talks to your API (e.g. `http://localhost:8000` or your deployed URL) as configured in the frontend env.

## Alternative: Tauri

For smaller binaries and system integration you can use [Tauri](https://v2.tauri.app/) instead. It requires the Rust toolchain. You would add Tauri to this Vite project and point it at the same `dist/` output (with `base: "./"`). The current Electron setup is kept so you can choose either.
