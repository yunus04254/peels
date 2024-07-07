//JEST Testing file for EntryForm component
import EntryForm from 'src/components/custom/forms/EntryForm';
import { render, fireEvent } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { act } from 'react-dom/test-utils';
import * as AuthContext from 'src/context/AuthContext';
import * as BananaContext from 'src/context/BananaContext';
import * as React from 'react';
import * as api from 'src/lib/api';
import {toast} from 'sonner';
import * as firebase from 'firebase/storage';


initializeApp(firebaseConfig);

const validEmptyEntry = {
    title: "",
    content: "{}",
    mood: "🙂",
    isDraft: false,
    journalID: 1,
}

const validFilledEntry = {
    title: "My first entry",
    content: JSON.stringify({"ops":[{"insert":"abc123\n"}]}),
    mood: "😢",
    isDraft: false,
    journalID: 1,
    date: new Date(),
}

const journalList = [
    {
        journalID: 1,
        title: "Journal 1",
        creationDate: "2024-03-05 22:26:20.051 +00:00",
        isPrivate: false,
        UserUserID: 1,
    }
]

jest.mock('src/context/AuthContext');
jest.mock('src/lib/api');
jest.mock('sonner');
jest.mock('firebase/storage');
jest.mock('src/context/BananaContext');

describe(EntryForm, () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1, uid:333, level:1 } });
        BananaContext.useBanana.mockReturnValue({ bananas: 0, updateBananas: jest.fn() });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<EntryForm entry={validEmptyEntry}/>);
        render(<EntryForm entry={validFilledEntry}/>);
    });

    it('assert the state of the form when journal is known and entry is new', () => {
        const { getByText, getByLabelText, getByRole, container } = render(<EntryForm entry={validEmptyEntry}/>);
        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(titleInput.value).toBe('');
        expect(quillInput.innerHTML).toBe('<p><br></p>');
        expect(titleInput).toBeInTheDocument();
        expect(quillInput).toBeInTheDocument();

    });

    it('assert the state of the form when journal is known and entry is not new', () => {
        const { getByText, getByLabelText, getByRole, container } = render(<EntryForm action="update" entry={validFilledEntry}/>);
        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(titleInput.value).toBe('My first entry');
        expect(quillInput.innerHTML).toBe('<p>abc123</p>');
        expect(titleInput).toBeInTheDocument();
        expect(quillInput).toBeInTheDocument();
    });

    it('assert the state of the form when journal is not known', () => {
        const { getByText, getByLabelText, getByRole, container } = render(<EntryForm entry={validEmptyEntry} journalSelect={journalList}/>);
        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(titleInput.value).toBe('');
        expect(quillInput.innerHTML).toBe('<p><br></p>');
        expect(titleInput).toBeInTheDocument();
        expect(quillInput).toBeInTheDocument();
    });

    it('assert form prevents submission with empty title', () => {
        const { getByText, getByLabelText, getByRole, container } = render(<EntryForm entry={validEmptyEntry}
                                                                                        onEntryCreate={(e)=>{}}
                                                                                        afterSubmit={()=>{}}/>);
        const titleInput = getByLabelText("Title");
        const saveButton = getByRole("button", { name: "Save changes" });
        const quillInput = container.querySelector('.ql-editor');
        fireEvent.click(saveButton);
        expect(titleInput.value).toBe('');
        expect(quillInput.innerHTML).toBe('<p><br></p>');
        //check for warning message
        expect(getByText("Title is required")).toBeInTheDocument();

    });

    it("assert form raises create error if the response was not ok", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="create"
                                                                                        journalID={1}
                                                                                        onEntryCreate={onEntryCreate}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(quillInput.innerHTML).toBe('<p><br></p>');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My first entry' } });
        });

        expect(titleInput.value).toBe('My first entry');
        const saveButton = getByRole("button", { name: "Save changes" });

        api.Post.mockImplementation((url,data,params,options)=>{
            return Promise.resolve({ ok: false, json: () => Promise.resolve({})});
        });

        jest.spyOn(toast, 'success').mockImplementation(() => {});
        jest.spyOn(toast, 'error').mockImplementation(() => {});

        await act(() => {
            fireEvent.click(saveButton);
        });
        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith("Error", {
                                                "variant": "destructive",
                                                "className": "text-white",
                                                "description": "Failed to create entry..."});

    });

    it("assert form can create an entry", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="create"
                                                                                        journalID={1}
                                                                                        onEntryCreate={onEntryCreate}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(quillInput.innerHTML).toBe('<p><br></p>');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My first entry' } });
        });

        expect(titleInput.value).toBe('My first entry');
        const saveButton = getByRole("button", { name: "Save changes" });


        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const imageData = {
            file: file,
            fileType: 'png',
            name: 'chucknorris.png'
        }
        const input = container.querySelector('input[type="file"]');
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        fireEvent.change(input);

        expect(getByText("Image Selected: chucknorris.png")).toBeInTheDocument();

        api.Post.mockImplementation((url,data,params,options)=>{
            return Promise.resolve({ ok: true, json: () => Promise.resolve({xp:1})});
        });

        jest.spyOn(firebase, 'ref').mockImplementation(() => {});
        jest.spyOn(firebase, 'uploadBytes').mockImplementation(() => {});
        jest.spyOn(firebase, 'getDownloadURL').mockImplementation(() => {});

        await act(() => {
            fireEvent.click(saveButton);
        });

        expect(firebase.ref).toHaveBeenCalledTimes(1);
        expect(firebase.uploadBytes).toHaveBeenCalledTimes(1);
        expect(firebase.getDownloadURL).toHaveBeenCalledTimes(1);

        expect(api.Post).toHaveBeenCalledTimes(2);
        expect(toast.success).toHaveBeenCalledTimes(1);
        expect(toast.success).toHaveBeenCalledWith("Entry Created +1XP", {
                                                                "action" : {"label": "Okay!",
                                                                "onClick": expect.any(Function)},
                                                                "className": "background-white",
                                                                "description": "Keep up the good work! +1 Bananas!"});

    });

    it("assert form can handle no file select", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="create"
                                                                                        journalID={1}
                                                                                        onEntryCreate={onEntryCreate}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(quillInput.innerHTML).toBe('<p><br></p>');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My first entry' } });
        });

        expect(titleInput.value).toBe('My first entry');
        const saveButton = getByRole("button", { name: "Save changes" });

        const file = null;
        const input = container.querySelector('input[type="file"]');
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        fireEvent.change(input);

        expect(getByText("No Image Selected")).toBeInTheDocument();
    });

    it("assert form rejects invalid file format", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="create"
                                                                                        journalID={1}
                                                                                        onEntryCreate={onEntryCreate}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My first entry' } });
        });

        const saveButton = getByRole("button", { name: "Save changes" });
        // Create a Blob with the desired content and type
        const blob = new Blob(['(⌐□_□)'], { type: 'image/gif' });
        // Create a File object from the Blob with the desired filename
        const file = new File([blob], 'chucknorris.gif', { type: 'image/gif' });
        const input = container.querySelector('input[type="file"]');

        Object.defineProperty(input, 'files', {
            value: [file]
        });
        fireEvent.change(input);

        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith("Error", {
            "variant": "destructive",
            "className": "text-white",
            "description": "Unsupported file type. Please choose an image file (JPEG, JPG, PNG, or WEBP)."
        });

    });

    it("form prevents images with file size over 1mb", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="create"
                                                                                        journalID={1}
                                                                                        onEntryCreate={onEntryCreate}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My first entry' } });
        });

        expect(titleInput.value).toBe('My first entry');
        const saveButton = getByRole("button", { name: "Save changes" });

        const desiredFileSize = 1024 * 1024 * 2; // 2 MB

        // Create a Uint8Array filled with zeros to simulate the file contents
        const buffer = new ArrayBuffer(desiredFileSize);
        const uint8Array = new Uint8Array(buffer);
        uint8Array.fill(0);

        // Create a Blob from the Uint8Array
        const blob = new Blob([uint8Array], { type: 'image/png' });

        // Create a File object from the Blob
        const file = new File([blob], 'chucknorris.png', { type: 'image/png' });
        const input = container.querySelector('input[type="file"]');
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        fireEvent.change(input);

        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith("Error", {
            "variant": "destructive",
            "className": "text-white",
            "description": "File size is too large, please choose a smaller file less than 1MB."
        });

    });

    it("assert form allows larger file size and video if they have enough bananas", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;
        AuthContext.useAuth.mockReturnValue({ user: { userID : 1, uid:333, bananas: 1000 } });

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="create"
                                                                                        journalID={1}
                                                                                        onEntryCreate={onEntryCreate}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(quillInput.innerHTML).toBe('<p><br></p>');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My first entry' } });
        });

        expect(titleInput.value).toBe('My first entry');
        const saveButton = getByRole("button", { name: "Save changes" });
        const file = new File(['(⌐□_□)'], 'chucknorris.mp4', { type: 'video/mp4' });

        const input = container.querySelector('input[type="file"]');
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        fireEvent.change(input);

        api.Post.mockImplementation((url,data,params,options)=>{
            if (url.includes("create")){
                return Promise.resolve({ ok: true, json: () => Promise.resolve({xp:1})});
            } else if (url.includes("updateBananas")){
                return Promise.resolve({ ok: true, json: () => Promise.resolve({})});
            }

        });

        jest.spyOn(firebase, 'ref').mockImplementation(() => {});
        jest.spyOn(firebase, 'uploadBytes').mockImplementation(() => {});
        jest.spyOn(firebase, 'getDownloadURL').mockImplementation(() => {});

        await act(() => {
            fireEvent.click(saveButton);
        });

        expect(firebase.ref).toHaveBeenCalledTimes(1);
        expect(firebase.uploadBytes).toHaveBeenCalledTimes(1);
        expect(firebase.getDownloadURL).toHaveBeenCalledTimes(1);
        expect(api.Post).toHaveBeenCalledTimes(3);
        expect(api.Post).toHaveBeenCalledWith('users/updateBananas', {bananas: -50}, null, { user: { userID: 1, uid:333, bananas: 1000}});
        expect(toast.success).toHaveBeenCalledTimes(1);
        expect(toast.success).toHaveBeenCalledWith("Entry Created +1XP", {
                                                        "action": {
                                                            "label": "Okay!",
                                                            "onClick": expect.any(Function),
                                                        },
                                                        "className": "background-white",
                                                        "description": "You have spent 50 bananas!",
                                                    });

    });


    it("assert form catches create error if the api call threw an error", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="create"
                                                                                        journalID={1}
                                                                                        onEntryCreate={onEntryCreate}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(quillInput.innerHTML).toBe('<p><br></p>');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My first entry' } });
        });

        expect(titleInput.value).toBe('My first entry');
        const saveButton = getByRole("button", { name: "Save changes" });

        api.Post.mockImplementation((url,data,params,options)=>{
            throw new Error("API call failed");
        });

        await act(() => {
            fireEvent.click(saveButton);
        });
        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith("Error", {
                                                "variant": "destructive",
                                                "className": "text-white",
                                                "description": "Failed to create entry..."});
        expect(console.error).toHaveBeenCalledWith("Error creating entry:", new Error("API call failed"));

    });

    it("assert form can update an entry", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="update"
                                                                                        entry={validFilledEntry}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(titleInput.value).toBe('My first entry');
        expect(quillInput.innerHTML).toBe('<p>abc123</p>');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My updated entry' } });
        });

        expect(titleInput.value).toBe('My updated entry');
        const saveButton = getByRole("button", { name: "Save changes" });

        api.Post.mockImplementation((url,data,params,options)=>{
            if (url.includes("update")){
                return Promise.resolve({ ok: true, json: () => Promise.resolve({xp:1})});
            } else if (url.includes("updateBananas")){
                return Promise.resolve({ ok: true, json: () => Promise.resolve({})});
            }
        });

        await act(() => {
            fireEvent.click(saveButton);
        });

        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(toast.success).toHaveBeenCalledTimes(1);
        expect(toast.success).toHaveBeenCalledWith("Entry Updated +1XP", {
                                                "action" : {"label": "Okay!",
                                                "onClick": expect.any(Function)},
                                                "className": "background-white",
                                                "description": "Keep up the good work!"});

    });

    it("assert form raises update error if the response was not ok", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="update"
                                                                                        entry={validFilledEntry}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(titleInput.value).toBe('My first entry');
        expect(quillInput.innerHTML).toBe('<p>abc123</p>');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My updated entry' } });
        });

        expect(titleInput.value).toBe('My updated entry');
        const saveButton = getByRole("button", { name: "Save changes" });

        api.Post.mockImplementation((url,data,params,options)=>{
            return Promise.resolve({ ok: false, json: () => Promise.resolve({})});
        });

        jest.spyOn(toast, 'success').mockImplementation(() => {});
        jest.spyOn(toast, 'error').mockImplementation(() => {});

        await act(() => {
            fireEvent.click(saveButton);
        });
        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith("Error", {
                                                "variant": "destructive",
                                                "className": "text-white",
                                                "description": "Failed to update entry..."});

    });

    it("assert form catches update error if the api call threw an error", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="update"
                                                                                        entry={validFilledEntry}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(titleInput.value).toBe('My first entry');
        expect(quillInput.innerHTML).toBe('<p>abc123</p>');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My updated entry' } });
        });

        expect(titleInput.value).toBe('My updated entry');
        const saveButton = getByRole("button", { name: "Save changes" });

        api.Post.mockImplementation((url,data,params,options)=>{
            throw new Error("API call failed");
        });

        jest.spyOn(toast, 'success').mockImplementation(() => {});
        jest.spyOn(toast, 'error').mockImplementation(() => {});

        await act(() => {
            fireEvent.click(saveButton);
        });
        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith("Error", {
                                                "variant": "destructive",
                                                "className": "text-white",
                                                "description": "Failed to update entry..."});
        expect(console.error).toHaveBeenCalledWith("Error updating entry:", new Error("API call failed"));

    });

    it("assert form can update an entry to another file", async () => {
        const onEntryCreate = jest.fn().mockImplementation((e)=>{});
        var getByText = null;
        var getByLabelText = null;
        var getByRole = null;
        var container = null;

        const validFilledEntry = {
            title: "My first entry",
            content: JSON.stringify({"ops":[{"insert":"abc123\n"}]}),
            mood: "😢",
            path: "pathtoanimage",
            isDraft: false,
            journalID: 1,
            date: new Date(),
        }

        await act(()=>{
            const { getByText:gbt, getByLabelText:gblt, getByRole:gbr, container:c } = render(<EntryForm action="update"
                                                                                        entry={validFilledEntry}
                                                                                        />);
            getByText = gbt;
            getByLabelText = gblt;
            getByRole = gbr;
            container = c;
        });

        const titleInput = getByLabelText("Title");
        const quillInput = container.querySelector('.ql-editor');
        expect(titleInput.value).toBe('My first entry');
        expect(quillInput.innerHTML).toBe('<p>abc123</p>');

        await act(()=>{
        //input a title
            fireEvent.change(titleInput, { target: { value: 'My updated entry' } });
        });

        expect(titleInput.value).toBe('My updated entry');
        const saveButton = getByRole("button", { name: "Save changes" });

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const input = container.querySelector('input[type="file"]');
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        fireEvent.change(input);

        api.Post.mockImplementation((url,data,params,options)=>{
            if (url.includes("update")){
                return Promise.resolve({ ok: true, json: () => Promise.resolve({xp:1})});
            } else if (url.includes("updateBananas")){
                return Promise.resolve({ ok: true, json: () => Promise.resolve({})});
            }
        });

        jest.spyOn(firebase, 'ref').mockImplementation(() => {});
        jest.spyOn(firebase, 'uploadBytes').mockImplementation(() => {});
        jest.spyOn(firebase, 'getDownloadURL').mockImplementation(() => {});
        jest.spyOn(firebase, 'deleteObject').mockImplementation(() => {});

        await act(() => {
            fireEvent.click(saveButton);
        });

        expect(firebase.ref).toHaveBeenCalledTimes(2);
        expect(firebase.uploadBytes).toHaveBeenCalledTimes(1);
        expect(firebase.getDownloadURL).toHaveBeenCalledTimes(1);
        expect(firebase.deleteObject).toHaveBeenCalledTimes(1);

        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(toast.success).toHaveBeenCalledTimes(1);
        expect(toast.success).toHaveBeenCalledWith("Entry Updated +1XP", {
                                                "action" : {"label": "Okay!",
                                                "onClick": expect.any(Function)},
                                                "className": "background-white",
                                                "description": "Keep up the good work!"});

    });

});