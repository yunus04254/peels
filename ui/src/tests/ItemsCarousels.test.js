import ItemsCarousels from 'src/components/custom/ItemsCarousels';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest} from '@jest/globals';
import { BananaProvider } from 'src/context/BananaContext';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext'; 
import * as React from 'react'; 
import {toast} from "sonner"

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');
jest.mock('sonner');

describe(ItemsCarousels, () => {

    const routerWrapper = ({ children }) => <BrowserRouter><BananaProvider>{children}</BananaProvider></BrowserRouter>;

    beforeEach(() => {
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

        api.Get.mockImplementation(async (url, params, options) => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
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

    it('renders the items carousel', async () => {
        const { getByText } = await act( async () => render(<ItemsCarousels />, { wrapper: routerWrapper }));
        expect(getByText('Characters')).toBeInTheDocument();
        expect(getByText('Styles')).toBeInTheDocument();
    });

    it('renders the fetched items in the carousel', async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            if(url === 'character/available')
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ name: 'character 1', itemID : 1 }, { name: 'character 2', itemID : 2 }]) });
            }
            if(url === 'style/available')
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ name: 'style 1', itemID : 1 }, { name: 'style 2', itemID : 2 }]) });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });

        const { getByText } = await act( async () => render(<ItemsCarousels />, { wrapper: routerWrapper }));

        const character1 = await getByText('character 1');
        const character2 = await getByText('character 2');
        const style1 = await getByText('style 1');
        const style2 = await getByText('style 2');

        expect(character1).toBeInTheDocument();
        expect(character2).toBeInTheDocument();
        expect(style1).toBeInTheDocument();
        expect(style2).toBeInTheDocument();
    });

    it('purchases an item', async () => {
        jest.spyOn(toast, 'success').mockImplementation(() => {});
        api.Get.mockImplementation(async (url, params, options) => {
            if(url === 'character/available')
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ name: 'character 1', itemID : 1 }, { name: 'character 2', itemID : 2 }]) });
            }
            if(url === 'style/available')
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ name: 'style 1', itemID : 1 }, { name: 'style 2', itemID : 2 }]) });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });

        api.Post.mockImplementation(async (url, body) => {
            return Promise.resolve({ ok: true });
        });

        const { getByText, getByRole } = await act( async () => render(<ItemsCarousels />, { wrapper: routerWrapper }));

        const character1 = await getByText('character 1').closest("div").querySelector("button");
        const style1 = await getByText('style 1').closest("div").querySelector("button");

        await act( async () => {
            fireEvent.click(character1);
        });

        const confirmCharacterPurchase = await getByRole('alertdialog').querySelector('button[name="continue"]');

        await act( async () => {
            fireEvent.click(confirmCharacterPurchase);
        });

        await act( async () => {
            fireEvent.click(style1);
        });

        const confirmStylePurchase = await getByRole('alertdialog').querySelector('button[name="continue"]');

        await act( async () => {
            fireEvent.click(confirmStylePurchase);
        });

        expect(api.Post).toHaveBeenCalledTimes(2);
        expect(toast.success).toHaveBeenCalledTimes(2);
    });

    it('shows an error when the user does not have enough bananas', async () => {
        jest.spyOn(toast, 'error').mockImplementation(() => {});
        api.Get.mockImplementation(async (url, params, options) => {
            if(url === 'character/available')
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ name: 'character 1', itemID : 1 }, { name: 'character 2', itemID : 2 }]) });
            }
            if(url === 'style/available')
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ name: 'style 1', itemID : 1 }, { name: 'style 2', itemID : 2 }]) });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });

        api.Post.mockImplementation(async (url, body) => {
            return Promise.resolve({ ok: false });
        });

        const { getByText, getByRole } = await act( async () => render(<ItemsCarousels />, { wrapper: routerWrapper }));

        const character1 = await getByText('character 1').closest("div").querySelector("button");
        const style1 = await getByText('style 1').closest("div").querySelector("button");
        
        await act( async () => {
            fireEvent.click(character1);
        });

        const confirmCharacterPurchase = await getByRole('alertdialog').querySelector('button[name="continue"]');

        await act( async () => {
            fireEvent.click(confirmCharacterPurchase);
        });

        await act( async () => {
            fireEvent.click(style1);
        });

        const confirmStylePurchase = await getByRole('alertdialog').querySelector('button[name="continue"]');

        await act( async () => {
            fireEvent.click(confirmStylePurchase);
        });

        expect(api.Post).toHaveBeenCalledTimes(2);
        expect(toast.error).toHaveBeenCalledTimes(2);
    });
});