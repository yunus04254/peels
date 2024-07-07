//JEST Testing file for UpdateEntry component
import UpdateEntry from 'src/components/custom/entries/UpdateEntry';
import { render, fireEvent, getByText, waitFor } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { act } from 'react-dom/test-utils';
import * as AuthContext from 'src/context/AuthContext';
import * as BananaContext from 'src/context/BananaContext';
import * as React from 'react';
import * as api from 'src/lib/api';

initializeApp(firebaseConfig);

const validFilledEntry = {
    title: "My first entry",
    content: JSON.stringify({"ops":[{"insert":"amazingtest\n"}]}),
    mood: "😢",
    isDraft: false,
    journalID: 1,
}

jest.mock('src/context/AuthContext');
jest.mock('src/context/BananaContext');
jest.mock('src/lib/api');

describe(UpdateEntry, () => {

    beforeEach(() => {
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });
        BananaContext.useBanana.mockReturnValue({ bananas: 0, updateBananas: jest.fn() });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        const onEntryCreate = jest.fn();
        render(<UpdateEntry entryClicked={validFilledEntry} onEntryCreate={onEntryCreate}/>);
        onEntryCreate.mockClear();
    });

    it('assert the state of the update form and dialog when given an entry to update', () => {
        const onEntryCreate = jest.fn();
        const { getByText, getByLabelText, getByRole, container } = render(<UpdateEntry entryClicked={validFilledEntry} onEntryCreate={onEntryCreate}/>);
        expect(getByText("Update Entry!")).toBeInTheDocument();
        expect(getByText("Write your amazing thoughts here!")).toBeInTheDocument();
        expect(getByRole("button", {name: "😢"})).toBeInTheDocument();
        const titleInput = getByLabelText("Title");
        expect(titleInput.value).toBe("My first entry");
        //get the quill
        const quillInput = document.querySelector('.ql-editor');
        expect(titleInput.value).toBe('My first entry');
        expect(quillInput.innerHTML).toBe('<p>amazingtest</p>');
        onEntryCreate.mockClear();
    });

    it("assert on entry create is called when the form is submitted", async () => {
        const onEntryCreate = jest.fn().mockImplementation((entry) => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const { getByText, getByLabelText, getByRole, containe, findAllByText } = render(<UpdateEntry entryClicked={validFilledEntry} onEntryCreate={onEntryCreate}/>);
        expect(getByText("Update Entry!")).toBeInTheDocument();
        expect(getByText("Write your amazing thoughts here!")).toBeInTheDocument();
        expect(getByRole("button", {name: "😢"})).toBeInTheDocument();
        const titleInput = getByLabelText("Title");
        expect(titleInput.value).toBe("My first entry");
        //get the quill
        const quillInput = document.querySelector('.ql-editor');
        expect(titleInput.value).toBe('My first entry');
        expect(quillInput.innerHTML).toBe('<p>amazingtest</p>');
        //submit the form
        api.Post.mockImplementation((url,data,params,options)=>{
            return Promise.resolve({ ok: true, json: () => Promise.resolve({})});
        });
        act(() => {
            fireEvent.click(getByRole("button", {name: "Save changes"}));
        });

        await waitFor(()=>{expect(onEntryCreate).toHaveBeenCalledTimes(1)});

        //check that the dialog is closed
        findAllByText("Update Entry!").then(()=>{throw new Error("Dialog Not Closed")}).catch();

        onEntryCreate.mockClear();
    });


    it('assert you can close the dialog', () => {
        const onEntryCreate = jest.fn();
        const { getByText, getByLabelText, getByRole,findByRole, container } = render(<UpdateEntry entryClicked={validFilledEntry} onEntryCreate={onEntryCreate}/>);
        expect(getByText("Update Entry!")).toBeInTheDocument();
        expect(getByText("Write your amazing thoughts here!")).toBeInTheDocument();
        expect(getByRole("button", {name: "😢"})).toBeInTheDocument();
        const titleInput = getByLabelText("Title");
        expect(titleInput.value).toBe("My first entry");
        //get the quill
        const quillInput = document.querySelector('.ql-editor');
        expect(titleInput.value).toBe('My first entry');
        expect(quillInput.innerHTML).toBe('<p>amazingtest</p>');
        //close the dialog
        fireEvent.click(getByRole("button", {name: "Close"}));
        findByRole("button").then(()=>{throw new Error("Dialog Not Closed")}).catch();
        onEntryCreate.mockClear();
    });

    it('check that the use effect runs whenever a entryClicked prop is passed', () => {
        const onEntryCreate = jest.fn();
        //spy on use effect
        jest.spyOn(React, 'useEffect');
        const setState = jest.fn();
        const spystate = jest.spyOn(React, 'useState');
        spystate.mockImplementation((init)=>[init, setState]);
        const { rerender } = render(<UpdateEntry entryClicked={validFilledEntry} onEntryCreate={onEntryCreate}/>);
        rerender(<UpdateEntry entryClicked={validFilledEntry} onEntryCreate={onEntryCreate}/>);
        expect(onEntryCreate).toHaveBeenCalledTimes(0);
        expect(React.useEffect).toHaveBeenCalled();
        expect(React.useState).toHaveBeenCalled();
        expect(React.useState).toHaveBeenCalledWith(false);
        expect(React.useState).toHaveBeenCalledWith({});
        expect(React.useState).toHaveBeenCalledWith('🙂');
        expect(setState).toHaveBeenCalledWith("😢");
        expect(setState).toHaveBeenCalledWith(true);
        expect(setState).toHaveBeenCalledWith(validFilledEntry);
        onEntryCreate.mockClear();
        spystate.mockRestore();
    });

});