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
import NotificationPanel from 'src/components/custom/notifications/NotificationPanel';

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
        content: "notification 2content",
        redirect: "/",
        icon: "bell",
        image: "image1",
        createdAt: "2022-01-01T00:00:00.000Z"
        

    },
    {
        id: 3,
        title: "notification 3",
        content: "notification 3content",
        redirect: "/",
        icon: "bell",
        image: "image1",
        createdAt: "2022-01-01T00:00:00.000Z"

    },
];


describe(NotificationPanel, () => {
    const routerWrapper = ({ children }) => <BrowserRouter><NotificationProvider>{children}</NotificationProvider></BrowserRouter>;


    beforeEach(() => {
        
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

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
        const { getByText, container } = await act(async () => render(<NotificationPanel user={AuthContext.useAuth().user} />, { wrapper: routerWrapper }));
        
        await waitFor(() => {
            expect(getByText("Notifications")).toBeVisible();
        })

        expect(getByText("notification 1")).toBeVisible();
        expect(getByText("notification 2")).toBeVisible();
        expect(getByText("notification 3")).toBeVisible();

        const card = container.querySelector(".grid");

        expect(card).toBeVisible();
        expect(card.children.length).toBe(3);

    })

    it("notification counter", async () => {
        var { getByText } = await act(async () => render(<NotificationPanel user={AuthContext.useAuth().user} />, { wrapper: routerWrapper }));
        expect(getByText("You have 3 new notifications")).toBeVisible();

    })

    it("delete notification", async () => {
        const { getByText, container, rerender } = await act(async () => render(<NotificationPanel user={AuthContext.useAuth().user} />, { wrapper: routerWrapper }));
        expect(container.querySelector(".grid").children.length).toBe(3);
        api.Get.mockImplementation(async (url) => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([notifications[1], notifications[2]])});
        });
        const deleteButton = container.querySelector(".lucide-check");
        await act(async()=>fireEvent.click(deleteButton));
        expect(container.querySelector(".grid").children.length).toBe(2);
    

    })


})