import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Friends from "src/pages/Friends";

jest.mock("src/components/custom/FriendsSection", () => () => (
  <div data-testid="FriendsSection">Friends Section Mock</div>
));

describe("Friends Page", () => {
  it("renders correctly and contains the FriendsSection", () => {
    const { getByText, getByTestId } = render(
      <BrowserRouter>
        <Friends />
      </BrowserRouter>
    );

    expect(getByText("Friends")).toBeInTheDocument();

    const FriendsSection = getByTestId("FriendsSection");
    expect(FriendsSection).toBeInTheDocument();
    expect(FriendsSection.textContent).toBe("Friends Section Mock");
  });
});
