//JEST Testing file for ItemManager component
import {ItemManager} from 'src/components/custom/ItemManager';
import { render, fireEvent } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { act } from 'react-dom/test-utils';
import * as React from 'react';

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

describe ('ItemManager component', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();
        const { getByText, getByLabelText, getByRole, container } = render(<ItemManager onEdit={onEdit} onDelete={onDelete}/>);
        expect(container).toBeTruthy();
        expect(getByLabelText('itemmanager')).toBeInTheDocument();
        const itemmanager = getByLabelText('itemmanager');
        expect(itemmanager).toHaveAttribute('aria-label', 'itemmanager');
        expect(itemmanager).toHaveAttribute('aria-expanded', 'false');
        expect(itemmanager).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('should open the dropdown menu', async () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();
        const { getByText, getByLabelText, getByRole, container } = render(<ItemManager onEdit={onEdit} onDelete={onDelete}/>);
        const itemmanager = getByLabelText('itemmanager');
        await act(() => {
            fireEvent.click(itemmanager);
        });

        expect(itemmanager).toHaveAttribute('aria-expanded', 'true');
        expect(itemmanager).toHaveAttribute('variant', 'ghost');
        expect(getByRole('menu')).toBeInTheDocument();
        expect(getByText('Edit')).toBeInTheDocument();
        expect(getByText('Delete')).toBeInTheDocument();
        expect(getByLabelText('itemmanager-edit')).toBeInTheDocument();
        expect(getByLabelText('itemmanager-delete')).toBeInTheDocument();

    });

    it('should render the export rtf/pdf buttons if it is an entry', async () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();
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

        expect(itemmanager).toHaveAttribute('aria-expanded', 'true');
        expect(itemmanager).toHaveAttribute('variant', 'ghost');
        expect(getByRole('menu')).toBeInTheDocument();

        expect(getByLabelText('itemmanager-export-pdf')).toBeInTheDocument();
        expect(getByLabelText('itemmanager-export-rtf')).toBeInTheDocument();
    });

    it('should call the onEdit function', async () => {
        const test_edit = jest.fn();
        test_edit.mockImplementation(() => {});
        const { getByText, getByLabelText, getByRole, container } = render(<ItemManager onEdit={test_edit} onDelete={()=>{}}/>);
        const itemmanager = getByLabelText('itemmanager');
        await act(() => {
            fireEvent.click(itemmanager);
        });
        const edit = getByLabelText('itemmanager-edit');
        await act(() => {
            fireEvent.click(edit);
        });
        expect(test_edit).toHaveBeenCalledTimes(1);
    });

    it('should call the onDelete function', async () => {
        const test_delete = jest.fn();
        test_delete.mockImplementation(() => {});
        const { getByText, getByLabelText, getByRole, container } = render(<ItemManager onEdit={()=>{}} onDelete={test_delete}/>);
        const itemmanager = getByLabelText('itemmanager');
        jest.spyOn(React, 'useState');
        await act(() => {
            fireEvent.click(itemmanager);
        });
        const del = getByLabelText('itemmanager-delete');
        await act(() => {
            fireEvent.click(del);
        });
        expect(test_delete).toHaveBeenCalledTimes(1);
        //assert that setOpen was called with true
        expect(React.useState).toHaveBeenCalledWith(false);
    });

});