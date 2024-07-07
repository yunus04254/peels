import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { act } from 'react-dom/test-utils';


initializeApp(firebaseConfig);

test('renders learn react link', async () => {
    await act(async () => {
        render(<App />);
    });
});
