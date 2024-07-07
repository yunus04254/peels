import BananaCounter from 'src/components/custom/BananaCounter';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { BananaProvider } from 'src/context/BananaContext';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext'; 
import * as React from 'react'; 

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

describe(BananaCounter, () => {
    
    const routerWrapper = ({ children }) => <BrowserRouter><BananaProvider>{children}</BananaProvider></BrowserRouter>;

    beforeEach(() => {
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

        api.Get.mockImplementation(async (url, params, options) => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ bananas: 5 }) });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the banana counter', async () => {
        const user = { userID: 1 };
        const { getByText } = await act( async () => render(<BananaCounter user={user}/>, { wrapper: routerWrapper }));
        expect(getByText('5')).toBeInTheDocument();
    });

    it('does not render the banana counter if no user is provided', async () => {
        const { queryByText } = await act( async () => render(<BananaCounter />, { wrapper: routerWrapper }));
        expect(queryByText('5')).not.toBeInTheDocument();
    });

});