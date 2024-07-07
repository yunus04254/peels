global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
  
    observe() {}
  
    unobserve() {}
  
    disconnect() {}
  };

  Object.defineProperty(Element.prototype, 'hasPointerCapture', {
    value: jest.fn(() => true),
  });


import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditJournal from 'src/components/custom/EditJournal';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContext from 'src/context/AuthContext';
import * as api from 'src/lib/api';
import { waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';


jest.mock('src/context/AuthContext');
jest.mock('src/lib/api');

const mockJournal = {
  journalID: 1,
  title: 'My Original Journal',
  theme: 'Ocean Blue',
  reminder: 'Every day',
  isPrivate: false,
  image: ''
};

const mockOnUpdateJournal = jest.fn();

describe('EditJournal', () => {
    beforeEach(() => {
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });
        api.Get.mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
        api.Put.mockImplementation((url, data) => Promise.resolve({
            ok: true, 
            json: () => Promise.resolve({
              ...mockJournal,
              ...data,
            })
          }));
      });
    
      afterEach(() => {
        jest.clearAllMocks();
      });


      it('launches EditJournal dialog from Journal component and allows update', async () => {
        const user = userEvent.setup();
        const mockJournal = {
            journalID: '1',
            title: 'My Journal',
            theme: 'Ocean Blue',
            reminder: 'Every day',
            isPrivate: false,
            image: '',
            ownerUsername: 'testUser',
            isOwner: true
          };
          
          const mockOnUpdateJournal = jest.fn();
      
          render(
            <BrowserRouter>
              <EditJournal journal={mockJournal} onUpdateJournal={mockOnUpdateJournal} />
            </BrowserRouter>
          );
    
          await act(async () => {
            await user.click(screen.getByTestId('edit-journal-trigger'));
          });

        await waitFor(() => expect(screen.getByLabelText('Journal Title:')).toBeInTheDocument());
        });

  it('renders with pre-filled journal data', async () => {
    const user = userEvent.setup();
    render(<EditJournal journal={mockJournal} onUpdateJournal={mockOnUpdateJournal} />);

    await act(async () => {
        await user.click(screen.getByTestId('edit-journal-trigger'));
      });

    await waitFor(() => {
        const titleInput = screen.getByLabelText('Journal Title:');
        expect(titleInput.value).toBe(mockJournal.title);
      });

  });

  
  it('allows updating and submitting journal title', async () => {
    const user = userEvent.setup();
    render(<EditJournal journal={mockJournal} onUpdateJournal={mockOnUpdateJournal} />);

    await act(async () => {
        await user.click(screen.getByTestId('edit-journal-trigger'));
      });
    
    await act(async () => {
  
        const titleInput = screen.getByLabelText('Journal Title:');
        await user.clear(titleInput);
        await user.type(titleInput, 'Updated Journal Title');
  
        await user.click(screen.getByRole('button', { name: 'Submit' }));
      });

    expect(mockOnUpdateJournal).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Updated Journal Title',
    }));
  });

});
