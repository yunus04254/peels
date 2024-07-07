import { render } from '@testing-library/react';

import {expect, jest} from "@jest/globals";
import {initializeApp} from "firebase/app";
import firebaseConfig from '../firebase-config';
import SearchBar from "src/components/custom/search/SearchBar";
import { act } from 'react-dom/test-utils';

import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext';
import * as React from 'react';

initializeApp(firebaseConfig);

//mock resize observer
window.ResizeObserver = jest.fn().mockImplementation(() => {
    return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
    }
});

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

// Define test data
const user = { userID: 1 };
const journals = [
    { journalID: 1, title: "Journal 1", creationDate: new Date(), User: user[0] },
    { journalID: 2, title: "Journal 2", creationDate: new Date(), User: user[0] },
];
const entries = [
    { entryID: 1, title: "Entry 1 in journal 1", date: new Date(), journalId: 1 },
    { entryID: 2, title: "Entry 2 in journal 1", date: new Date(), journalId: 1 },
    { entryID: 3, title: "Entry 3 in journal 2", date: new Date(), journalId: 2 },
    { entryID: 4, title: "Entry 2 in journal 2", date: new Date(), journalId: 2 },
];

describe('SearchResults component', () => {
    beforeEach(() => {
        // Mock the return value of useAuth
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

        // Mock the implementation of Get function
        api.Get.mockImplementation(async (url, params, options) => {
            if (url === 'journals/get_user_journal') {
                return {
                    ok: true,
                    json: () => Promise.resolve(journals)
                };
            } else if (url === 'entries/find_entries') {
                return {
                    ok: true,
                    json: () => Promise.resolve(
                        entries.filter(entry => entry.journalId === params.journalID)
                    )
                };
            }
        });
    });

    afterEach(() => {
        // Clear all mocks after each test
        jest.clearAllMocks();
    });

    it("Should render SearchBar component", async () => {
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container } = render(<SearchBar/>);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
        });

        const searchButton = getByLabelText('search-button');

        expect(searchButton).toBeInTheDocument();
        expect(searchButton).toHaveAttribute('aria-label', 'search-button');
    });
});