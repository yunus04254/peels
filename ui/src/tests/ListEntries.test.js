//JEST Testing file for JournalStats component
import ListEntries from 'src/components/custom/entries/ListEntries';
import { render, fireEvent } from '@testing-library/react';
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

const entries = [
    {
        entryID: 1,
        mood: "🙂",
        date: new Date(),
        image: "",
        isDraft: false, 
        title: "title1",
        content : '{"ops":[{"insert":"entry 1 text\\n"}]}',
        Journal: {
            User: {
                userID: 1,
                username: "username1",
            }
        }
    },
    {
        entryID: 2,
        mood: "😡",
        date: new Date(),
        image: "",
        isDraft: false, 
        title: "title2",
        content : '{"ops":[{"insert":"entry 2 text\\n"}]}',
        Journal: {
            User: {
                userID: 1,
                username: "username2",
            }
        }
    },
    {
        entryID: 3,
        mood: "😭",
        date: new Date(),
        image: "",
        isDraft: false, 
        title: "title3",
        content : '{"ops":[{"insert":"entry 3 text\\n"}]}',
        Journal: {
            User: {
                userID: 1,
                username: "username3",
            }
        }
    }
]

describe('ListEntries component', () => {
    beforeEach(() => {
        
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });
    
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'bookmarks/check_bookmark' used by the Bookmarker component
            return Promise.resolve({ ok: true, json: () => Promise.resolve(entries) });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should render ListEntries component", async () => {

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container } = render(<ListEntries journalID={1} />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;

        });

        //check that get was called and with the right params
        expect(api.Get).toHaveBeenCalled();
        expect(api.Get).toHaveBeenCalledWith('entries/find_entries', {journalID: 1}, {user: {userID: 1}});

        expect(getByText('title1')).toBeInTheDocument();
        expect(getByText('🙂')).toBeInTheDocument();
        expect(getByText('title2')).toBeInTheDocument();
        expect(getByText('😡')).toBeInTheDocument();
        expect(getByText('title3')).toBeInTheDocument();
        expect(getByText('😭')).toBeInTheDocument();
        expect(getByText('entry 1 text')).toBeInTheDocument();
        expect(getByText('entry 2 text')).toBeInTheDocument();
        expect(getByText('entry 3 text')).toBeInTheDocument();

        
    });

    it("Should rerender when new entry is created", async () => {
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var rerender = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container, rerender:r } = render(<ListEntries entryCreated={{}} journalID={1} />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            rerender = r;
        });

        //check that get was called and with the right params
        expect(api.Get).toHaveBeenCalled();
        expect(api.Get).toHaveBeenCalledWith('entries/find_entries', {journalID: 1}, {user: {userID: 1}});
        

        expect(getByText('title1')).toBeInTheDocument();
        expect(getByText('🙂')).toBeInTheDocument();
        expect(getByText('title2')).toBeInTheDocument();
        expect(getByText('😡')).toBeInTheDocument();
        expect(getByText('title3')).toBeInTheDocument();
        expect(getByText('😭')).toBeInTheDocument();
        expect(getByText('entry 1 text')).toBeInTheDocument();
        expect(getByText('entry 2 text')).toBeInTheDocument();
        expect(getByText('entry 3 text')).toBeInTheDocument();

        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'bookmarks/check_bookmark' used by the Bookmarker component
            const new_entry = [{
                entryID: 4,
                mood: "😢",
                date: new Date(),
                image: "",
                isDraft: false, 
                title: "title4",
                content : '{"ops":[{"insert":"entry 4 text\\n"}]}',
                Journal: {
                    User: {
                        userID: 1,
                        username: "username4",
                    }
                }
            }];
            return Promise.resolve({ ok: true, json: () => Promise.resolve(new_entry) });
        });

        
        await act(async () => {
            rerender(<ListEntries journalID={1} entryCreated={{}}/>);
        });

        expect(getByText('title4')).toBeInTheDocument();
        expect(getByText('😢')).toBeInTheDocument();
        expect(getByText('entry 4 text')).toBeInTheDocument();
    });

    it("Should print error if response was not ok", async () => {
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;

        jest.spyOn(console, 'error').mockImplementation(() => {});

        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'bookmarks/check_bookmark' used by the Bookmarker component
            return Promise.resolve({ ok: false, json: () => Promise.resolve(entries) });
        });

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container } = render(<ListEntries journalID={1} />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
        });

        expect(console.error).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Failed to fetch entries');
    });

    it("Handles error with api call throwing an error", async () => {
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;

        jest.spyOn(console, 'error').mockImplementation(() => {});

        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'bookmarks/check_bookmark' used by the Bookmarker component
            throw new Error('error');
        });

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container } = render(<ListEntries journalID={1} />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
        });

        expect(console.error).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Api call failed to fetch entries');
    });
        
});