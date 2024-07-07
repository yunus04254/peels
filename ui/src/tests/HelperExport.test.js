//JEST Testing file for HelperExport file
import { generateEntryRTF, generateJournalRTF} from 'src/lib/helpers-export';
import {initializeApp} from "firebase/app";
import firebaseConfig from "src/firebase-config";
import {jest} from "@jest/globals";

import * as AuthContext from 'src/context/AuthContext';
import * as React from 'react';

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

const journal = {
    journalID: 1,
    journalTitle: "Full Journal",
    user: { userID: 1 }
};

const entries = [
    {
        entryID: 1,
        title: "Empty Entry",
        date: new Date(),
        content:"{}",
        Journal: {
            User: {
                userID: 1,
                username: "username1",
            }
        }
    },
    {
        entryID: 2,
        title: "Entry with content in one line",
        date: new Date(),
        content : '{"ops":[{"insert":"entry 1 text\\n"}]}',
        Journal: {
            User: {
                userID: 1,
                username: "username1",
            }
        }
    },
    {
        entryID: 3,
        title: "Entry with multiline content",
        date: new Date(),
        content : '{"ops":[{"insert":"line 1 text\\n line 2 text line 2 text \\n line 3 text"}]}',
        Journal: {
            User: {
                userID: 1,
                username: "username1",
            }
        }
    }
];

describe('HelperExport file', () => {
    beforeEach(() => {
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });   // login the user
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Should generate RTF for empty entry', async () => {
        const entry = entries[0];
        const blob = await generateEntryRTF(entry);
        const expectedContent = `{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang1033\par \b ${entry.title}\b0}`;
        const expectedBlob = new Blob([expectedContent], {type: 'application/rtf'});

        await expect(blob).toEqual(expectedBlob);
    });

    test('Should generate RTF for entry with content in one line', async () => {
        const entry = entries[1];
        const blob = await generateEntryRTF(entry);
        const expectedContent = `{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang1033\par \b ${entry.title}\b0\par entry 1 text\line}`;
        const expectedBlob = new Blob([expectedContent], {type: 'application/rtf'});

        await expect(blob).toEqual(expectedBlob);
    });

    test('Should generate RTF for entry with multiline content', async () => {
        const entry = entries[2];
        const blob = await generateEntryRTF(entry);
        const expectedContent = `{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang1033\par \b ${entry.title}\b0\par line 1 text\line line 2 text line 2 text \ line 3 text\line}`;
        const expectedBlob = new Blob([expectedContent], {type: 'application/rtf'});

        await expect(blob).toEqual(expectedBlob);
    });

    test('Should generate RTF for journal without entries', async () => {
        const journal = {
            journalID: 2,
            journalTitle: "Empty Journal",
            user: { userID: 1 }
        };
        const blob = await generateJournalRTF(journal.journalID, journal.journalTitle, journal.user);

        const expectedContent = `{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang1033\b ${journal.journalTitle}\b0\line\line}`;
        const expectedBlob = new Blob([expectedContent], {type: 'application/rtf'});

        await expect(blob).toEqual(expectedBlob);
    });

    test('Should generate RTF for journal with all entries', async () => {
        const blob = await generateJournalRTF(journal.journalID, journal.journalTitle, journal.user);
        let expectedContent = "{\rtf1ansiansicpg1252deff0\nouicompatdeflang1033\b Full Journal\b0lineline}\\par \\b Empty Entry\\b0\\par \\line\\par \\b Entry with content in one line\\b0\\par \\line\\par \\b Entry with multiline content\\b0\\par \\line"
        const expectedBlob = new Blob([expectedContent], {type: 'application/rtf'});

        await expect(blob).toEqual(expectedBlob);
    });
});