import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import type { I18nextProvider } from "react-i18next";

import i18nForTests from "../../../config/i18n/i18nForTests"

export function renderWithTranslation(component: ReactNode) {
    return render(
     <I18nextProvider i18n={i18nForTests}>
        {component}
      </I18nextProvider>
    )
}