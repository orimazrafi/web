import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Card content" },
};

export const WithHeading: Story = {
  args: {
    children: (
      <>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Card title</h3>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: 14 }}>
          Optional description or body text.
        </p>
      </>
    ),
  },
};
