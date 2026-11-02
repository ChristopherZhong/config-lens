import type { Preview } from '@storybook/web-components-vite';
import '../src/style.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        light: { name: 'light', value: '#f8fafc' },
        dark: { name: 'dark', value: '#0b0f19' }
      }
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'dark'
    }
  }
};

export default preview;
