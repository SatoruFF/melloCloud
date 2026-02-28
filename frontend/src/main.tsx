import ReactDOM from "react-dom/client";
import App from "./app/App";

import "./shared/config/i18n/i18n";
import StoreProvider from "./app/providers/StoreProvider/ui/StoreProvider";

declare const __BUILD_SHA__: string;
declare const __BUILD_DATE__: string;

// Версия сборки — видна в devtools при каждом открытии приложения
console.info(`%c melloCloud %c ${__BUILD_SHA__} | ${__BUILD_DATE__}`, "background:#000;color:#fff;padding:2px 6px;border-radius:3px 0 0 3px", "background:#333;color:#aaa;padding:2px 6px;border-radius:0 3px 3px 0");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StoreProvider>
    <App />
  </StoreProvider>
);
