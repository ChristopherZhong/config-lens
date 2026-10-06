import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './app-footer';

const meta: Meta = {
  title: 'Components/AppFooter',
  component: 'app-footer',
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'text',
      description: 'Current application status text displayed in footer',
    },
    encoding: {
      control: 'text',
      description: 'Document text encoding scheme',
    },
    version: {
      control: 'text',
      description: 'Application version string',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    status: 'Ready',
    encoding: 'UTF-8',
    version: '1.0.0',
  },
  render: (args) => html`
    <app-footer
      .status="${args.status}"
      .encoding="${args.encoding}"
      .version="${args.version}"
    ></app-footer>
  `,
};

export const CustomVersionAndStatus: Story = {
  args: {
    status: 'Validating Schema...',
    encoding: 'UTF-8',
    version: '2.5.0',
  },
  render: (args) => html`
    <app-footer
      .status="${args.status}"
      .encoding="${args.encoding}"
      .version="${args.version}"
    ></app-footer>
  `,
};
