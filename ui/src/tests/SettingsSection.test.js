import SettingsSection from "src/components/custom/SettingsSection";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase-config";
import { expect, jest, test } from "@jest/globals";
import { act } from "react-dom/test-utils";
import * as api from "src/lib/api";
import * as AuthContext from "src/context/AuthContext";

initializeApp(firebaseConfig);

jest.mock("src/lib/api");
jest.mock("src/context/AuthContext");

describe("SettingsSection", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      user: { userID: 1, username: "testuser", email: "testuser@example.com" },
    });

    // Reset mock implementations before each test
    api.Post.mockReset();
  });

  it("renders the user's current username and email", async () => {
    const { getByLabelText } = render(<SettingsSection />, {
      wrapper: BrowserRouter,
    });

    expect(getByLabelText("Username").value).toBe("testuser");
    expect(getByLabelText("Email").value).toBe("testuser@example.com");
  });

  it("allows the user to change their username", async () => {
    // Mock API response for successful username change
    api.Post.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({ message: "Username successfully changed." }),
    }));

    const { getByLabelText, getByText } = render(<SettingsSection />, {
      wrapper: BrowserRouter,
    });

    // Enable username editing
    fireEvent.click(getByText("✏️"));

    // Change the username and save changes
    const usernameInput = getByLabelText("Username");
    fireEvent.change(usernameInput, { target: { value: "newusername" } });
    fireEvent.click(getByText("Save Changes"));

    // Wait for success message
    await waitFor(() => {
      expect(getByText("Username successfully changed.")).toBeInTheDocument();
    });
  });

  // Test to simulate a failed username change due to an error from the backend
  it("displays an error message when username change fails", async () => {
    // Mock API response for failed username change
    api.Post.mockImplementationOnce(async () => ({
      ok: false,
      json: async () => ({
        message: "An error occurred while changing your username.",
      }),
    }));

    const { getByLabelText, getByText, findByText } = render(
      <SettingsSection />,
      {
        wrapper: BrowserRouter,
      }
    );

    // Enable username editing and attempt to change the username
    fireEvent.click(getByText("✏️"));
    fireEvent.change(getByLabelText("Username"), {
      target: { value: "newusername" },
    });
    fireEvent.click(getByText("Save Changes"));

    // Wait for error message
    const errorMessage = await findByText(
      "An error occurred while changing your username."
    );
    expect(errorMessage).toBeInTheDocument();
  });

  // Test to ensure the component properly handles the case where the new username is the same as the current one
  it("displays an error message when the new username is the same as the current one", async () => {
    const { getByText, findByText } = render(<SettingsSection />, {
      wrapper: BrowserRouter,
    });

    // Attempt to save changes without changing the username
    fireEvent.click(getByText("Save Changes"));

    // Check for the expected error message
    const errorMessage = await findByText(
      "You're already using this username."
    );
    expect(errorMessage).toBeInTheDocument();
  });

  // Additional setup needed for the first test scenario:
  // Since jest/enzyme doesn't handle window.location.reload, you need to mock it before the test
  beforeEach(() => {
    delete window.location;
    window.location = { reload: jest.fn() };
  });

  afterEach(() => {
    window.location.reload.mockClear();
  });

  // Assuming you have the above setup for mocking `window.location.reload`:
  it("does not actually reload the page in the test environment after username change", async () => {
    // Mock successful API response
    api.Post.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({ message: "Username successfully changed." }),
    }));

    const { getByLabelText, getByText } = render(<SettingsSection />, {
      wrapper: BrowserRouter,
    });

    // Enable username editing, change the username, and attempt to save changes
    fireEvent.click(getByText("✏️"));
    fireEvent.change(getByLabelText("Username"), {
      target: { value: "newusername" },
    });
    fireEvent.click(getByText("Save Changes"));

    // Wait a bit to simulate the async operations
    await waitFor(() => expect(window.location.reload).not.toHaveBeenCalled());
  });

  // Test to verify window.location.reload is called upon successful username change
  it("calls window.location.reload after a successful username change", async () => {
    // Mock successful API response
    api.Post.mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({ message: "Username successfully changed." }),
    }));

    const { getByLabelText, getByText } = render(<SettingsSection />, {
      wrapper: BrowserRouter,
    });

    // Enable username editing and change the username
    fireEvent.click(getByText("✏️"));
    fireEvent.change(getByLabelText("Username"), {
      target: { value: "newusername" },
    });
    fireEvent.click(getByText("Save Changes"));

    // Ensure that window.location.reload was called
    await waitFor(() =>
      expect(window.location.reload).toHaveBeenCalledTimes(1)
    );
  });

  // Test to simulate a network error when attempting to change the username
  it("displays a specific error message when a network error occurs during username change", async () => {
    // Mock implementation to simulate a network error
    api.Post.mockImplementationOnce(async () => {
      throw new Error("Network error");
    });

    const { getByLabelText, getByText, findByText } = render(
      <SettingsSection />,
      {
        wrapper: BrowserRouter,
      }
    );

    // Enable username editing and attempt to change the username
    fireEvent.click(getByText("✏️"));
    fireEvent.change(getByLabelText("Username"), {
      target: { value: "newusername" },
    });
    fireEvent.click(getByText("Save Changes"));

    // Check for the network error message
    const errorMessage = await findByText(
      "Someone is using this username already!"
    );
    expect(errorMessage).toBeInTheDocument();
  });
});
