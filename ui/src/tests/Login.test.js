import Login from 'src/components/custom/Login';
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

describe(Login, () => {
    
    const routerWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

    beforeEach(() => {
        api.Get.mockImplementation(async (url, params, options) => {

            if(url === 'users/findByUid' && params.uid === 1)
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ username: 'test' }) });
            }
            else if(url === 'users/findByUid' && params.uid === 2)
            {
                return Promise.resolve({ ok: false });
            }
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

        firebase.signInWithEmailAndPassword.mockImplementation(async (auth, email, password) => {
            if(email === 'test@testemail.com' && password === 'password123')
            {
                return Promise.resolve({ user: { uid: 1 } });
            }
            else if(email === 'test2@testemail.com' && password === 'password123')
            {
                return Promise.resolve({ user: { uid: 2 } });
            }
            return Promise.resolve({ error: { message: 'Invalid username or password.' } });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render login page', async () => {
        const { getByLabelText, getByTestId } = await act( async () => render(<Login />, { wrapper: routerWrapper }));
        expect(getByLabelText('Email')).toBeInTheDocument();
        expect(getByLabelText('Password')).toBeInTheDocument();
        expect(getByTestId('login')).toBeInTheDocument();
    });

    it('should render reset password dialog', async () => {
        const { getByText } = await act( async () => render(<Login />, { wrapper: routerWrapper }));
        fireEvent.click(getByText('Reset Password'));
        expect(getByText('Enter your email to receive password reset instructions.')).toBeInTheDocument();
    });

    it('should call signin on successful login', async () => {
        const { getByLabelText, getByTestId } = await act( async () => render(<Login />, { wrapper: routerWrapper }));
        await act( async () => fireEvent.change(getByLabelText('Email'), { target: { value: 'test@testemail.com' } }));
        await act( async () => fireEvent.change(getByLabelText('Password'), { target: { value: 'password123' } }));
        await act( async () => fireEvent.click(getByTestId('login')));
        expect(firebase.signInWithEmailAndPassword).toHaveBeenCalled();
    });

    it('should display error message on invalid login', async () => {
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Login />, { wrapper: routerWrapper }));
        await act( async () => fireEvent.change(getByLabelText('Email'), { target: { value: 'wrongemail@wrongemail.com' } }));
        await act( async () => fireEvent.change(getByLabelText('Password'), { target: { value: 'wrongpassword' } }));
        await act( async () => fireEvent.click(getByTestId('login')));
        expect(getByText('Invalid username or password.')).toBeInTheDocument();
    });

    it('should display error message on missing email or password', async () => {
        const { getByTestId, getByText } = await act( async () => render(<Login />, { wrapper: routerWrapper }));
        await act( async () => fireEvent.click(getByTestId('login')));
        expect(getByText('Email and password are required.')).toBeInTheDocument();
    });

    it('should display error if user data is not able to be fetched', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Login />, { wrapper: routerWrapper }));
        await act( async () => fireEvent.change(getByLabelText('Email'), { target: { value: 'test2@testemail.com' } }));
        await act( async () => fireEvent.change(getByLabelText('Password'), { target: { value: 'password123' } }));
        await act( async () => fireEvent.click(getByTestId('login')));
        expect(getByText('Failed to fetch user data.')).toBeInTheDocument();
    });

    it('should display error message on missing reset email', async () => {
        const { getByText } = await act( async () => render(<Login />, { wrapper: routerWrapper }));
        fireEvent.click(getByText('Reset Password'));
        await act( async () => fireEvent.click(getByText('Send Reset Email')));
        expect(getByText('Please enter your email to reset your password.')).toBeInTheDocument();
    });
});