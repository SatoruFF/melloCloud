import { defineConfig } from 'cypress';

// TODO: define port and host from cross env
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://127.0.0.1:5173',
  },
});
