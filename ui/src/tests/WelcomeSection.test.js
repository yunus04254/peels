import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WelcomeSection from 'src/components/custom/WelcomeSection';

describe('WelcomeSection component', () => {
  it('renders the WelcomeSection component with username', () => {
    const { getByText } = render(
      <BrowserRouter>
        <WelcomeSection username="John" />
      </BrowserRouter>
    );

    expect(getByText('Welcome to Peels, John!')).toBeInTheDocument();
    expect(getByText('Your journey to personal growth and reflection starts here.')).toBeInTheDocument();
  });

  it('navigates to the journals page when "Start Journaling" button is clicked', () => {
    const { getByText } = render(
      <BrowserRouter>
        <WelcomeSection username="John" />
      </BrowserRouter>
    );

    const startJournalingButton = getByText('Start Journaling');
    fireEvent.click(startJournalingButton);

    // You can add more assertions here to ensure correct navigation
    // For example, you can assert that the URL has changed to '/journals'
    expect(window.location.pathname).toEqual('/journals');
  });
});
