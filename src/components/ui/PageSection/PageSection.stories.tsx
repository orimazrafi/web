import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageSection, PageSectionBlock } from "./PageSection";

const meta = {
  title: "UI/PageSection",
  component: PageSection,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    titleTight: { control: "boolean" },
  },
} satisfies Meta<typeof PageSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithTitleAndSubtitle: Story = {
  args: {
    title: "Page title",
    subtitle: "Optional subtitle or description.",
    children: <p>Page body content goes here.</p>,
  },
};

export const TitleOnly: Story = {
  args: {
    title: "Analytics",
    children: <p>Body content.</p>,
  },
};

export const TitleTight: Story = {
  args: {
    title: "Tight title",
    titleTight: true,
    subtitle: "Less margin below title.",
    children: <p>Content.</p>,
  },
};

export const WithBlock: Story = {
  args: {
    title: "Overview",
    subtitle: "Section with a block below.",
    children: (
      <>
        <p>Some intro text.</p>
        <PageSectionBlock>
          <div style={{ padding: 16, background: "#111", borderRadius: 8 }}>
            Block with top margin
          </div>
        </PageSectionBlock>
      </>
    ),
  },
};
