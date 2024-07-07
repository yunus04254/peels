global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
      this.callback = callback;
  }

  observe() {
      // You can optionally implement mock logic here if needed for your tests
  }

  unobserve() {
      // You can optionally implement mock logic here if needed for your tests
  }

  disconnect() {
      // You can optionally implement mock logic here if needed for your tests
  }
};


import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import CreateJournal from 'src/components/custom/CreateJournal'; // Update this path to your actual component's location
import * as AuthContext from 'src/context/AuthContext';
import * as api from 'src/lib/api'; // Adjust the path accordingly
import userEvent from '@testing-library/user-event';

// Mocking the AuthContext and any other dependencies
jest.mock('src/context/AuthContext');
jest.mock('src/lib/api', () => ({
  Post: jest.fn(),
  Get: jest.fn(),
}));

const mockOnAddJournal = jest.fn();



describe('CreateJournal', () => {
  beforeAll(() => {
    window.alert = jest.fn();
  });

  beforeEach(() => {

    AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });
    // Reset mocks and setup default mock behavior for Get
    api.Get.mockClear();
    api.Post.mockClear();

    // Mock the Get method to return a promise resolving to a mock response
    api.Get.mockImplementation((url, params) => {
      if (url === 'style/owned') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([/* Mock styles data */]),
        });
      }
    });

});


  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CreateJournal onAddJournal={() => {}} />);
  });

  it('opens the dialogue upon clicking "Create Journal"', () => {
    const { getByText, queryByLabelText } = render(<CreateJournal onAddJournal={() => {}} />);


    fireEvent.click(getByText('Create Journal'));

    expect(getByText('Journal Title:')).toBeInTheDocument();
    expect(getByText('Select a theme')).toBeInTheDocument();
    expect(getByText('Set a reminder')).toBeInTheDocument();
});


  it('allows entering a journal title', () => {
    const { getByText, getByLabelText } = render(<CreateJournal onAddJournal={() => {}} />);
    fireEvent.click(getByText('Create Journal'));

    const titleInput = getByLabelText("Journal Title:"); // Adjust based on your actual label text
    fireEvent.change(titleInput, { target: { value: 'My New Journal' } });
    expect(titleInput.value).toBe('My New Journal');
  });

  it('allows selecting a journal theme', () => {
    const { getByText, getByLabelText } = render(<CreateJournal onAddJournal={() => {}} />);
    fireEvent.click(getByText('Create Journal'));
    const themeSelectTrigger = getByText("Select a theme");

    fireEvent.click(themeSelectTrigger);
    const themeToSelect = getByText("Ocean Blue");
    fireEvent.click(themeToSelect);

    expect(getByText('Ocean Blue')).toBeInTheDocument();
  });

  it('allows setting a journal reminder', () => {
    const { getByText, getByLabelText } = render(<CreateJournal onAddJournal={() => {}} />);
    fireEvent.click(getByText('Create Journal'));
    const themeSelectTrigger = getByText("Set a reminder");

    fireEvent.click(themeSelectTrigger);
    const themeToSelect = getByText("Every day");
    fireEvent.click(themeToSelect);
    const reminderSelectTrigger = getByText("Set a reminder"); 

    fireEvent.click(reminderSelectTrigger); 
    const reminderToSelect = getByText("Every day");
    fireEvent.click(reminderToSelect);

    expect(getByText('Every day')).toBeInTheDocument();
  });

  it('does not allow dialogue to be closed with empty input fields', async () => {
    const { getByText, getByRole, queryByText } = await render(<CreateJournal onAddJournal={() => {}} />);

    fireEvent.click(getByText("Create Journal"));

    fireEvent.click(getByRole("button", { name: "Create" }));

    expect(getByText('Journal Title:')).toBeInTheDocument();
    expect(getByText('Select a theme')).toBeInTheDocument();
    expect(getByText('Set a reminder')).toBeInTheDocument();
});

});