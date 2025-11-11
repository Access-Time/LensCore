import DefaultTheme from 'vitepress/theme';
import SwaggerUI from './components/SwaggerUI.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SwaggerUI', SwaggerUI);
  },
};
