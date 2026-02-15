import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageSection, PageSectionBlock } from "./PageSection";

describe("PageSection", () => {
  it("renders children", () => {
    render(<PageSection>Body</PageSection>);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<PageSection title="Page Title">Body</PageSection>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Page Title");
  });

  it("renders subtitle when provided", () => {
    render(
      <PageSection title="Title" subtitle="Subtitle text">
        Body
      </PageSection>
    );
    expect(screen.getByText("Subtitle text")).toBeInTheDocument();
  });

  it("does not render title or subtitle when omitted", () => {
    render(<PageSection>Body</PageSection>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByText("Subtitle")).not.toBeInTheDocument();
  });

  it("uses titleTight class when titleTight=true", () => {
    const { container } = render(
      <PageSection title="Tight" titleTight>
        Body
      </PageSection>
    );
    const heading = container.querySelector("h1");
    expect(heading?.className).toMatch(/titleTight/);
  });
});

describe("PageSectionBlock", () => {
  it("renders children with section spacing", () => {
    render(<PageSectionBlock>Block content</PageSectionBlock>);
    expect(screen.getByText("Block content")).toBeInTheDocument();
  });
});
