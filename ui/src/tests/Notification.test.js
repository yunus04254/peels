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


describe("notification component", () => {
    const routerWrapper = ({ children }) => <BrowserRouter><NotificationProvider>{children}</NotificationProvider></BrowserRouter>;


    beforeEach(() => {
        
        AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders notifications", async () => {
        const { queryByTestId, queryByText } = render(<Notification notification={notifications[0]} />, { wrapper: routerWrapper });
        const notificationView = await queryByTestId("notification-view")
        expect(notificationView).toBeVisible();

    })

    it("renders title", async() => {
        const { queryByTestId, queryByText } = render(<Notification notification={notifications[0]} />, { wrapper: routerWrapper });
        const title = await queryByText("notification 1")
        expect(title).toBeVisible();
    })
    it("renders content", async() => {
        const { queryByTestId, queryByText } = render(<Notification notification={notifications[0]} />, { wrapper: routerWrapper });
        const content = await queryByText("notificationcontent")
        expect(content).toBeVisible();
    })
    it("renders image", async() => {
        const { queryByTestId, queryByText } = render(<Notification notification={notifications[0]} />, { wrapper: routerWrapper });
        const image = await queryByTestId("notification-image")
        expect(image).toBeVisible();
        expect(image).toHaveAttribute("src", "image1");
    })

    it("doesnt render image", async() => {
        const { queryByTestId, queryByText } = render(<Notification notification={notifications[1]} />, { wrapper: routerWrapper });
        const image = await queryByTestId("notification-image")
        expect(image).not.toBeInTheDocument();
    })

    it("renders bell icon", async() => {
        const { queryByTestId, queryByText, getByRole, getByText, container } = render(<Notification notification={notifications[0]} />, { wrapper: routerWrapper });
        expect(container.getElementsByClassName('lucide-heart-handshake').length).toBe(1);
        
    })

    it("renders bell icon", async() => {
        const { queryByTestId, queryByText, getByRole, getByText, container } = render(<Notification notification={notifications[1]} />, { wrapper: routerWrapper });
        expect(container.getElementsByClassName('lucide-bell-ring').length).toBe(1);
        
    })

    it("renders bell icon default", async() => {
        const { queryByTestId, queryByText, getByRole, getByText, container } = render(<Notification notification={notifications[2]} />, { wrapper: routerWrapper });
        expect(container.getElementsByClassName('lucide-bell-ring').length).toBe(1);
        
    })

    it("renders date", async() => {
        const { queryByTestId, queryByText } = render(<Notification notification={notifications[0]} />, { wrapper: routerWrapper });
        const date = await queryByText("01/01/2022, 00:00:00")
        expect(date).toBeVisible();
    })

    it("renders redirect", async () => {
        const { queryByTestId, queryByText } = render(<Notification notification={notifications[0]} />, { wrapper: routerWrapper });
        await act(async () =>
            fireEvent.click(queryByTestId("notification-view")))
        await waitFor(() => expect(window.location.pathname).toBe("/testredirect"));
    })

    it("deletes notification", async () => { //deleteNotification(props.user, id, () => ())
        const deleteCallback = jest.fn();
        const { queryByTestId, queryByText, getByRole } = render(<Notification notification={notifications[0]} deleteNotification={deleteCallback} />, { wrapper: routerWrapper });
        
        const deleteButton = await getByRole("button");
        fireEvent.click(deleteButton);
        expect(deleteCallback).toBeCalled();
        
    })

    it("active class", async () => {
        const { queryByTestId, queryByText } = render(<Notification notification={notifications[0]} />, { wrapper: routerWrapper });
        const card = await queryByTestId("notification-card")
        expect(card).toHaveClass("ycard");
    })

    /*it("inactive class", async () => {
        const setState = jest.fn(); 
        const spystate = jest.spyOn(React, 'useState');
        spystate.mockImplementationOnce((init)=>[false, setState]);
        const { queryByTestId, queryByText, component } = await act(async ()=>render(<Notification notification={notifications[0]} />, { wrapper: routerWrapper }));
        const card = await queryByTestId("notification-card")
    
        expect(card).toHaveClass("fadecard");
    })*/

})