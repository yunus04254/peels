import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Settings from "src/pages/Settings";

jest.mock("src/components/custom/SettingsSection", () => () => (
  <div data-testid="SettingsSection">Settings Section Mock</div>
));

describe("Settings Page", () => {
  it("renders correctly and contains the SettingsSection", () => {
    const { getByText, getByTestId } = render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    expect(getByText("Settings")).toBeInTheDocument();

    const settingsSection = getByTestId("SettingsSection");
    expect(settingsSection).toBeInTheDocument();
    expect(settingsSection.textContent).toBe("Settings Section Mock");
  });
});
