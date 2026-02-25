import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Button from './PrimaryButton';

const meta = {
  title: 'shared/PrimaryButton',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Text',
    theme: 'primary',
  },
};

export const Clear: Story = {
  args: {
    children: 'Text',
    theme: 'clear',
  },
};
