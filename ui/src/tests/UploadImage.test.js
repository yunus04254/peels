//JEST Testing file for JournalStats component
import UploadImage from 'src/components/custom/UploadImage';
import { render, fireEvent } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { waitFor } from '@testing-library/dom';
import { act } from 'react-dom/test-utils';
import * as React from 'react';


initializeApp(firebaseConfig);

describe('UploadImage component', () => {

    it('should render UploadImage component',async () => {
        const onFileSelect = jest.fn();
        const { getByText, getByLabelText, container } = render(<UploadImage onFileSelect={onFileSelect} />);
        expect(getByLabelText('upload-image-button')).toBeInTheDocument();
        expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
        expect(container.querySelector('#file-upload')).toBeInTheDocument();

        //assert things about the button
        const button = getByLabelText('upload-image-button');
        expect(button).toHaveAttribute('aria-label', 'upload-image-button');

        //assert things about the input
        const input = container.querySelector('input[type="file"]');
        expect(input).toHaveAttribute('id', 'file-upload');
        expect(input).toHaveAttribute('accept', 'image/*');
        expect(input).toHaveAttribute('style', 'display: none;');
    });

    it('should call handleClick when button is clicked', async () => {
        const onFileSelect = jest.fn();
        const { getByLabelText, container } = render(<UploadImage onFileSelect={onFileSelect} />);
        const button = getByLabelText('upload-image-button');
        const input = container.querySelector('input[type="file"]');
        jest.spyOn(input, 'click');
        fireEvent.click(button);
        //input button should be clicked
        expect(input.click).toHaveBeenCalled();
    });

    it('should call onFileSelect when file is selected', async () => {
        const onFileSelect = jest.fn();
        const { getByLabelText, container } = render(<UploadImage onFileSelect={onFileSelect} />);
        const input = container.querySelector('input[type="file"]');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        fireEvent.change(input);
        await waitFor(() => expect(onFileSelect).toHaveBeenCalledWith(file));
    });

    it('should add extra classnames if passed through props', async () => {
        const onFileSelect = jest.fn();
        const { getByLabelText, container } = render(<UploadImage onFileSelect={onFileSelect} className="extra-class" />);
        const button = getByLabelText('upload-image-button');
        expect(button).toHaveClass('extra-class');
    });

});