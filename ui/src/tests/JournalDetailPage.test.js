//JEST Testing file for JournalDetailPage

import JournalDetailPage from 'src/pages/JournalDetailPage';
import { render, fireEvent, waitFor, getByText } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { useParams } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import * as AuthContext from 'src/context/AuthContext';
import * as api from 'src/lib/api';
import * as PageContext from "src/context/PageContext";
import {toast} from 'sonner';


initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('sonner');
jest.mock('src/context/AuthContext');
jest.mock('src/context/PageContext');
jest.mock('src/components/custom/JournalView', () => {
    return function DummyJournalView() {
        return <div data-testid="JournalView">JournalView</div>;
    };
});

describe ('JournalDetailPage', () => {

    const routerWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;
    const OK_journal = () => {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                UserUserID: 1,
                isPrivate: false,
                journalID: 1,
                title: "Journal 1",

            })
        });
    }
    const OK_empty_friends = () => {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
        });
    }
    const OK_friends = () => {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
                {userID: 1},
                {userID: 2},
                {userID: 3},
            ])
        })
    }

    //User 1 owns Journal 1
    //User 1 is the logged in user


    beforeAll(() => {
    });

    beforeEach(() => {
        jest.spyOn(AuthContext, 'useAuth').mockReturnValue({user: {userID: 1}});

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should render JournalView when logged in user owns the journal", async () => {
        const get_api = jest.spyOn(api, 'Get').mockImplementation((url,query,context)=>{
            if (url === 'journals/get_journal'){
                return OK_journal();
            }
            else if (url === 'friends/list'){
                return OK_empty_friends();
            }
        });

        var getByText;
        var getByLabelText;
        var getByTestId;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByTestId:gbti } = render(<JournalDetailPage />);
            getByText = gbt;
            getByLabelText = gblt;
            getByTestId = gbti;
        });


        expect(get_api).toHaveBeenCalledTimes(2);
        expect(get_api).toHaveBeenCalledWith('journals/get_journal', {id: undefined}, {user: {userID: 1}});
        expect(get_api).toHaveBeenCalledWith('friends/list', null, {user: {userID: 1}});
        expect(getByTestId('JournalView')).toBeInTheDocument();

    });

    it("catches fail to fetch journal details", async () => {
        const get_api = jest.spyOn(api, 'Get').mockImplementation((url,query,context)=>{
            if (url === 'journals/get_journal'){
                return Promise.resolve({ok: false});
            }
        });

        jest.spyOn(console, 'error').mockImplementation(() => {});

        var getByText;

        await act(async () => {
            const { getByText:gbt } = render(<JournalDetailPage />);
            getByText = gbt;
        });

        expect(get_api).toHaveBeenCalledTimes(1);
        expect(get_api).toHaveBeenCalledWith('journals/get_journal', {id: undefined}, {user: {userID: 1}});
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith('Error fetching journal details:', expect.any(Error));
        expect(getByText('Loading...')).toBeInTheDocument();

        get_api.mockRestore();
    });

    it("should catch error when failing to fetch friends list", async () => {
        const get_api = jest.spyOn(api, 'Get').mockImplementation((url,query,context)=>{
            if (url === 'journals/get_journal'){
                return OK_journal();
            }
            else if (url === 'friends/list'){
                return Promise.resolve({ok: false});
            }
        });

        jest.spyOn(console, 'error').mockImplementation(() => {});

        var getByText;

        await act(async () => {
            const { getByText:gbt } = render(<JournalDetailPage />);
            getByText = gbt;
        });

        expect(get_api).toHaveBeenCalledTimes(2);
        expect(get_api).toHaveBeenCalledWith('journals/get_journal', {id: undefined}, {user: {userID: 1}});
        expect(get_api).toHaveBeenCalledWith('friends/list', null, {user: {userID: 1}});
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith('Error fetching journal details:', expect.any(Error));
    });

    it("should not render journalview if user does not own the journal and journal is private", async () => {
        const get_api = jest.spyOn(api, 'Get').mockImplementation((url,query,context)=>{
            if (url === 'journals/get_journal'){
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        UserUserID: 2,
                        isPrivate: true,
                        journalID: 1,
                        title: "Journal 1",
                    })
                });
            }
            else if (url === 'friends/list'){
                return OK_empty_friends();
            }
        });

        var getByText;

        await act(async () => {
            const { getByText:gbt } = render(<JournalDetailPage />, {wrapper: routerWrapper});
            getByText = gbt;
        });

        expect(get_api).toHaveBeenCalledTimes(2);
        expect(get_api).toHaveBeenCalledWith('journals/get_journal', {id: undefined}, {user: {userID: 1}});
        expect(get_api).toHaveBeenCalledWith('friends/list', null, {user: {userID: 1}});
        //expect redirect to home page
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith('Error', expect.any(Object));

    });

    it("should render journalview if user does not own the journal but journal is public and is friends", async () => {
        const get_api = jest.spyOn(api, 'Get').mockImplementation((url,query,context)=>{
            if (url === 'journals/get_journal'){
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        UserUserID: 2,
                        isPrivate: false,
                        journalID: 1,
                        title: "Journal 1",
                    })
                });
            }
            else if (url === 'friends/list'){
                return OK_friends();
            }
        });

        var getByText;

        await act(async () => {
            const { getByText:gbt } = render(<JournalDetailPage />, {wrapper: routerWrapper});
            getByText = gbt;
        });

        expect(get_api).toHaveBeenCalledTimes(2);
        expect(get_api).toHaveBeenCalledWith('journals/get_journal', {id: undefined}, {user: {userID: 1}});
        expect(get_api).toHaveBeenCalledWith('friends/list', null, {user: {userID: 1}});
        expect(getByText('JournalView')).toBeInTheDocument();
    });

    it("should not render journalview if user does not own the journal but journal is public and is not friends", async () => {
        const get_api = jest.spyOn(api, 'Get').mockImplementation((url,query,context)=>{
            if (url === 'journals/get_journal'){
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        UserUserID: 2,
                        isPrivate: false,
                        journalID: 1,
                        title: "Journal 1",
                    })
                });
            }
            else if (url === 'friends/list'){
                return OK_empty_friends();
            }
        });

        var getByText;

        await act(async () => {
            const { getByText:gbt } = render(<JournalDetailPage />, {wrapper: routerWrapper});
            getByText = gbt;
        });

        expect(get_api).toHaveBeenCalledTimes(2);
        expect(get_api).toHaveBeenCalledWith('journals/get_journal', {id: undefined}, {user: {userID: 1}});
        expect(get_api).toHaveBeenCalledWith('friends/list', null, {user: {userID: 1}});
        //expect redirect to home page
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith('Error', expect.any(Object));
    });

});