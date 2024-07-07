import LoginBonus from 'src/components/custom/LoginBonus';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest} from '@jest/globals';
import { BananaProvider } from 'src/context/BananaContext';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext'; 
import * as React from 'react'; 


initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

describe(LoginBonus, () => {
    
    const routerWrapper = ({ children }) => <BrowserRouter><BananaProvider>{children}</BananaProvider></BrowserRouter>;

    beforeEach(() => {
        api.Get.mockImplementation(async (url, params, options) => {
            if(url === 'users/loggedInToday' && options.user.uid === 1)
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ loggedInToday: false }) });
            }
            else if(url === 'users/loggedInToday' && options.user.uid === 2)
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ loggedInToday: true }) });
            }
            if(url === 'users/loggedInYesterday' && options.user.uid === 1)
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ loggedInYesterday: true }) });
            }
            else if(url === 'users/loggedInYesterday' && options.user.uid === 2)
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ loggedInYesterday: false }) });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });

        api.Post.mockImplementation(async (url, params, options) => {
            return Promise.resolve({ ok: true });
        });

        const mockIntersectionObserver = jest.fn();
        mockIntersectionObserver.mockReturnValue({
          observe: () => null,
          unobserve: () => null,
          disconnect: () => null
        });
        window.IntersectionObserver = mockIntersectionObserver;

        const mockResizeObserver = jest.fn();
        mockResizeObserver.mockReturnValue({
          observe: () => null,
          unobserve: () => null,
          disconnect: () => null
        });
        window.ResizeObserver = mockResizeObserver;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the login bonus', async () => {
        AuthContext.useAuth.mockReturnValue({ user: { uid: 1 } });
        const { getByText } = await act( async () => render(<LoginBonus />, { wrapper: routerWrapper }));
        expect(getByText('Daily Bonus')).toBeInTheDocument();
    });

    it('does not render the login bonus if user has logged in already today', async () => {
        AuthContext.useAuth.mockReturnValue({ user: { uid: 2 } });
        const { getByText } = await act( async () => render(<LoginBonus />, { wrapper: routerWrapper }));
        expect(getByText('Daily Bonus').hidden).toBe(true);
    });

    it('Claims the bonus as expected (having logged in the day before)', async () => {
        AuthContext.useAuth.mockReturnValue({ user: { uid: 1, daysInARow: 2 } });
        const { getByText } = await act( async () => render(<LoginBonus />, { wrapper: routerWrapper }));
        
        const dailyBonus = await getByText('Daily Bonus');

        await act( async () => fireEvent.click(dailyBonus));

        const claimButton = await getByText('Claim my bananas!');

        const calls = api.Get.mock.calls.length;

        await act( async () => fireEvent.click(claimButton));

        expect(api.Get.mock.calls.length).toBe(calls + 1);
    });

    it('Claims the bonus as expected (having not logged in the day before)', async () => {
        AuthContext.useAuth.mockReturnValue({ user: { uid: 2, daysInARow: 2 } });
        const { getByText } = await act( async () => render(<LoginBonus />, { wrapper: routerWrapper }));
        
        const dailyBonus = await getByText('Daily Bonus');

        await act( async () => fireEvent.click(dailyBonus));

        const claimButton = await getByText('Claim my bananas!');

        const calls = api.Get.mock.calls.length;

        await act( async () => fireEvent.click(claimButton));

        expect(api.Get.mock.calls.length).toBe(calls + 1);

        expect(api.Post).toHaveBeenCalledTimes(1);
    });

    it('Handles exit as expected after claiming the bonus', async () => {
        AuthContext.useAuth.mockReturnValue({ user: { uid: 1, daysInARow: 2 } });
        const { getByText } = await act( async () => render(<LoginBonus />, { wrapper: routerWrapper }));
        
        const dailyBonus = await getByText('Daily Bonus');

        await act( async () => fireEvent.click(dailyBonus));

        const claimButton = await getByText('Claim my bananas!');

        await act( async () => fireEvent.click(claimButton));

        const exitButton = await getByText('*happy monkey noises*');

        const calls = api.Post.mock.calls.length;

        await act( async () => fireEvent.click(exitButton));

        expect(api.Post.mock.calls.length).toBe(2);
    });
});