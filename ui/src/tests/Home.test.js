import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';
import Home from 'src/pages/Home';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContext from 'src/context/AuthContext';
import * as NotificationContext from 'src/context/NotificationContext';
import * as api from 'src/lib/api';


// Mocks
jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');
jest.mock('src/context/NotificationContext');

// Helper function to provide the necessary context providers to the Home component
const withProviders = (ui) => (
  <BrowserRouter>
    <AuthContext.AuthProvider>
      <NotificationContext.NotificationProvider>
        {ui}
      </NotificationContext.NotificationProvider>
    </AuthContext.AuthProvider>
  </BrowserRouter>
);

describe('Home Component', () => {
  beforeEach(() => {
    // Mocking contexts and API responses
    AuthContext.useAuth.mockReturnValue({ user: { username: 'testUser' } });
    NotificationContext.useNotification.mockReturnValue({
      sendNotification: jest.fn(),
      updateNotifications: jest.fn(),
      deleteNotification: jest.fn(),
    });
    api.Get.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totalEntries: '10', totalJournals: '5', longestStreak: '7', currentStreak: '2' }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and displays user welcome message', async () => {
    const { findByText } = render(withProviders(<Home />));
    expect(await findByText(/welcome, testUser/i)).toBeInTheDocument();
  });

  it('displays statistics section based on screen size', async () => {
    // Simulate a mobile device
    global.innerWidth = 500;
    const { findByText, rerender } = render(withProviders(<Home />));
    expect(await findByText(/Statistics/i)).toBeInTheDocument();

    // Simulate a desktop device
    global.innerWidth = 1024;
    // Force a re-render to apply the new screen size
    rerender(withProviders(<Home />));
    expect(await findByText(/Statistics/i)).toBeInTheDocument();
  });

  it('handles template selection correctly', async () => {
    const { getByTestId, findByText } = render(withProviders(<Home />));
    const templateButton = getByTestId('template-select-button'); // Assuming there's a data-testid="template-select-button" on the template selection button
    act(() => {
      fireEvent.click(templateButton);
    });
    expect(await findByText(/Template Selected/i)).toBeInTheDocument();
  });

  it('renders essential sections for the home page', async () => {
    const { findByText } = render(withProviders(<Home />));
    await waitFor(() => {
      expect(findByText(/Journal/i)).toBeInTheDocument();
      expect(findByText(/Goal Setting/i)).toBeInTheDocument();
      expect(findByText(/New Entry/i)).toBeInTheDocument(); // Assuming "New Entry" text is part of NewEntryCarousel or similar
    });
  });

  // Additional tests can be added here as needed
});
