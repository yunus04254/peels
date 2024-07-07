//JEST Testing file for Entry export section and button components
import {render, fireEvent } from '@testing-library/react';

import {expect, jest} from "@jest/globals";
import {initializeApp} from "firebase/app";
import firebaseConfig from '../firebase-config';
import ExportPageSection from "src/components/custom/export/ExportPageSection";
import ExportPageButton from "src/components/custom/export/ExportPageButton";
import { act } from 'react-dom/test-utils';

import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext';
import * as React from 'react';
import * as helperExport from "src/lib/helpers-export";

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

global.URL = {
    createObjectURL: jest.fn()
};

// Define test data
const user = {
    userID: 1,
    username: "username",
    email: "test@test.com"
};
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
const createRefWithCurrent = () => ({
    current: document.createElement('div')
});
const currentPage = createRefWithCurrent();


describe('ExportPage component', () => {
    beforeEach(() => {
        // Mock the return value of useAuth
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

        // Mock the implementation of Get function
        api.Get.mockImplementation(async (url, params ) => {
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

    it("Should render ExportPageSection component", async () => {
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;

        await act(async () => {
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr} =
                render(<ExportPageSection/>);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
        });

        // check that get was called and with the right params
        expect(getByText('Export Page')).toBeInTheDocument();
        expect(getByText('Export your page into PDF or RTF files.')).toBeInTheDocument();
    });

    it("Should render ExportPageButton component", async () => {
        const { getByLabelText } = render(<ExportPageButton/>);

        // check that get was called and with the right params
        const exportButton = getByLabelText('export-button');
        expect(exportButton).toBeInTheDocument();
        expect(exportButton).toHaveAttribute('aria-label', 'export-button');
        expect(exportButton).toHaveAttribute('aria-expanded', 'false');
    });

    it("Should be able to expand the dialog", async () => {
        const { getByText, getByLabelText } = render(<ExportPageButton/>);

        // check that get was called and with the right params
        const exportButton = getByLabelText('export-button');
        await act(() => {
            fireEvent.click(exportButton);
        });

        expect(exportButton).toHaveAttribute('aria-expanded', 'true');

        expect(getByText('Select a format to export')).toBeInTheDocument();
        expect(getByLabelText('export-pdf')).toBeInTheDocument();
        expect(getByLabelText('export-rtf')).toBeInTheDocument();
    });

    it("Should generatePDF without error if clicking the button with data", async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');
        const mockGeneratePDF = jest.fn().mockResolvedValue({ save: jest.fn() });
        jest.spyOn(helperExport, 'generatePDF').mockImplementation(mockGeneratePDF);

        const { getByLabelText } =
            render(<ExportPageButton
                currentPage={currentPage}
                currentJournal={journals[0]}
                journalID={journals[0].journalID}
                journalTitle={journals[0].title}
            />);

        // click the button will show the dropdown menu
        const exportButton = getByLabelText('export-button');
        await act(() => {
            fireEvent.click(exportButton);
        });

        await act(() => {
            fireEvent.click(getByLabelText('export-pdf'));
        });

        // should not get any error
        expect(mockGeneratePDF).toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("Should not generatePDF if clicking the button with no data", async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');
        const mockGeneratePDF = jest.fn().mockResolvedValue({ save: jest.fn() });
        jest.spyOn(helperExport, 'generatePDF').mockImplementation(mockGeneratePDF);

        const { getByLabelText } =
            render(<ExportPageButton/>);

        // click the button will show the dropdown menu
        const exportButton = getByLabelText('export-button');
        await act(() => {
            fireEvent.click(exportButton);
        });

        await act(() => {
            fireEvent.click(getByLabelText('export-pdf'));
        });

        // should get error
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("Should generateRTF without error if clicking the button with data", async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');
        const mockGenerateJournalRTF = jest.fn().mockResolvedValue({ save: jest.fn() });
        jest.spyOn(helperExport, 'generateJournalRTF').mockImplementation(mockGenerateJournalRTF);

        const { getByLabelText } =
            render(<ExportPageButton
                currentPage={currentPage}
                currentJournal={journals[0]}
                journalID={journals[0].journalID}
                journalTitle={journals[0].title}
            />);

        // click the button will show the dropdown menu
        const exportButton = getByLabelText('export-button');
        await act(() => {
            fireEvent.click(exportButton);
        });

        await act(() => {
            fireEvent.click(getByLabelText('export-rtf'));
        });

        // should not get any error
        expect(mockGenerateJournalRTF).toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("Should not generateRTF if clicking the button with no data", async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');
        const mockGenerateJournalRTF = jest.fn().mockResolvedValue({ save: jest.fn() });
        jest.spyOn(helperExport, 'generateJournalRTF').mockImplementation(mockGenerateJournalRTF);

        const { getByLabelText } =
            render(<ExportPageButton/>);

        // click the button will show the dropdown menu
        const exportButton = getByLabelText('export-button');
        await act(() => {
            fireEvent.click(exportButton);
        });

        await act(() => {
            fireEvent.click(getByLabelText('export-rtf'));
        });

        // should get error
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});