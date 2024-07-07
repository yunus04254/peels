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
import TemplateSelect from 'src/components/custom/templates/TemplateSelect';
import {Dialog} from 'src/components/ui/dialog';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import TemplateCreate from 'src/components/custom/templates/TemplateCreate';
import { BananaProvider } from 'src/context/BananaContext';

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

const templates = [
    {
        id: 1,
        name: "template 1",
        description: "templatecontent",
        content: "{\"ops\":[{\"insert\":\"findme\\n\"}]}",
        createdAt: "2022-01-01T00:00:00.000Z",
        UserUserID: 1
        
    },
    {
        id: 2,
        name: "template 2",
        description: "templatecontent",
        content: "{\"ops\":[{\"insert\":\"findme\\n\"}]}",
        createdAt: "2022-01-01T00:00:00.000Z",
        UserUserID: 1
        
    },
    {
        id: 3,
        name: "template 3",
        description: "templatecontent",
        content: "{\"ops\":[{\"insert\":\"findme\\n\"}]}",
        createdAt: "2022-01-01T00:00:00.000Z",
        UserUserID: 1
    },
    {
        id: 4,
        name: "template 4",
        description: "templatecontent",
        content: "{\"ops\":[{\"insert\":\"findme\\n\"}]}",
        createdAt: "2022-01-01T00:00:00.000Z",
        UserUserID: 1
    },
    {
        id: 5,
        name: "template 5",
        description: "templatecontent",
        createdAt: "2022-01-01T00:00:00.000Z",
        UserUserID: 1
    },
];

describe(TemplateSelect, () => {
    const routerWrapper = ({ children }) => <BrowserRouter><BananaProvider><TemplateProvider>{children}</TemplateProvider></BananaProvider></BrowserRouter>;

    beforeAll(() => {
        
    })

    beforeEach(() => {
        
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

        api.Get.mockImplementation(async (url) => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(templates)});
        });
        api.Post.mockImplementation(async (url, data) => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(data)});
        })
        const mockIntersectionObserver = jest.fn();
        mockIntersectionObserver.mockReturnValue({
          observe: () => null,
          unobserve: () => null,
          disconnect: () => null
        });
        window.IntersectionObserver = mockIntersectionObserver;

        const mockResizeObserver = jest.fn();
        mockResizeObserver.mockReturnValue({
          observe: () => null,
          unobserve: () => null,
          disconnect: () => null
        });
        window.ResizeObserver = mockResizeObserver;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders the grid", async () => {
        const { getByText } = await act(async () => render(<TemplateSelect grid={true} />, { wrapper: routerWrapper }));
        expect(document.querySelector('.grid')).toBeInTheDocument();
    });

    it("renders the carousel", async () => {
        const { getByText, getByTestId } = await act(async () => render(<TemplateSelect carousel={true} />, { wrapper: routerWrapper }));
        expect(getByTestId("template-carousel")).toBeInTheDocument();
    });

    it("renders the templates", async () => {
        const { getByText, getAllByTestId } = await act(async () => render(<TemplateSelect grid={true} />, { wrapper: routerWrapper }));
        expect(getByText('template 1')).toBeVisible();
        expect(getByText('template 2')).toBeVisible();
        expect(getByText('template 3')).toBeVisible();
        expect(getByText('template 4')).toBeVisible();
    })

    it("clicking populated template calls onTemplateClick", async () => {
        const onTemplateClick = jest.fn();
        const { getByText, getByTestId } = await act(async () => render(<TemplateSelect grid={true} onTemplateClick={onTemplateClick} />, { wrapper: routerWrapper }));
        await act(async()=>fireEvent.click(getByText('template 1')));
        expect(onTemplateClick).toHaveBeenCalledTimes(1);
        expect(onTemplateClick).toHaveBeenLastCalledWith("{\"ops\":[{\"insert\":\"findme\\n\"}]}", "templatecontent");
    })

    it("clicking not-populated template calls onTemplateClick", async () => {
        const onTemplateClick = jest.fn();
        const { getByText, getByTestId } = await act(async () => render(<TemplateSelect grid={true} onTemplateClick={onTemplateClick} />, { wrapper: routerWrapper }));
        await act(async()=>fireEvent.click(getByText('template 5')));
        expect(onTemplateClick).toHaveBeenCalledTimes(1);
        expect(onTemplateClick).toHaveBeenLastCalledWith("{}", "templatecontent");
    })
    
    it("clicking new template opens dialog", async () => {
        const { getByText, getByTestId } = await act(async () => render(<TemplateSelect grid={true} />, { wrapper: routerWrapper }));
        await act(async()=>fireEvent.click(getByText('create')));
        expect(getByText("Create a new template")).toBeVisible();
    })

    it("creating template callback", async () => {
        const callback = jest.fn();
        const { getByText, getByTestId } = await act(async () => render(<TemplateSelect grid={true} createTemplateOpenCallback={callback}/>, { wrapper: routerWrapper }));
        
        await act(async()=>fireEvent.click(getByText('create')));
        await act(async()=>fireEvent.change(getByTestId("template-title-box"), { target: { value: "test title" } }));
        await act(async()=>fireEvent.click(getByText('Save changes')));
        expect(callback).toHaveBeenCalledTimes(2);
        expect(api.Post).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith(false);
    })




})