
import { render, waitFor } from '@testing-library/react';
import { Get } from 'src/lib/api';
import { useAuth } from 'src/context/AuthContext';
import BookmarksView from 'src/components/custom/BookmarksView';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext'; 
import * as React from 'react'; 

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

const entry = {
  entryID: 1,
  mood: "🙂",
  date: new Date(),
  image: "",
  isDraft: false, 
  title: "title",
  content : {},
  Journal: {
      User: {
          userID: 1,
          username: "username",
      }
  }
}
const bookmark = [
{
  bookmarkID:1,
  entryID:1,
  UserUserID: 1,
},
]
const toggleRefresh = jest.fn();
const click = jest.fn();

describe('BookmarksView component', () => {

  beforeEach(() => {
    useAuth.mockReturnValue({ user: { userID: 1 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render BookmarksView component', async () => {
    const entry = {
      entryID: 1,
      mood: "🙂",
      date: new Date(),
      image: "",
      isDraft: false, 
      title: "title",
      content : {},
      Journal: {
        User: {
          userID: 1,
          username: "username",
        }
      }
    };

    // Mock the response to return an array of objects containing the entry data
    Get.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ Entry: entry }]) });

    const { getByText, getByLabelText, getByRole } = render(<BookmarksView user={{ userID: 1 }} />);

    // Assert that the rendered entry matches the expected data
    expect(getByText('title')).toBeInTheDocument();
    expect(getByText('🙂')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Bookmark', pressed: true })).toBeInTheDocument();
  });
  
  it('should handle error while fetching bookmarks', async () => {
    Get.mockResolvedValueOnce({
      ok: false,
      status: 500, // Mock the error response status code
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<BookmarksView />);

    // Wait for error handling
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  // Add more test cases as needed
});
