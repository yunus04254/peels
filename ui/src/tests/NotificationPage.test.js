import Notification from 'src/components/custom/notifications/Notification';
import { render, fireEvent, queryByRole } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { waitFor } from '@testing-library/dom';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext'; 
import * as React from 'react'; 
import { NotificationProvider } from 'src/context/NotificationContext';
import { BrowserRouter } from 'react-router-dom';
import NotificationPage from 'src/pages/Notifications';

initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

const notifications = [
    {
        id: 1,
        title: "notification 1",
        content: "notificationcontent",
        redirect: "/testredirect",
        icon: "heart",
        image: "image1",
        createdAt: "2022-01-01T00:00:00.000Z"

    },
    {
        id: 2,
        title: "notification 2",
        content: "notification 2",
        redirect: "/",
        icon: "bell",
        createdAt: "2022-01-01T00:00:00.000Z"
        

    },
    {
        id: 3,
        title: "notification 3",
        content: "notification 3",
        redirect: "/",
        image: "image1",
        createdAt: "2022-01-01T00:00:00.000Z"

    },
];


describe(NotificationPage, () => {
    const routerWrapper = ({ children }) => <BrowserRouter><NotificationProvider>{children}</NotificationProvider></BrowserRouter>;


    beforeEach(() => {
        
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

        const notifications = [
            {
                id: 1,
                title: "notification 1",
                content: "notificationcontent",
                redirect: "/testredirect",
                icon: "heart",
                image: "image1",
                createdAt: "2022-01-01T00:00:00.000Z"
        
            },
            {
                id: 2,
                title: "notification 2",
                content: "notification 2",
                redirect: "/",
                icon: "bell",
                createdAt: "2022-01-01T00:00:00.000Z"
                
        
            },
            {
                id: 3,
                title: "notification 3",
                content: "notification 3",
                redirect: "/",
                image: "image1",
                createdAt: "2022-01-01T00:00:00.000Z"
        
            },
        ];
        
        api.Get.mockImplementation(async (url) => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(notifications)});
        });
        api.Post.mockImplementation(async (url) => {
            return Promise.resolve({ ok: true });
        });

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders notifications", async () => {
        const { getByText, container } = await act(async () => render(<NotificationPage user={AuthContext.useAuth().user} />, { wrapper: routerWrapper }));


    })

   


})