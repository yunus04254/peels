//JEST Testing file for EmojiSelect component
import EmojiSelect from 'src/components/custom/EmojiSelect';
import { render, fireEvent } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { act } from 'react-dom/test-utils';

initializeApp(firebaseConfig);

describe(EmojiSelect, () => {

    it('renders without crashing', () => {
        render(<EmojiSelect onChange={(m)=>{}}/>);
    });

    it('there is a default button with smile emoji', async () => {
        const { getByText, getByLabelText, getByRole, container } = render(<EmojiSelect onChange={(m)=>{}}/>);
        const loginButton = getByRole("button", { name: "🙂" });
    });


    it('selecting an emoji from the picker, it updates the emoji button', () => {
        let mood = "🙂";
        const { rerender, getByText } = render(<EmojiSelect onChange={(m)=>{mood=m;}} initial="😢"/>);
        expect(getByText(mood)).toBeInTheDocument();
    });

});