import { fireEvent, render, screen } from "@testing-library/react";
import { PrimaryButton } from "./PrimaryButton";

describe('Primary button test', () => {
  test('Just render test', () => {
    render(<PrimaryButton>TEST</PrimaryButton>);
    expect(screen.getByText("TEST")).toBeInTheDocument();
  });

  test('Include new classname', () => {
    render(<PrimaryButton theme={"clear"}>TEST</PrimaryButton>);
    expect(screen.getByText("TEST")).toHaveClass("clear");
    // fireEvent.click()
    screen.debug()
  });
});