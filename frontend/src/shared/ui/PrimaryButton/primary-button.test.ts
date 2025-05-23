import { fireEvent, render, screen } from "@testing-library/react";
import { componentRender } from "../../lib/tests/componentRender/componentRender";
import type { PrimaryButton } from "./PrimaryButton";

describe('Primary button test', () => {
  test('Just render test', () => {
    componentRender(<PrimaryButton>TEST</PrimaryButton>);
    expect(screen.getByText("TEST")).toBeInTheDocument();
  });

  test('Include new classname', () => {
    componentRender(<PrimaryButton theme={"clear"}>TEST</PrimaryButton>);
    expect(screen.getByText("TEST")).toHaveClass("clear");
    // fireEvent.click()
    screen.debug()
  });
});