import { render } from "@testing-library/react";
import { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from 'react-redux';
import { MemoryRouter } from "react-router-dom";

import i18nForTests from "../../../config/i18n/i18nForTests"

export interface RenderWithRouterOptions {
    route?: string
}

export function componentRender(component: ReactNode, options?: RenderWithRouterOptions = {}) {
    const { route = "/" } = options
    return render(
      <Provider store={}>
        <MemoryRouter initialEntries={[route]}>
           <I18nextProvider i18n={i18nForTests}>
            {component}
          </I18nextProvider>
        </MemoryRouter>
      </Provider>

    )
}