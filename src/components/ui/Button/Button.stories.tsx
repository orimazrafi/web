import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "danger"],
    },
    active: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Button" },
};

export const Primary: Story = {
  args: { variant: "primary", children: "Primary" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Delete" },
};

export const Active: Story = {
  args: { active: true, children: "Active toggle" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};
