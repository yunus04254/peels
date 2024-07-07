import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GoalSetting from 'src/components/custom/GoalSection';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext';
import * as NotificationContext from 'src/context/NotificationContext';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import { expect, jest } from '@jest/globals';

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');
jest.mock('src/context/NotificationContext');

describe('GoalSetting component', () => {
  const routerWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;



  beforeEach(() => {
    jest.clearAllMocks();
    AuthContext.useAuth.mockReturnValue({ user: { userID: 'user123' } });
    NotificationContext.useNotification.mockReturnValue({
      deleteNotification: jest.fn(),
      sendNotification: jest.fn().mockImplementation(() => {
        console.log("sendNotification called BRUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU");
      }),
      updateNotifications: jest.fn(),
    });
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-03-26').getTime());

    api.Get.mockImplementation(async (url, params) => {
      if (url === 'goals' && params.id === 'user123') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { goalID: '1', title: 'Goal 1', description: 'Description 1', startDate: '2024-03-20', endDate: '2024-03-27', reminderTime: 'morning' }
          ])
        });
      }
      return Promise.resolve({ ok: false });
    });

    api.Post.mockImplementation(async (url, body) => {
      if (url === 'goals') {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: false });
    });

    api.Put.mockImplementation(async (url, body) => {
      if (url.startsWith('goals/')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: false });
    });

    api.Delete.mockImplementation(async (url) => {
      if (url.startsWith('goals/')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: false });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders GoalSetting and fetches goals successfully', async () => {
    let getByText, getByPlaceholderText;
    await act(async () => {
      const rendered = render(<GoalSetting />, { wrapper: routerWrapper });
      getByText = rendered.getByText;
      getByPlaceholderText = rendered.getByPlaceholderText;
    });

    expect(getByText('Your Goals')).toBeInTheDocument();
    expect(getByText('Goal 1')).toBeInTheDocument();
    expect(api.Get).toHaveBeenCalled();
  });

  it('opens and closes the goal modal', async () => {
    const { getByText, queryByText } = render(<GoalSetting />, { wrapper: routerWrapper });

    await act(async () => {
      fireEvent.click(getByText('+'));
    });

    expect(getByText('Add New Goal')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(queryByText('Cancel'));
    });

    expect(queryByText('Add New Goal')).not.toBeInTheDocument();
  });

  it('creates a new goal', async () => {
    const { getByText, getByPlaceholderText } = render(<GoalSetting />, { wrapper: routerWrapper });

    await act(async () => {
      fireEvent.click(getByText('+'));
    });

    fireEvent.change(getByPlaceholderText('Goal title'), { target: { value: 'New Goal' } });
    fireEvent.change(getByPlaceholderText('Goal description'), { target: { value: 'New description' } });

    await act(async () => {
      fireEvent.click(getByText('Save Goal'));
    });

    expect(api.Post).toHaveBeenCalled();
  });

  it('edits an existing goal', async () => {
    const { findByText, getByPlaceholderText } = render(<GoalSetting />, { wrapper: routerWrapper });

    // Use findByText to wait for the goal item to be rendered. This function returns a promise, so use await.
    const goalItem = await findByText('Goal 1');

    // Once the goal item is found, proceed with the click action to open the edit modal.
    fireEvent.click(goalItem);

    // Now, you can safely assume the modal is open and interact with its inputs.
    fireEvent.change(getByPlaceholderText('Goal title'), { target: { value: 'Updated Goal' } });

    // Assuming there's a button to submit the form which triggers the update.
    // Make sure to wait for the button to appear in case it's dynamically rendered.
    const updateButton = await findByText('Update Goal');
    fireEvent.click(updateButton);

    // Verify the PUT API call was made.
    expect(api.Put).toHaveBeenCalled();
  });


  it('deletes an existing goal', async () => {
    const { findByText, getAllByRole } = render(<GoalSetting />, { wrapper: routerWrapper });

    // Wait for a goal to be rendered. Adjust the text if necessary to match your component.
    const goalItemText = await findByText('Goal 1');

    // Assuming each goal item has a delete button that is an <button> element, and it's the only button in each goal item.
    const deleteButtons = getAllByRole('button', { name: /×/ });
    expect(deleteButtons.length).toBeGreaterThan(0); // Make sure we have at least one delete button

    await act(async () => {
      fireEvent.click(deleteButtons[0]); // Click on the delete button of the first goal item
    });

    expect(api.Delete).toHaveBeenCalled();
  });

  it('shows an alert if saving a goal fails', async () => {
    // Mock the API call to simulate failure
    api.Post.mockImplementationOnce(async () => Promise.resolve({ ok: false }));

    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    const { getByText, getByPlaceholderText } = render(<GoalSetting />, { wrapper: routerWrapper });

    // Open the modal to add a new goal
    await act(async () => {
      fireEvent.click(getByText('+'));
    });

    // Fill out the form
    fireEvent.change(getByPlaceholderText('Goal title'), { target: { value: 'New Goal' } });
    fireEvent.change(getByPlaceholderText('Goal description'), { target: { value: 'New description' } });

    // Attempt to save the new goal
    await act(async () => {
      fireEvent.click(getByText('Save Goal'));
    });

    // Check for alert
    expect(window.alert).toHaveBeenCalledWith('Failed to save goal');

    // Clean up the mock to ensure it doesn't affect other tests
    window.alert.mockRestore();
  });

  it('shows an alert if deleting a goal fails', async () => {
    // Mock the API call to simulate failure
    api.Delete.mockImplementationOnce(async () => Promise.resolve({ ok: false }));

    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    const { findByText, findAllByRole } = render(<GoalSetting />, { wrapper: routerWrapper });

    // Ensure goals are fetched and rendered
    const goalTitle = await findByText('Goal 1');

    // Since the delete button is within the goal item component, you can find all buttons and filter by the delete button's class
    const deleteButtons = await findAllByRole('button', { name: '×' });
    expect(deleteButtons.length).toBeGreaterThan(0); // Ensure there's at least one delete button rendered

    // Attempt to delete the first goal
    await act(async () => {
      fireEvent.click(deleteButtons[0]); // Click the delete button for the first goal
    });

    // Check for alert
    expect(window.alert).toHaveBeenCalledWith('Failed to delete goal');

    // Clean up
    window.alert.mockRestore();
  });

});

