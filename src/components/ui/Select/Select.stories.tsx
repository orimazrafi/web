import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Select } from "./Select";

const options = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
  },
  args: { onChange: fn(), options },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "30" },
};

export const WithLabel: Story = {
  args: { label: "Date range", value: "30" },
};

export const WithPlaceholder: Story = {
  args: {
    label: "Choose",
    placeholder: "Select an option...",
    value: "",
  },
};

export const CoinOptions: Story = {
  args: {
    label: "Coins",
    options: [
      { value: "btc", label: "BTC" },
      { value: "eth", label: "ETH" },
      { value: "sol", label: "SOL" },
    ],
    value: "btc",
  },
};
