//JEST Testing file for ViewLeaderboard component
import LeaderboardRow from 'src/components/custom/LeaderboardRow';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { waitFor } from '@testing-library/dom';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext';
import * as React from 'react';

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

describe('ViewLeaderboard component', () => {

        const routerWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

        beforeEach(() => {
            jest.clearAllMocks();
            AuthContext.useAuth.mockReturnValue({ user: { userID: 1, username: "username1" } });
        });


        const leaderboard_users = [
            {
                userID: 1,
                username: "username1",
                xp: 100
            },
            {
                userID: 2,
                username: "username2",
                xp: 200
            }
        ]

    it('should render LeaderboardRow component rank 1 and user is on leaderboard',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(leaderboard_users) });
        });

        var getByText = null;

        await act(async () => {
            const { getByText: gbt } = render(<LeaderboardRow rank={1} user={leaderboard_users[0]} xp={100} logged_in_user={leaderboard_users[0]} />, { wrapper: routerWrapper });
            getByText = gbt;
        });

        expect(getByText("You")).toBeInTheDocument();
        expect(getByText("100 XP")).toBeInTheDocument();
        expect(getByText("User")).toBeInTheDocument();
        //find the rank 1 image
        expect(document.querySelector('.rank-icon').src).toContain('rank-1.png');
    });

    it('should render LeaderboardRow component rank 2',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(leaderboard_users) });
        });

        var getByText = null;

        await act(async () => {
            const { getByText: gbt } = render(<LeaderboardRow rank={2} user={leaderboard_users[1]} xp={200} logged_in_user={leaderboard_users[0]} />, { wrapper: routerWrapper });
            getByText = gbt;
        });

        expect(getByText("username2")).toBeInTheDocument();
        expect(getByText("200 XP")).toBeInTheDocument();
        //find the rank 2 image
        expect(document.querySelector('.rank-icon').src).toContain('rank-2.png');
    });

    it('should render LeaderboardRow component rank 3',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(leaderboard_users) });
        });

        var getByText = null;

        await act(async () => {
            const { getByText: gbt } = render(<LeaderboardRow rank={3} user={leaderboard_users[1]} xp={200} logged_in_user={leaderboard_users[0]} />, { wrapper: routerWrapper });
            getByText = gbt;
        });

        expect(getByText("username2")).toBeInTheDocument();
        expect(getByText("200 XP")).toBeInTheDocument();
        //find the rank 3 image
        expect(document.querySelector('.rank-icon').src).toContain('rank-3.png');
    });

    it('should render LeaderboardRow component rank 4 and above',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(leaderboard_users) });
        });

        var getByText = null;

        await act(async () => {
            const { getByText: gbt } = render(<LeaderboardRow rank={4} user={leaderboard_users[1]} xp={200} logged_in_user={leaderboard_users[0]} />, { wrapper: routerWrapper });
            getByText = gbt;
        });

        expect(getByText("username2")).toBeInTheDocument();
        expect(getByText("200 XP")).toBeInTheDocument();
        //find the rank number
        expect(getByText("4.")).toBeInTheDocument();
    });

});

