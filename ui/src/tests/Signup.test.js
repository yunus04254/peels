import Signup from 'src/components/custom/Signup';
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

describe(Signup, () => {
    
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

        firebase.createUserWithEmailAndPassword.mockImplementation(async (auth, email, password) => {
            if(email === 'test@email.com')
            {
                return Promise.resolve({ user: { uid: 1 } });
            }
            else if(email === 'alreadyinuse@email.com')
            {
                return Promise.reject({ code: 'auth/email-already-in-use' });
            }
            return Promise.reject({ code: 'auth/invalid-email' });
        });

        api.Get.mockImplementation(async (url, params, options) => {
            if(params.username === 'alreadyinuse')
            {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ exists: true }) });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });

        api.Post.mockImplementation(async (url, params, options) => {
            return Promise.resolve({ ok: true });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the signup form', async () => {
        const { getByText, getByTestId } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        expect(getByTestId('signup')).toBeInTheDocument();
        expect(getByText('Email')).toBeInTheDocument();
        expect(getByText('Username')).toBeInTheDocument();
        expect(getByText('Password')).toBeInTheDocument();
    });

    it('should signup a user', async () => {
        const { getByLabelText, getByTestId } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } })
        });
        await act( async () => {
            fireEvent.change(username, { target: { value: 'test' } });
        });
        await act( async () => {
            fireEvent.change(password, { target: { value: 'Password123$' } });
        });
        await act( async () => {
            fireEvent.click(signupButton);
        });

        expect(firebase.createUserWithEmailAndPassword).toHaveBeenCalled();
        expect(api.Post).toHaveBeenCalled();
    });

    it('should not signup a user if email is already in use', async () => {
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'alreadyinuse@email.com' } })
        });

        await act( async () => {
            fireEvent.change(username, { target: { value: 'test' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'Password123$' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        expect(firebase.createUserWithEmailAndPassword).toHaveBeenCalled();

        const error = await getByText('Email is already in use');
        expect(error).toBeInTheDocument();
    });

    it('should not signup a user if email is invalid', async () => {
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'invalidemail.com' } })
        });

        await act( async () => {
            fireEvent.change(username, { target: { value: 'test' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'Password123$' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        const error = await getByText('Invalid email format');
        expect(error).toBeInTheDocument();
    });

    it('should not signup a user if username is invalid', async () => {
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } })
        });

        await act( async () => {
            fireEvent.change(username, { target: { value: '' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'Password123$' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        const error = await getByText('Username is required');
        expect(error).toBeInTheDocument();
    });

    it('should not signup a user if password is not at least 6 characters in length', async () => {
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } })
        });

        await act( async () => {
            fireEvent.change(username, { target: { value: 'test' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'Pass$' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        const error = await getByText('Password must be at least 6 characters long');
        expect(error).toBeInTheDocument();
    });

    it('should not signup a user if password does not contain at least one number', async () => {
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } })
        });

        await act( async () => {
            fireEvent.change(username, { target: { value: 'test' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'Password$' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        const error = await getByText('Password must contain at least one number');
        expect(error).toBeInTheDocument();
    });

    it('should not signup a user if password does not contain at least one special character', async () => {
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } })
        });

        await act( async () => {
            fireEvent.change(username, { target: { value: 'test' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'Password1' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        const error = await getByText('Password must contain at least one special character');
        expect(error).toBeInTheDocument();
    });

    it('should not signup a user if password does not contain at least one uppercase letter', async () => {
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } })
        });

        await act( async () => {
            fireEvent.change(username, { target: { value: 'test' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'password1$' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        const error = await getByText('Password must contain at least one uppercase letter');
        expect(error).toBeInTheDocument();
    });

    it('should give error for invalid email format on blur', async () => {
        const { getByLabelText, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');

        await act( async () => {
            fireEvent.blur(email);
        });

        const error = await getByText('Invalid email format');
        expect(error).toBeInTheDocument();
    });

    it('should not give error for valid email format on blur', async () => {
        const { getByLabelText, queryByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } });
        });

        await act( async () => {
            fireEvent.blur(email);
        });

        const error = await queryByText('Invalid email format');
        expect(error).toBeNull();
    });
    
    it('should not sign up a user if username already exists', async () => {
        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } })
        });
        
        await act( async () => {
            fireEvent.change(username, { target: { value: 'alreadyinuse' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'Password123$' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        const error = await getByText('Username is already taken');
        expect(error).toBeInTheDocument();
    });

    it('should not sign up if error occurs checking the username availability', async () => {
        api.Get.mockImplementation(async (url, params, options) => {
            return Promise.reject({ error: { message: 'Failed to check username availability' } });
        });

        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } })
        });

        await act( async () => {
            fireEvent.change(username, { target: { value: 'test' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'Password123$' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        const error = await getByText('Unable to check if username exists');
        expect(error).toBeInTheDocument();
    });

    it('should not sign up a user if error occurs during registration', async () => {
        api.Post.mockImplementation(async (url, params, options) => {
            return Promise.resolve({ ok: false });
        });

        const { getByLabelText, getByTestId, getByText } = await act( async () => render(<Signup />, { wrapper: routerWrapper }));
        const email = getByLabelText('Email');
        const username = getByLabelText('Username');
        const password = getByLabelText('Password');
        const signupButton = getByTestId('signup');

        await act( async () => {
            fireEvent.change(email, { target: { value: 'test@email.com' } })
        });

        await act( async () => {
            fireEvent.change(username, { target: { value: 'test' } });
        });

        await act( async () => {
            fireEvent.change(password, { target: { value: 'Password123$' } });
        });

        await act( async () => {
            fireEvent.click(signupButton);
        });

        // error is thrown, not displayed to user
        const error = await getByText('Failed to register user in local database');
        expect(error).toBeInTheDocument();
    });

});