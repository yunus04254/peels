import NotificationButton from 'src/components/custom/notifications/NotificationButton';
import { render, fireEvent, queryByRole, screen } from '@testing-library/react';
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


describe("notification button", () => {
    const routerWrapper = ({ children }) => <BrowserRouter><NotificationProvider>{children}</NotificationProvider></BrowserRouter>;


    beforeEach(() => {
        
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });
        api.Get.mockImplementation(async (url) => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(notifications)});
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders button", async () => {
        const { getByText, getByTestId, getByRole } = await act(async ()=>render(<NotificationButton/>, { wrapper: routerWrapper }));
        expect(getByRole("button")).toBeInTheDocument();
    })

    it("check if number correct", async () => {
        const { getByText, getByRole } = await act(async ()=>render(<NotificationButton user={AuthContext.useAuth().user} />, { wrapper: routerWrapper }));
    
        expect(getByText("3")).toBeInTheDocument();
    })

    it("check button navigates you on mobile", async () => {
        const { getByText, getByRole, container, getByTestId } = await act(async ()=>render(<NotificationButton user={AuthContext.useAuth().user} desktop={false} />, { wrapper: routerWrapper }));
        
        const button = getByRole("button");
        expect(button).toBeInTheDocument()
        await act(async () => {
            fireEvent.click(button);
            
        })
        expect(window.location.pathname).toBe("/notifications")
    })

    it("check if panel opens on click", async () => {
        const { getByText, getByRole, container, getByTestId } = await act(async ()=>render(<NotificationButton user={AuthContext.useAuth().user} desktop={true}/>, { wrapper: routerWrapper }));
        
        const button = getByRole("button");
        expect(button).toBeInTheDocument()
        await act(async () => {
            fireEvent.click(button);
            
        })
        
    })

})