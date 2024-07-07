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
import EntryPreview from 'src/components/custom/entries/EntryPreview';

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

const templates = [
    {
        templateID: 1,
        name: "template 1",
        description: "templatecontent",
        content: "{\"ops\":[{\"insert\":\"findme\\n\"}]}",
        createdAt: "2022-01-01T00:00:00.000Z",
        UserUserID: 1
    },
    {
        templateID: 2,
        name: "template 2",
        description: "templatecontent",
        content: "{\"ops\":[{\"insert\":\"findme\\n\"}]}",
        createdAt: "2022-01-01T00:00:00.000Z",
    },
];


describe(EntryPreview, () => {
    const routerWrapper = ({ children }) => <BrowserRouter><TemplateProvider>{children}</TemplateProvider></BrowserRouter>;


    beforeEach(() => {
        
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

        api.Get.mockImplementation(async (url) => {
            return { data: { templates: templates } };
        });

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders entry preview button", async () => {
        const { getByText, getByLabelText } = await act( async () => render(<EntryPreview desktop={true} user={AuthContext.useAuth().user} data={templates[0]} />, { wrapper: routerWrapper }));
        expect(getByText('template 1')).toBeInTheDocument();
        expect(getByText('templatecontent')).toBeInTheDocument();
        expect(getByText('templatecontent')).toBeVisible();
        expect(getByLabelText('itemmanager')).toBeInTheDocument();
        const itemmanager = getByLabelText('itemmanager');
        expect(itemmanager).toHaveAttribute('aria-label', 'itemmanager');
        expect(itemmanager).toHaveAttribute('aria-expanded', 'false');
        expect(itemmanager).toHaveAttribute('aria-haspopup', 'menu');
    })

    it("renders entry preview button - mobile (no description)", async () => {
        const { getByText, getByLabelText } = await act( async () => render(<EntryPreview desktop={false} user={AuthContext.useAuth().user} data={templates[0]}/>, { wrapper: routerWrapper }));
        expect(getByText('template 1')).toBeInTheDocument();
        expect(()=>getByText('templatecontent')).toThrow();
        expect(getByLabelText('itemmanager')).toBeInTheDocument();
        const itemmanager = getByLabelText('itemmanager');
        expect(itemmanager).toHaveAttribute('aria-label', 'itemmanager');
        expect(itemmanager).toHaveAttribute('aria-expanded', 'false');
        expect(itemmanager).toHaveAttribute('aria-haspopup', 'menu');
    })

    it("renders unauthorised entry preview button", async () => {
        const { getByText, getByLabelText } = await act( async () => render(<EntryPreview desktop={true} user={AuthContext.useAuth().user} data={templates[1]}/>, { wrapper: routerWrapper }));
        expect(getByText('template 2')).toBeInTheDocument();
        expect(()=>getByLabelText('itemmanager')).toThrow()
    })

    it("renders unauthorised entry preview button (mobile)", async () => {
        const { getByText, getByLabelText } = await act( async () => render(<EntryPreview desktop={false} user={AuthContext.useAuth().user} data={templates[1]}/>, { wrapper: routerWrapper }));
        expect(getByText('template 2')).toBeInTheDocument();
        expect(()=>getByLabelText('itemmanager')).toThrow()
    })

    it("pressing edit calls callback", async () => {
        const callback = jest.fn();
        const handleselect = jest.fn();
        const { getByText, getByLabelText } = await act( async () => render(<EntryPreview user={AuthContext.useAuth().user} data={templates[0]} handleOnEdit={callback} handleSelect={handleselect}/>, { wrapper: routerWrapper }));
        const itemmanager = getByLabelText('itemmanager');
        await act(()=>fireEvent.click(itemmanager));
        const edit = getByText('Edit');
        await act(()=>fireEvent.click(edit));
        expect(callback).toHaveBeenCalledTimes(1);
        //expect(handleselect).toHaveBeenCalledTimes(0);
    })

    it("pressing delete post", async () => {
        const callback = jest.fn();
        const handleselect = jest.fn();
        const { getByText, getByLabelText } = await act( async () => render(<EntryPreview user={AuthContext.useAuth().user} data={templates[0]} handleOnDelete={callback} handleSelect={handleselect}/>, { wrapper: routerWrapper }));
        const itemmanager = getByLabelText('itemmanager');
        await act(()=>fireEvent.click(itemmanager));
        const del = getByText('Delete');
        await act(()=>fireEvent.click(del));
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(1);
        //expect(api.Post).toHaveBeenCalledTimes(1);
    })
    

})