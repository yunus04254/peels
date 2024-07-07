
import { render, fireEvent, waitFor } from '@testing-library/react';
import Bookmarker from 'src/components/custom/Bookmarker';
import { Get, Post } from 'src/lib/api';
import { User } from 'lucide-react';
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
const mockEntry = {
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

describe('Bookmarker', () => {
    beforeEach(() => {
        
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });
    
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'bookmarks/check_bookmark' used by the Bookmarker component
            return Promise.resolve({ ok: true, json: () => Promise.resolve({isBookmarked: false}) });
        });
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('toggles bookmark status when clicked', async () => {
      Get.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ isBookmarked: false }) });
      Post.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    
      const { getByLabelText } = render(<Bookmarker entry={mockEntry} user={{userID: 1}}/>); // Set userID to 999
    
      // Wait for bookmark status to be fetched
      await waitFor(() => {
        expect(Get).toHaveBeenCalledWith('bookmarks/check_bookmark', { entryID: mockEntry.entryID }, { user: { userID: 1 } }); // Check with userID 999
      });
    
      const bookmarkButton = getByLabelText('Bookmark');
    
      // Simulate clicking the bookmark button
      fireEvent.click(bookmarkButton);
    
      // Wait for bookmark status to be updated
      await waitFor(() => {
        expect(Post).toHaveBeenCalledWith('bookmarks/bookmark_entry', { entryID: mockEntry.entryID }, null, { user: { userID: 1 } }); // Check with userID 999
      });
    
      // Ensure the bookmark icon is updated
      expect(getByLabelText('Bookmark').classList.contains('pressed')).toBe(false);
    });

  it('deletes a bookmark when clicked', async () => {
    // Mock the response for deleting the bookmark
    Post.mockResolvedValueOnce({ ok: true });


    // Render the Bookmarker component
    const { getByLabelText } = render(
        <Bookmarker entry={mockEntry} user= {{userID:1}}/>
    );

    // Simulate clicking the bookmark button
    fireEvent.click(getByLabelText('Bookmark'));

    // Wait for the bookmark to be deleted
    await waitFor(() => {
        expect(Post).toHaveBeenCalledWith(
            'bookmarks/bookmark_entry',
            { entryID: mockEntry.entryID },
            null,
            { user: { userID: 1 } }
        );
    });

    
});

//   it('handles error when toggling bookmark status', async () => {
//     Get.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ isBookmarked: false }) });
//     Post.mockRejectedValueOnce(new Error('Failed to bookmark entry'));

//     const { getByLabelText } = render(<Bookmarker entry={mockEntry} />);

//     // Wait for bookmark status to be fetched
//     await waitFor(() => {
//       expect(Get).toHaveBeenCalledWith('bookmarks/check_bookmark', { entryID: mockEntry.entryID }, { user: undefined });
//     });

//     const bookmarkButton = getByLabelText('Bookmark');

//     // Simulate clicking the bookmark button
//     fireEvent.click(bookmarkButton);

//     // Wait for error message to be displayed
//     await waitFor(() => {
//       expect(Post).toHaveBeenCalledWith('bookmarks/bookmark_entry', { entryID: mockEntry.entryID }, null, { user: undefined });
//       expect(screen.getByText('Failed to bookmark entry')).toBeInTheDocument();
//     });
//   });
});
