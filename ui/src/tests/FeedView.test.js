import FeedView from "src/components/custom/FeedView";
import { render, fireEvent, getAllByText } from "@testing-library/react";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase-config";
import { expect, jest, test } from "@jest/globals";
import { waitFor } from "@testing-library/dom";
import { act } from "react-dom/test-utils";
import { Get } from "src/lib/api";
import * as api from "src/lib/api";
import * as AuthContext from "src/context/AuthContext";
import * as React from "react";

initializeApp(firebaseConfig);

jest.mock("src/lib/api");
jest.mock("src/context/AuthContext");

const entries = [
  {
    entryID: 1,
    mood: "🙂",
    date: new Date(),
    image: "",
    isDraft: false,
    title: "title1",
    content: '{"ops":[{"insert":"entry 1 text\\n"}]}',
    Journal: {
      User: {
        userID: 1,
        username: "username1",
      },
    },
  },
  {
    entryID: 2,
    mood: "😡",
    date: new Date(),
    image: "",
    isDraft: false,
    title: "title2",
    content: '{"ops":[{"insert":"entry 2 text\\n"}]}',
    Journal: {
      User: {
        userID: 1,
        username: "username2",
      },
    },
  },
  {
    entryID: 3,
    mood: "😭",
    date: new Date(),
    image: "",
    isDraft: false,
    title: "title3",
    content: '{"ops":[{"insert":"entry 3 text\\n"}]}',
    Journal: {
      User: {
        userID: 1,
        username: "username3",
      },
    },
  },
];

describe("FeedView component", () => {
  beforeEach(() => {
    AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

    api.Get.mockImplementation(async (url, params, options) => {
      // URL IS : 'bookmarks/check_bookmark' used by the Bookmarker component
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(entries),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<FeedView user={{ userID: 1 }} />);
  });

  //   it("fetches personal entries and friends entries correctly", async () => {
  //     Get.mockResolvedValueOnce({
  //       ok: true,
  //       json: () => Promise.resolve(personalEntriesData),
  //     });
  //     const { getByText } = render(<FeedView user={{ userID: 1 }} />);

  //     await waitFor(() => {
  //       expect(Get).toHaveBeenCalledTimes(2);
  //       expect(Get).toHaveBeenCalledWith("entries/fetch_user_entries", null, {
  //         user: { userID: 1 },
  //       });
  //       expect(Get).toHaveBeenCalledWith("entries/fetch_friends_entries", null, {
  //         user: { userID: 1 },
  //       });
  //       expect(getByText("Here are your latest entries")).toBeInTheDocument();
  //     });
  //   });
});
