import { render, fireEvent, queryByRole, screen } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { waitFor } from '@testing-library/dom';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext'; 
import * as React from 'react'; 
import { TemplateProvider } from 'src/context/TemplateContext';
import { BrowserRouter } from 'react-router-dom';
import TemplateCreate from 'src/components/custom/templates/TemplateCreate';
import {Dialog} from 'src/components/ui/dialog';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { BananaProvider } from 'src/context/BananaContext';

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

const templates = [
    {
        templateID: 1,
        name: "template 1",
        description: "templatecontent",
        content: "{\"ops\":[{\"insert\":\"findme\\n\"}]}",
        createdAt: "2022-01-01T00:00:00.000Z"
        
    },
];

const Test = (props) => {

    return <Dialog open={true}><TemplateCreate callback={props.callback} template={props.template} /></Dialog>
}
describe(TemplateCreate, () => {
    const routerWrapper = ({ children }) => <BrowserRouter><BananaProvider><TemplateProvider>{children}</TemplateProvider></BananaProvider></BrowserRouter>;


    beforeEach(() => {
        
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

        api.Get.mockImplementation(async (url) => {
            return { data: { templates: templates } };
        });

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders the template create page", async () => {
        const { getByText } = await act( async () => render(createPortal(<Test />, document.body), { wrapper: routerWrapper }));
        expect(getByText('Create a new template')).toBeInTheDocument();
        expect(getByText('Create a new template to use for your journal entries')).toBeInTheDocument();
        expect(getByText('Title')).toBeInTheDocument();
        expect(getByText('Description')).toBeInTheDocument();

    })

    it("renders the quill editor", async () => {
        const { getByText, getByTestId, container } = render(<Test />, { wrapper: routerWrapper });
        const quillInput = document.querySelector('.ql-editor');
        expect(quillInput).toBeInTheDocument();
    })

    it("submit with empty title", async () => {
        const { getByText, getByRole, queryByText } = render(<Test />, { wrapper: routerWrapper });
        await act( async () => fireEvent.click(getByText("Save changes")) );
        expect(getByText('Title is required')).toBeInTheDocument();

    })

    it("submit with title only", async () => {
        api.Post.mockImplementation(async (url) => {
            return {ok: true};
        });
        const callbackmethod = jest.fn();
        const { getByText, getByRole, getByTestId } = render(<Test callback={callbackmethod}/>, { wrapper: routerWrapper });
        await act( async () => {
            fireEvent.change(getByTestId("template-title-box"), { target: { value: "test title" } });
            fireEvent.click(getByText("Save changes"));
        });
        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(callbackmethod).toHaveBeenCalledTimes(1);
    })

    it("title should need more than 3 characters", async () => {
        const { getByText, getByRole, queryByText, getByTestId } = render(<Test />, { wrapper: routerWrapper });
        await act( async () => {
            fireEvent.change(getByTestId("template-title-box"), { target: { value: "te" } });
            fireEvent.click(getByText("Save changes"));
        });
        expect(getByText('Title must be at least 3 characters')).toBeInTheDocument();
        expect(api.Post).not.toBeCalled()

    })

    it("title should be under 18 characters", async () => {

        const { getByText, getByRole, queryByText, getByTestId } = render(<Test />, { wrapper: routerWrapper });
        await act( async () => {
            fireEvent.change(getByTestId("template-title-box"), { target: { value: "test title test title test title" } });
            fireEvent.click(getByText("Save changes"));
        });
        expect(getByText('Title must not be more than 18 characters')).toBeInTheDocument();
        expect(api.Post).not.toBeCalled()
    })

    it("description should be under 70 characters", async () => {
        const { getByText, getByRole, queryByText, getByTestId } = render(<Test />, { wrapper: routerWrapper });
        await act( async () => {
            fireEvent.change(getByTestId("template-desc-box"), { target: { value: "a".repeat(71) } });
            fireEvent.click(getByText("Save changes"));
        })
        expect(getByText('Description must be under 70 characters')).toBeInTheDocument();
        expect(api.Post).not.toBeCalled()
    })

    it("content should be under 1000 characters, or error toast", async () => {
        //Content is too long.

        api.Post.mockImplementation(async (url) => {
            return {ok: false, text: () => Promise.resolve("Content is too long.")};
        })
        const { getByText, getByRole, queryByText, getByTestId } = render(<Test />, { wrapper: routerWrapper });
        jest.spyOn(toast, 'error').mockImplementation(() => {});
        await act( async () => {
            fireEvent.change(getByTestId("template-title-box"), { target: { value: "title" } });
            document.querySelector(".ql-editor").innerHTML = "a".repeat(1001);
            fireEvent.click(getByText("Save changes"));
        })
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith("Template update failed!", {
            "description": "Content is too long."
        });
    })

    it("updating template loads", async()=>{
        const { getByText, getByRole, queryByText, getByTestId } = render(<Test template={templates[0]} />, { wrapper: routerWrapper });
        expect(document.querySelector(".ql-editor").innerHTML).toBe("<p>findme</p>")
    })

    it("updating template saves", async()=>{
        api.Post.mockImplementation(async (url, data) => {
            expect(data).toEqual({
                "content": "{\"ops\":[{\"insert\":\"findme\\n\"}]}",
                "description": "templatecontent",
                "id": 1,
                "name": "new title",
            })
            return {ok: true};
        });
        const callbackmethod = jest.fn();
        const { getByText, getByRole, getByTestId } = render(<Test template={templates[0]} callback={callbackmethod}/>, { wrapper: routerWrapper });
        await act( async () => {
            fireEvent.change(getByTestId("template-title-box"), { target: { value: "new title" } });
            fireEvent.click(getByText("Save changes"));
        });
        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(callbackmethod).toHaveBeenCalledTimes(1);
    })

    it("updating template fails shows sonner", async()=>{
        api.Post.mockImplementation(async (url, data) => {
            
            return {ok: false, text: () => Promise.resolve("error message")};
        });
        const callbackmethod = jest.fn();
        const { getByText, getByRole, getByTestId } = render(<Test template={templates[0]} callback={callbackmethod}/>, { wrapper: routerWrapper });
        await act( async () => {
            fireEvent.change(getByTestId("template-title-box"), { target: { value: "new title" } });
            fireEvent.click(getByText("Save changes"));
        });
        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith("Template update failed!", {
            "description": "error message"
        });
    })

    

})