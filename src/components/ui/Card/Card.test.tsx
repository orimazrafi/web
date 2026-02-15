import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders as a div", () => {
    const { container } = render(<Card>Hi</Card>);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("merges custom className", () => {
    const { container } = render(<Card className="custom-class">Hi</Card>);
    const el = container.firstElementChild;
    expect(el).toHaveClass("custom-class");
    expect(el?.className).toMatch(/card/);
  });

  it("forwards data attributes", () => {
    render(<Card data-testid="my-card">Hi</Card>);
    expect(screen.getByTestId("my-card")).toBeInTheDocument();
  });
});
