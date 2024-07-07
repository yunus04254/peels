import ResetPassword from 'src/components/custom/ResetPassword';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest} from '@jest/globals';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as React from 'react'; 

import * as firebase from 'firebase/auth';


initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');
jest.mock('firebase/auth');

describe(ResetPassword, () => {
    
    const routerWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

    beforeEach(() => {
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

    it("should render ResetPassword component", async () => {
        const { getByText } = await act( async () => render(<ResetPassword />, { wrapper: routerWrapper }));
        expect(getByText('Reset Password')).toBeInTheDocument();
    });


    it('should display reset email sent message', async () => {
        firebase.sendPasswordResetEmail.mockImplementation(async (auth, email) => {
            if(email === 'test@testemail.com')
            {
                return Promise.resolve({ ok: true });
            }
            return Promise.reject();
        });
        const { getByTestId, getByText } = await act( async () => render(<ResetPassword />, { wrapper: routerWrapper }));
        fireEvent.click(getByText('Reset Password'));
        await act( async () => fireEvent.change(getByTestId('reset_email'), { target: { value: 'test@testemail.com' } }));
        await act( async () => fireEvent.click(getByText('Send Reset Email')));
        expect(getByText('Reset email sent! Check your inbox.')).toBeInTheDocument();
    });

    it('should display error message on invalid reset email', async () => {
        firebase.sendPasswordResetEmail.mockImplementation(async (auth, email) => {
            return Promise.reject();
        });
        const { getByTestId, getByText } = await act( async () => render(<ResetPassword />, { wrapper: routerWrapper }));
        fireEvent.click(getByText('Reset Password'));
        await act( async () => fireEvent.change(getByTestId('reset_email'), { target: { value: 'incorrectemail@email.com' } }));
        await act( async () => fireEvent.click(getByText('Send Reset Email')));
        expect(getByText('This email is not associated with an account.')).toBeInTheDocument();
    });



});