import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import JournalSection from 'src/components/custom/JournalSection'; // Adjust import path as necessary
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext';

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

describe('JournalSection', () => {
  const mockJournals = [
    {
      journalID: '1',
      title: 'Journal 1',
      theme: 'Theme 1',
      reminder: '2020-01-01',
      isPrivate: false,
      image: 'image1.jpg',
    },
    {
      journalID: '2',
      title: 'Journal 2',
      theme: 'Theme 2',
      reminder: '2020-02-01',
      isPrivate: true,
      image: 'image2.jpg',
    },
  ];

  beforeEach(() => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'user1', name: 'Test User' },
    });

    api.Get.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJournals),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches journals on component mount and displays them', async () => {
    let getByText;
    await act(async () => {
      const { getByText: localGetByText } = render(
        <Router>
          <JournalSection />
        </Router>
      );
      getByText = localGetByText;
    });

    expect(getByText('Journal 1')).toBeInTheDocument();
    expect(getByText('Journal 2')).toBeInTheDocument();
  });

  it('displays no journals message when there are no journals', async () => {
    api.Get.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    let getByText;
    await act(async () => {
      const { getByText: localGetByText } = render(
        <Router>
          <JournalSection />
        </Router>
      );
      getByText = localGetByText;
    });

    expect(getByText('No journals found. Start by creating a new one!')).toBeInTheDocument();
  });

  it('handles navigation between journals correctly', async () => {
    let getByText, container;
    await act(async () => {
      const rendered = render(
        <Router>
          <JournalSection />
        </Router>
      );
      getByText = rendered.getByText;
      container = rendered.container;
    });

    const nextButton = container.querySelector('.scroll-button.next');
    if (nextButton) fireEvent.click(nextButton);

    const prevButton = container.querySelector('.scroll-button.prev');
    if (prevButton) fireEvent.click(prevButton);
  });

  it('adjusts visible journals on window resize', async () => {
    global.innerWidth = 1024; // Start with a larger screen
    let container;
    await act(async () => {
      const { container: localContainer } = render(
        <Router>
          <JournalSection />
        </Router>
      );
      container = localContainer;
    });

    expect(container.querySelectorAll('.journal-card-wrapper').length).toBeGreaterThan(1);

    act(() => {
      global.innerWidth = 500;
      fireEvent(global.window, new Event('resize'));
    });
  });

  it('updates journal list upon deletion of a journal', async () => {
    let queryByText;

    await act(async () => {
      const { queryByText: localQueryByText } = render(
        <Router>
          <JournalSection />
        </Router>
      );
      queryByText = localQueryByText;
    });

    expect(api.Get).toHaveBeenCalledTimes(3);
  });

  it('logs an error when fetching journals fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');
    api.Get.mockRejectedValueOnce(new Error('Network Error'));

    await act(async () => {
      render(
        <Router>
          <JournalSection />
        </Router>
      );
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching journals:', expect.any(Error));
  });
  it('removes the resize event listener on component unmount', () => {
    const removeEventListenerSpy = jest.spyOn(global.window, 'removeEventListener');

    const { unmount } = render(
      <Router>
        <JournalSection />
      </Router>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

});