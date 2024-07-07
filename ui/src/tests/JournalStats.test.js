//JEST Testing file for JournalStats component
import JournalStats from 'src/components/custom/JournalStats';
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

const journal = {
    journalID: 1,
    title: "title",
    description: "description",
    creationDate: new Date().toISOString(),
    isPrivate: false,
    Entries: [
        {
            entryID: 1,
            mood: "🙂",
            date: new Date(),
            image: "",
            isDraft: false,
            title: "title",
            content : {},

        }
    ]
}

describe('JournalStats component', () => {

    beforeAll(() => {
        //mocking the AuthContext to return a user
    });

    beforeEach(() => {
        //empty for now ...
        AuthContext.useAuth.mockImplementation(() => {
            return {
                user: {
                    uid: "1",
                }
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should render JournalStats component when private',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            var new_journal = {...journal};
            new_journal.isPrivate = true;
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(new_journal) });
        });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container } = render(<JournalStats journalID={1} />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
        });

        const [year,month,day] = journal.creationDate.slice(0,10).split("-");
        const creationDate = day + "/" + month + "/" + year;

        expect(getByText('title Stats')).toBeInTheDocument();
        expect(getByText('Most common mood: 🙂')).toBeInTheDocument();
        expect(getByText('Number of entries made: 1')).toBeInTheDocument();
        expect(getByText('Created Since: ' + creationDate)).toBeInTheDocument();
        expect(getByText('Private')).toBeInTheDocument();

        api.Get.mockClear();
    });

    it('should render JournalStats component when public',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(journal) });
        });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container } = render(<JournalStats journalID={1} />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
        });

        const [year,month,day] = journal.creationDate.slice(0,10).split("-");
        const creationDate = day + "/" + month + "/" + year;

        expect(getByText('title Stats')).toBeInTheDocument();
        expect(getByText('Most common mood: 🙂')).toBeInTheDocument();
        expect(getByText('Number of entries made: 1')).toBeInTheDocument();
        expect(getByText('Created Since: ' + creationDate)).toBeInTheDocument();
        expect(getByText('Public')).toBeInTheDocument();


        api.Get.mockClear();
    });

    it('should handle a response that is not okay', async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            return await Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
        });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container } = render(<JournalStats journalID={1} />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
        });

        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching journal:', new Error('Network response was not ok'));

        api.Get.mockClear();
    });

    it('should render JournalStats component with no entries',async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            const new_journal = {...journal};
            new_journal.Entries = [];
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(new_journal) });
        });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container } = render(<JournalStats journalID={1} />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
        });

        expect(getByText('title Stats')).toBeInTheDocument();
        expect(getByText('Most common mood: none')).toBeInTheDocument();
        expect(getByText('Number of entries made: 0')).toBeInTheDocument();

        api.Get.mockClear();
    });

    it('should render JournalStats component with multiple most common moods if it is a tie',async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            // URL IS : 'journals/get_journal' used by the JournalStats component
            var new_journal = {...journal};

            new_journal.Entries.push({
                entryID: 2,
                mood: "😢",
                date: new Date(),
                image: "",
                isDraft: false,
                title: "title",
                content : {},
            });
            return await Promise.resolve({ ok: true, json: () => Promise.resolve(new_journal) });
        });

        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container } = render(<JournalStats journalID={1} />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
        });

        const [year,month,day] = journal.creationDate.slice(0,10).split("-");
        const creationDate = day + "/" + month + "/" + year;
        expect(getByText('title Stats')).toBeInTheDocument();
        expect(getByText('Most common mood: 🙂 and 😢')).toBeInTheDocument();
        expect(getByText('Number of entries made: 2')).toBeInTheDocument();
        expect(getByText('Created Since: ' + creationDate)).toBeInTheDocument();

        api.Get.mockClear();
    });

});