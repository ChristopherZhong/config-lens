import { addons } from 'storybook/internal/manager-api';
import { create } from 'storybook/internal/theming/create';

const theme = create({
  base: 'dark',
  brandTitle: 'ConfigLens App ↩',
  brandUrl: '../',
  brandTarget: '_self',
});

addons.setConfig({
  theme,
});
