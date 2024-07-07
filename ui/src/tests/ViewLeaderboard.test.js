//JEST Testing file for ViewLeaderboard component
import ViewLeaderboard from 'src/components/custom/ViewLeaderboard';
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
        jest.spyOn(console, 'error').mockImplementation(() => {});
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

    it('should render ViewLeaderboard component',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(leaderboard_users) });
        });

        const get_top100users = jest.fn().mockImplementation(async () => {
            const response = await api.Get('users/top_100');
            const data = await response.json();
            data.sort((a, b) => {
              if (a.xp === b.xp) {
                return a.username.localeCompare(b.username);
              }
              return 0;
            });
            return data;
        });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<ViewLeaderboard getUsers={get_top100users} title={"title"} description={"description"} />, { wrapper: routerWrapper });
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        expect(getByText('You')).toBeInTheDocument();
        expect(getByText('username2')).toBeInTheDocument();
        expect(getByText('100 XP')).toBeInTheDocument();
        expect(getByText('200 XP')).toBeInTheDocument();
        expect(getByText('title')).toBeInTheDocument();
        expect(getByText('description')).toBeInTheDocument();

        expect(api.Get).toHaveBeenCalledTimes(1);
        expect(get_top100users).toHaveBeenCalledTimes(1);
        api.Get.mockClear();
    });

    it('should render ViewLeaderboard component with more than 3 users',async () => {
        const users = [ ...leaderboard_users, { userID: 3, username: "username3", xp: 300 }, { userID: 4, username: "username4", xp: 400 }];
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(users) });
        });

        const get_top100users = jest.fn().mockImplementation(async () => {
            const response = await api.Get('users/top_100');
            const data = await response.json();
            data.sort((a, b) => {
              if (a.xp === b.xp) {
                return a.username.localeCompare(b.username);
              }
              return 0;
            });
            return data;
        });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null; 
        var findByText = null; 
        
        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c, findByText:fbt} = render(<ViewLeaderboard getUsers={get_top100users} title={"title"} description={"description"} />, { wrapper: routerWrapper });
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c; 
            findByText = fbt; 
        });
            
        expect(getByText('You')).toBeInTheDocument(); 
        expect(getByText('username2')).toBeInTheDocument();
        expect(getByText('100 XP')).toBeInTheDocument();
        expect(getByText('200 XP')).toBeInTheDocument();
        expect(getByText('title')).toBeInTheDocument();
        expect(getByText('description')).toBeInTheDocument();
        expect(getByText('username3')).toBeInTheDocument();
        expect(getByText('300 XP')).toBeInTheDocument();
        expect(getByText('username4')).toBeInTheDocument();
        expect(getByText('400 XP')).toBeInTheDocument();
        expect(getByText('4.')).toBeInTheDocument();
        findByText('1.').then((result) => expect(result).toBe(null));

        expect(api.Get).toHaveBeenCalledTimes(1);
        expect(get_top100users).toHaveBeenCalledTimes(1);
       
     
        api.Get.mockClear();
    });

    it('should render ViewLeaderboard component with no users',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });

        const get_top100users = jest.fn().mockImplementation(async () => {
            const response = await api.Get('users/top_100');
            const data = await response.json();
            data.sort((a, b) => {
              if (a.xp === b.xp) {
                return a.username.localeCompare(b.username);
              }
              return 0;
            });
            return data;
        });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<ViewLeaderboard getUsers={get_top100users} title={"title"} description={"description"} />, { wrapper: routerWrapper });
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        expect(getByText('title')).toBeInTheDocument();
        expect(getByText('description')).toBeInTheDocument();

        expect(api.Get).toHaveBeenCalledTimes(1);
        expect(get_top100users).toHaveBeenCalledTimes(1);

        api.Get.mockClear();
    });

    it('should render users when logged in user is not in the top 100',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(leaderboard_users) });
        });

        const get_top100users = jest.fn().mockImplementation(async () => {
            const response = await api.Get('users/top_100');
            const data = await response.json();
            data.sort((a, b) => {
              if (a.xp === b.xp) {
                return a.username.localeCompare(b.username);
              }
              return 0;
            });
            return data;
        });

        AuthContext.useAuth.mockReturnValue({ user: { userID: 3, username: "username3" } });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;
        var queryByText = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c, queryByText:qbt } = render(<ViewLeaderboard getUsers={get_top100users} title={"title"} description={"description"} />, { wrapper: routerWrapper });
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
            queryByText = qbt;
        });

        //expect you to not be displayed
        expect(queryByText('You')).toBeNull();
        expect(getByText('username1')).toBeInTheDocument();
        expect(getByText('100 XP')).toBeInTheDocument();
        expect(getByText('200 XP')).toBeInTheDocument();
        expect(getByText('title')).toBeInTheDocument();
        expect(getByText('description')).toBeInTheDocument();

        expect(api.Get).toHaveBeenCalledTimes(1);
        expect(get_top100users).toHaveBeenCalledTimes(1);

        api.Get.mockClear();
    });

    it('clicing on a user should redirect to their profile',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(leaderboard_users) });
        });

        const get_top100users = jest.fn().mockImplementation(async () => {
            const response = await api.Get('users/top_100');
            const data = await response.json();
            data.sort((a, b) => {
              if (a.xp === b.xp) {
                return a.username.localeCompare(b.username);
              }
              return 0;
            });
            return data;
        });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;
        var queryByText = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c, queryByText:qbt } = render(<ViewLeaderboard getUsers={get_top100users} title={"title"} description={"description"} />, { wrapper: routerWrapper });
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
            queryByText = qbt;
        });

        const username2 = getByText('username2');

        await act(async () => {
            fireEvent.click(username2);
        });


        expect(api.Get).toHaveBeenCalledTimes(1);
        expect(get_top100users).toHaveBeenCalledTimes(1);

        api.Get.mockClear();
    });

});