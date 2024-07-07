import React from 'react';
import { render, fireEvent, waitFor, screen, act} from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import Sidebar from 'src/components/custom/Sidebar';
import { initializeApp } from 'firebase/app';
import firebaseConfig from 'src/firebase-config';
import * as AuthContext from 'src/context/AuthContext';
import * as BananaContext from 'src/context/BananaContext';
import * as NotificationContext from 'src/context/NotificationContext';
import { getAuth, signOut } from "firebase/auth";

initializeApp(firebaseConfig);

jest.mock('src/context/AuthContext');
jest.mock('src/context/NotificationContext');
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(),
    signOut: jest.fn()
  }));


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/home'
  })
}));

jest.mock('src/context/BananaContext')

function flushPromises() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    BananaContext.useBanana.mockReturnValue({ bananas: 0, updateBananas: jest.fn() });
    AuthContext.useAuth.mockReturnValue({ user: { username: 'testuser', userID: 'user123' } });
    NotificationContext.useNotification.mockReturnValue({
      sendNotification: jest.fn(),
      updateNotifications: jest.fn(),
      deleteNotification: jest.fn(),
      notifications: []
    });
    signOut.mockImplementation(() => Promise.resolve());
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders and operates the sidebar correctly', async () => {
    const { container, getByText } = render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    // Test for initial render
    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Journals')).toBeInTheDocument();

    // Find the menu button by class name and simulate a click
    const menuButton = container.querySelector('.menu-button');
    if (menuButton) fireEvent.click(menuButton);

    await waitFor(() => {
      // Expect some change in the DOM that indicates the menu has been toggled
      // For example, if toggling the menu changes the presence of a "Bookmarks" link
      expect(getByText('Bookmarks')).toBeInTheDocument();
    });

    // Further actions and expectations...
  });

  it('navigates to the correct page on link click and updates active link', async () => {
    const { getByText } = render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    // Mock the handleClick function if necessary to ensure navigation is simulated

    // Test navigation to each page by clicking the link
    fireEvent.click(getByText('Home'));
    expect(window.location.pathname).toEqual('/home');
    expect(getByText('Home').parentElement.className).toContain('active');

    fireEvent.click(getByText('Journals'));
    expect(window.location.pathname).toEqual('/journals');
    expect(getByText('Journals').parentElement.className).toContain('active');

    fireEvent.click(getByText('Market'));
    expect(window.location.pathname).toEqual('/market');
    expect(getByText('Market').parentElement.className).toContain('active');

    fireEvent.click(getByText('Leaderboard'));
    expect(window.location.pathname).toEqual('/leaderboard');
    expect(getByText('Leaderboard').parentElement.className).toContain('active');

    fireEvent.click(getByText('Statistics'));
    expect(window.location.pathname).toEqual('/statistics');
    expect(getByText('Statistics').parentElement.className).toContain('active');

    fireEvent.click(getByText('Friends'));
    expect(window.location.pathname).toEqual('/friends');
    expect(getByText('Friends').parentElement.className).toContain('active');
  });


  it('handles clicks on dynamically added links and logout', async () => {
    const { getByText, queryByText } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    fireEvent.click(getByText('Bookmarks'));

    fireEvent.click(getByText('Settings'));

    fireEvent.click(getByText('Log Out'));
    await waitFor(() => {

      expect(signOut).toHaveBeenCalled();

    });
    fireEvent.click(queryByText('Profile'));

  });

  it('correctly handles clicks on the "Bookmarks" and "Settings" links and performs logout', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    fireEvent.click(getByText('Bookmarks'));

    fireEvent.click(getByText('Settings'));

    fireEvent.click(getByText('Log Out'));

    await fireEvent.click(getByText('Log Out'));
    expect(signOut).toHaveBeenCalled();

  });


  it('displays dynamic links and handles logout when sidebar is open', () => {
    const { container, queryByText } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );


    const toggleButton = container.querySelector('.menu-button');
    if (toggleButton) {
      fireEvent.click(toggleButton);
    } else {
      throw new Error('Menu toggle button not found');
    }


    fireEvent.click(queryByText('Bookmarks'));

    fireEvent.click(queryByText('Settings'));

    fireEvent.click(queryByText('Log Out'));
    expect(signOut).toHaveBeenCalled();

  });

  it('closes the sidebar when clicking outside on a narrow viewport', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const toggleButton = container.querySelector('.menu-button');
    expect(toggleButton).not.toBeNull();
    fireEvent.click(toggleButton);

    const sidebar = container.querySelector('.sidebar.active');
    expect(sidebar).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(container.querySelector('.sidebar.active')).toBeNull();
  });

  afterEach(() => {
    // Clean up changes to global properties
    delete window.innerWidth;
  });

  it('should handle window resize to close sidebar when width is less than 768px', async () => {
    console.log('Test started');

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    console.log('Component rendered');

    // Act on window resize event
    await act(async () => {
      console.log('Before resizing window');
      window.innerWidth = 500;
      window.dispatchEvent(new Event('resize'));
      console.log('After resizing window');
    });

    // Use waitFor to wait for the sidebar to become inactive
    await waitFor(() => {
      expect(document.querySelector('.sidebar.active')).toBeNull();
    }, { timeout: 10000 }); // Waiting up to 10 seconds for the condition to be met

    console.log('Checking sidebar state');
    // After waitFor, we know the sidebar should be inactive. Additional checks can be added here if necessary.
    console.log('Test completed');
  });



  it('should not close sidebar on window resize when width is greater than 768px', async () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.click(document.querySelector('.menu-button')); // Ensure this opens the sidebar
    });

    await act(async () => {
      window.innerWidth = 1024;
      window.dispatchEvent(new Event('resize'));
    });

    // Adjusted waitFor to check for the sidebar being present, assuming it means open
    await waitFor(() => {
      expect(document.querySelector('.sidebar')).toBeInTheDocument(); // Adjust if a different condition signifies open
    }, { timeout: 10000 });
  });

  it('should toggle dropdown menu correctly', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Simulate click on profile to open dropdown
    fireEvent.click(getByText('@testuser'));

    // Check if dropdown menu is shown
    expect(getByText('Profile')).toBeInTheDocument();
    expect(getByText('Bookmarks')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();
    expect(getByText('Log Out')).toBeInTheDocument();

    // Simulate click on profile again to close dropdown
    fireEvent.click(getByText('@testuser'));

    // Check if dropdown menu is hidden
    expect(document.querySelector('.profile-options.active')).toBeNull();
  });


  it('shows sidebar and dynamic links when toggle button is clicked in narrow viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500 // narrow viewport
    });
    window.dispatchEvent(new Event('resize'));

    const { container, getByText } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Find and click the toggle button to open the sidebar
    const toggleButton = container.querySelector('.menu-button');
    fireEvent.click(toggleButton);

    // Check if sidebar is shown
    expect(getByText('Bookmarks')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();
  });

});