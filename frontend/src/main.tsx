import ReactDOM from 'react-dom/client';
import App from './app/App';

import './shared/config/i18n/i18n';
import { Provider } from 'react-redux';
import { store } from './app/store/store';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
