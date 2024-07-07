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
import NewEntryCarousel from 'src/components/custom/entries/NewEntryCarousel';
import Carousel from 'src/components/ui/carousel';
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
]

const journals = [
    {
        id: 1,
        title: "journal 1",
        description: "journalcontent",
        createdAt: "2022-01-01T00:00:00.000Z",
        UserUserID: 1
    },
    {
        id: 2,
        title: "journal 2",
        description: "journalcontent",
        createdAt: "2022-01-01T00:00:00.000Z",
        UserUserID: 1
    },

]
describe(NewEntryCarousel, () => {
    const routerWrapper = ({ children }) => <BrowserRouter><BananaProvider><TemplateProvider>{children}</TemplateProvider></BananaProvider></BrowserRouter>;
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

        api.Get.mockImplementation(async (url) => {
            if (url === 'templates') return Promise.resolve({ ok: true, json: () => Promise.resolve(templates)});
            if (url === 'journals/get_user_journal') return Promise.resolve({ ok:true, json: () => Promise.resolve(journals) });
            return { data: { templates: templates } };
        });
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
    it("renders the new entry carousel", async () => {
        const { getByText, getByRole, getByTestId } = await act( async () => render(<NewEntryCarousel />, { wrapper: routerWrapper }));
        await act( async () => fireEvent.click(getByRole('button')));
        expect(getByText('Select Template!')).toBeInTheDocument();
        expect(getByText('template 1')).toBeInTheDocument();
        expect(getByText('journal 1')).toBeInTheDocument();
        expect(document.querySelector(".ql-editor")).toBeInTheDocument();
        expect(getByTestId("back-arrow")).toBeInTheDocument();
        //jest.mock(Carousel, "setApi")
    })

    it("renders the new entry carousel with a template", async () => {
        const { getByText, getByRole, getByTestId } = await act( async () => render(<NewEntryCarousel />, { wrapper: routerWrapper }));
        await act( async () => fireEvent.click(getByRole('button')));
        expect(document.querySelector(".ql-editor")).toBeInTheDocument();
        expect(getByTestId("back-arrow")).toBeInTheDocument();
        await act( async () => fireEvent.click(getByText('template 1')));
        expect(document.querySelector(".ql-editor").textContent).toBe("findme");
    })

    it("renders the new entry carousel with a chosen template", async () => {
        const { getByText, getByRole, getByTestId } = await act( async () => render(<NewEntryCarousel defaultContent={"{\"ops\":[{\"insert\":\"findme\\n\"}]}"}/>, { wrapper: routerWrapper }));
        expect(document.querySelector(".ql-editor")).toBeInTheDocument();
        expect(document.querySelector(".ql-editor").textContent).toBe("findme");
    })

    it("renders the new entry carousel with a chosen journal", async () => {
        const { getByText, getByRole, getByTestId } = await act( async () => render(<NewEntryCarousel defaultJournalID={1}/>, { wrapper: routerWrapper }));
        expect(()=>getByText('journal 1')).toThrow()
    })

    it("can create an entry", async () => {
        const callback = jest.fn()
        const { getByText, getByRole, getByTestId } = await act( async () => render(<NewEntryCarousel onEntryCreate={callback} />, { wrapper: routerWrapper }));
        await act( async () => fireEvent.click(getByRole('button')));
        await act( async () => fireEvent.click(getByText('template 1')));
        await act( async () => fireEvent.click(getByText('journal 1')));
        await act( async () => fireEvent.change(getByTestId("title"), { target: { value: "new title" } }));
        await act( async () => fireEvent.click(getByText('Save changes')));
        expect(callback).toHaveBeenCalled();
    })

    it("can create an entry with a default journal", async () => {
        const callback = jest.fn()
        const { getByText, getByRole, getByTestId } = await act( async () => render(<NewEntryCarousel onEntryCreate={callback} defaultJournalID={1}/>, { wrapper: routerWrapper }));
        await act( async () => fireEvent.click(getByRole('button')));
        await act( async () => fireEvent.click(getByText('template 1')));
        await act( async () => fireEvent.change(getByTestId("title"), { target: { value: "new title" } }));
        await act( async () => fireEvent.click(getByText('Save changes')));
        expect(callback).toHaveBeenCalled();
    })

    it("can create an entry with a default content", async () => {
        const callback = jest.fn()
        const { getByText, getByRole, getByTestId } = await act( async () => render(<NewEntryCarousel onEntryCreate={callback} defaultContent={"{\"ops\":[{\"insert\":\"findme\\n\"}]}"}/>, { wrapper: routerWrapper }));
        await act( async () => fireEvent.click(getByText('journal 1')));
        await act( async () => fireEvent.change(getByTestId("title"), { target: { value: "new title" } }));
        await act( async () => fireEvent.click(getByText('Save changes')));
        expect(callback).toHaveBeenCalled();
    })

    it("can create an entry with a default content and journal", async () => {
        const callback = jest.fn()
        const { getByText, getByRole, getByTestId } = await act( async () => render(<NewEntryCarousel onEntryCreate={callback} defaultContent={"{\"ops\":[{\"insert\":\"findme\\n\"}]}"}/>, { wrapper: routerWrapper }));
        await act( async () => fireEvent.change(getByTestId("title"), { target: { value: "new title" } }));
        await act( async () => fireEvent.click(getByText('Save changes')));
        expect(callback).toHaveBeenCalled();
    })


})