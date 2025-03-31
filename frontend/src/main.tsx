import ReactDOM from "react-dom/client";
import App from "./app/App";

import "./shared/config/i18n/i18n";
import StoreProvider from "./app/providers/StoreProvider/ui/StoreProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<StoreProvider>
		<App />
	</StoreProvider>,
);
