// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

import { TextDecoder, TextEncoder } from 'util';
Object.assign(global, { TextDecoder, TextEncoder });

// import { handlers } from './handlers';
// import { setupServer } from 'msw/node';


// const server = setupServer(...handlers);

// beforeAll(() => {
//   // Start the interception.
//   server.listen()
// })

// afterEach(() => {
//   // Remove any handlers you may have added
//   // in individual tests (runtime handlers).
//   server.resetHandlers()
// })

// afterAll(() => {
//   // Disable request interception and clean up.
//   server.close()
// })

window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })

