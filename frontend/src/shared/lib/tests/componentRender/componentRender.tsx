import { configureStore } from '@reduxjs/toolkit'; // или createStore из redux
import { render } from "@testing-library/react";
import { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from 'react-redux';
import { MemoryRouter } from "react-router-dom";
import i18nForTests from "../../../config/i18n/i18nForTests";

export interface RenderWithRouterOptions {
    route?: string;
    initialState?: any; // Замените any на тип вашего initialState
    asyncReducers?: any; // Замените any на тип вашего asyncReducers
}

export function componentRender(component: ReactNode, options: RenderWithRouterOptions = {}) {
    const { route = "/", initialState, asyncReducers } = options;

    const store = configureStore({
        reducer: asyncReducers,
        preloadedState: initialState,
    });

    return render(
        <MemoryRouter initialEntries={[route]}>
            <Provider store={store}>
                <I18nextProvider i18n={i18nForTests}>
                    {component}
                </I18nextProvider>
            </Provider>
        </MemoryRouter>
    );
}