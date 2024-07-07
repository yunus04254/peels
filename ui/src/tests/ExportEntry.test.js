//JEST Testing file for ItemManager component with Export Entry functionality
import {ItemManager} from 'src/components/custom/ItemManager';
import { render, fireEvent } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { act } from 'react-dom/test-utils';
import * as React from 'react';
import * as helperExport from "src/lib/helpers-export";

global.URL = {
    createObjectURL: jest.fn()
};

initializeApp(firebaseConfig);

const entry =
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
    }
const currentEntry = document.createElement('div');

describe ('ItemManager component for exporting entry functionality', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call the export pdf function if it is valid entry data', async () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();

        const consoleErrorSpy = jest.spyOn(console, 'error');
        const mockGeneratePDF = jest.fn().mockResolvedValue({ save: jest.fn() });
        jest.spyOn(helperExport, 'generatePDF').mockImplementation(mockGeneratePDF);

        const { getByText, getByLabelText, getByRole, container } =
            render(<ItemManager onEdit={onEdit}
                                onDelete={onDelete}
                                currentEntry={currentEntry}
                                entryData={entry}
            />);

        const itemmanager = getByLabelText('itemmanager');
        await act(() => {
            fireEvent.click(itemmanager);
        });

        const itemmanagerExportPdf = getByLabelText('itemmanager-export-pdf');
        await act(() => {
            fireEvent.click(itemmanagerExportPdf);
        });

        // should not get any error
        expect(mockGeneratePDF).toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should call the export rtf function if it is valid entry data', async () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();

        const consoleErrorSpy = jest.spyOn(console, 'error');
        const mockGenerateEntryRtf = jest.fn().mockResolvedValue({ save: jest.fn() });
        jest.spyOn(helperExport, 'generateEntryRTF').mockImplementation(mockGenerateEntryRtf);

        const { getByText, getByLabelText, getByRole, container } =
            render(<ItemManager onEdit={onEdit}
                                onDelete={onDelete}
                                currentEntry={currentEntry}
                                entryData={entry}
            />);

        const itemmanager = getByLabelText('itemmanager');
        await act(() => {
            fireEvent.click(itemmanager);
        });

        const itemmanagerExportRtf = getByLabelText('itemmanager-export-rtf');
        await act(() => {
            fireEvent.click(itemmanagerExportRtf);
        });

        // should not get any error
        expect(mockGenerateEntryRtf).toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

});