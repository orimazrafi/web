import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "./Select";

const options: { value: string; label: string }[] = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

describe("Select", () => {
  it("renders options", () => {
    render(<Select options={options} />);
    expect(screen.getByRole("option", { name: "Option A" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Option B" })).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Select label="Choose one" options={options} />);
    expect(screen.getByLabelText("Choose one")).toBeInTheDocument();
  });

  it("renders placeholder option when provided", () => {
    render(<Select options={options} placeholder="Select..." />);
    expect(screen.getByRole("option", { name: "Select..." })).toBeInTheDocument();
  });

  it("calls onChange when value changes", async () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("forwards value and name", () => {
    render(<Select options={options} value="a" name="field" onChange={() => {}} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("a");
    expect(select).toHaveAttribute("name", "field");
  });
});
