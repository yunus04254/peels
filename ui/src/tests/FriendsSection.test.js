import FriendsSection from "src/components/custom/FriendsSection";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase-config";
import { expect, jest, test } from "@jest/globals";
import { act } from "react-dom/test-utils";
import * as api from "src/lib/api";
import * as AuthContext from "src/context/AuthContext";
import * as React from "react";

initializeApp(firebaseConfig);

jest.mock("src/lib/api");
jest.mock("src/context/AuthContext");

describe(FriendsSection, () => {
  const routerWrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      user: { userID: 1, username: "testuser" },
    });

    // Mocking API calls
    api.Get.mockImplementation(async (url, params, options) => {
      if (url.includes("friends/incoming")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([{ friendID: 2, fromUsername: "friend1" }]),
        });
      }
      if (url.includes("friends/list")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    // Mocking window observers
    window.IntersectionObserver = jest.fn(() => ({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    }));

    window.ResizeObserver = jest.fn(() => ({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders FriendsSection and displays incoming friend requests", async () => {
    const { getByText } = await act(async () =>
      render(<FriendsSection />, { wrapper: routerWrapper })
    );

    expect(getByText("Incoming Friend Requests")).toBeInTheDocument();
    expect(getByText("friend1")).toBeInTheDocument();
  });

  it("shows no friends message when the friend list is empty", async () => {
    const { getByText } = await act(async () =>
      render(<FriendsSection />, { wrapper: routerWrapper })
    );

    expect(getByText("No friends :(")).toBeInTheDocument();
  });

  it("displays error message when fetching incoming friend requests fails", async () => {
    api.Get.mockImplementation(async (url) => {
      if (url.includes("friends/incoming")) {
        return Promise.resolve({
          ok: false,
          text: () =>
            Promise.resolve("Failed to fetch incoming friend requests"),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    const { findByText } = render(<FriendsSection />, {
      wrapper: routerWrapper,
    });
    const errorMessage = await findByText(
      "Failed to load incoming friend requests"
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it("displays error when sending friend request fails", async () => {
    api.Post.mockImplementation(async (url) => {
      if (url.includes("friends/send")) {
        return Promise.resolve({
          ok: false,
          text: () => Promise.resolve("Error sending friend request"),
        });
      }
    });

    const { getByPlaceholderText, getByText, findByText } = render(
      <FriendsSection />,
      { wrapper: routerWrapper }
    );

    // Attempt to send a friend request
    await act(async () => {
      fireEvent.change(getByPlaceholderText("Enter username"), {
        target: { value: "newfriend" },
      });
      fireEvent.click(getByText("Send Friend Request"));
    });

    const errorMessage = await findByText("Error sending friend request");
    expect(errorMessage).toBeInTheDocument();
  });

  it("validates user input before sending friend request", async () => {
    const { getByText, findByText } = render(<FriendsSection />, {
      wrapper: routerWrapper,
    });

    await act(async () => {
      fireEvent.click(getByText("Send Friend Request"));
    });

    const validationError = await findByText(
      "Username is required to send a friend request"
    );
    expect(validationError).toBeInTheDocument();
  });

  it("sends friend request successfully", async () => {
    api.Post.mockImplementation(async (url) => {
      if (url.includes("friends/send")) {
        return Promise.resolve({ ok: true });
      }
    });

    const { getByPlaceholderText, getByText, findByText } = render(
      <FriendsSection />,
      {
        wrapper: routerWrapper,
      }
    );

    await act(async () => {
      fireEvent.change(getByPlaceholderText("Enter username"), {
        target: { value: "newfriend" },
      });
      fireEvent.click(getByText("Send Friend Request"));
    });

    const successMessage = await findByText(
      "Friend request sent successfully!"
    );
    expect(successMessage).toBeInTheDocument();
  });

  it("accepts a friend request successfully", async () => {
    // Preload with one incoming request
    api.Get.mockImplementationOnce(async (url) => {
      if (url.includes("friends/incoming")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([{ friendID: 3, fromUsername: "friend2" }]),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    // Mock accepting a friend request
    api.Post.mockImplementationOnce(async (url) => {
      if (url.includes("friends/accept")) {
        return Promise.resolve({ ok: true });
      }
      return Promise.reject(new Error("Operation failed"));
    });

    const { findByText, queryByText } = render(<FriendsSection />, {
      wrapper: routerWrapper,
    });

    const acceptButton = await findByText("Accept");
    fireEvent.click(acceptButton);

    await waitFor(() => expect(queryByText("friend2")).not.toBeInTheDocument());
  });

  it("declines a friend request successfully", async () => {
    api.Get.mockImplementationOnce(async (url) => {
      if (url.includes("friends/incoming")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([{ friendID: 4, fromUsername: "friend3" }]),
        });
      }
    });

    api.Post.mockImplementationOnce(async (url) => {
      if (url.includes("friends/decline")) {
        return Promise.resolve({ ok: true });
      }
    });

    const { findByText, queryByText } = render(<FriendsSection />, {
      wrapper: routerWrapper,
    });

    const declineButton = await findByText("Decline");
    fireEvent.click(declineButton);

    await waitFor(() => expect(queryByText("friend3")).not.toBeInTheDocument());
  });

  it("removes a friend successfully", async () => {
    api.Get.mockImplementation(async (url) => {
      if (url.includes("friends/list")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ friendID: 5, username: "friend4" }]),
        });
      }
    });

    api.Get.mockImplementationOnce(async (url) => {
      if (url.includes("friends/list")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
    });

    api.Post.mockImplementationOnce(async (url) => {
      if (url.includes("friends/remove")) {
        return Promise.resolve({ ok: true });
      }
    });

    const { findByText, queryByText } = render(<FriendsSection />, {
      wrapper: routerWrapper,
    });

    await findByText("friend4");

    const removeButtons = await findByText("Remove Friend");
    fireEvent.click(removeButtons);

    await waitFor(() => expect(queryByText("friend4")).not.toBeInTheDocument());
  });

  it("prevents sending a friend request to oneself", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <FriendsSection />,
      { wrapper: routerWrapper }
    );

    await act(async () => {
      fireEvent.change(getByPlaceholderText("Enter username"), {
        target: { value: "testuser" },
      });
      fireEvent.click(getByText("Send Friend Request"));
    });

    const errorMessage = await findByText(
      "You cannot send a friend request to yourself!"
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it("displays error message when fetching friends list fails", async () => {
    api.Get.mockImplementation(async (url) => {
      if (url.includes("friends/list")) {
        return Promise.resolve({
          ok: false,
          text: () => Promise.resolve("Failed to fetch friends list"),
        });
      }
    });

    const { findByText } = render(<FriendsSection />, {
      wrapper: routerWrapper,
    });
    const errorMessage = await findByText("Failed to load friends list");
    expect(errorMessage).toBeInTheDocument();
  });

  it("displays an error message when accepting a friend request fails", async () => {
    api.Post.mockImplementationOnce(async (url) => {
      if (url.includes("friends/accept")) {
        return Promise.resolve({
          ok: false,
          text: () => Promise.resolve("Failed to accept friend request"),
        });
      }
    });

    api.Get.mockImplementationOnce(async (url) => {
      if (url.includes("friends/incoming")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([{ friendID: 3, fromUsername: "friend2" }]),
        });
      }
    });

    const { findByText, getByText } = render(<FriendsSection />, {
      wrapper: routerWrapper,
    });

    const acceptButton = await findByText("Accept");
    fireEvent.click(acceptButton);

    const errorMessage = await findByText("Failed to accept friend request");
    expect(errorMessage).toBeInTheDocument();
  });

  it("displays an error message when declining a friend request fails", async () => {
    api.Post.mockImplementationOnce(async (url) => {
      if (url.includes("friends/decline")) {
        return Promise.resolve({
          ok: false,
          text: () => Promise.resolve("Failed to decline friend request"),
        });
      }
    });

    api.Get.mockImplementationOnce(async (url) => {
      if (url.includes("friends/incoming")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([{ friendID: 4, fromUsername: "friend3" }]),
        });
      }
    });

    const { findByText, getByText } = render(<FriendsSection />, {
      wrapper: routerWrapper,
    });

    const declineButton = await findByText("Decline");
    fireEvent.click(declineButton);

    const errorMessage = await findByText("Failed to decline friend request");
    expect(errorMessage).toBeInTheDocument();
  });

  it("displays an error message when removing a friend fails", async () => {
    api.Get.mockImplementation(async (url) => {
      if (url.endsWith("friends/list")) {
        return {
          ok: true,
          json: async () => [{ userID: 6, username: "friend6" }],
        };
      }
      if (url.endsWith("friends/incoming")) {
        return {
          ok: true,
          json: async () => [],
        };
      }
      throw new Error(`Unhandled request: ${url}`);
    });

    api.Post.mockImplementation(async (url) => {
      if (url.endsWith("friends/remove")) {
        return {
          ok: false,
          text: async () => "Failed to remove friend",
        };
      }
      throw new Error(`Unhandled request: ${url}`);
    });

    const { findByText, findAllByText } = render(<FriendsSection />, {
      wrapper: routerWrapper,
    });

    const friends = await findAllByText(/friend6/);
    expect(friends.length).toBeGreaterThan(0);

    const removeButtons = await findAllByText("Remove Friend");
    fireEvent.click(removeButtons[0]);

    const errorMessage = await findByText("Failed to remove friend");
    expect(errorMessage).toBeInTheDocument();
  });
});
