// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Get, Post } from "src/lib/api";
import { toast } from 'sonner';
import { BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const NotificationContext = createContext();

/*
	NotificationProvider is a context provider for the notifications in the application.
	It is used to load notifications regularly and provide easy methods for sending them
	It has functions:
	- sendNotification: Send a notification to a user.
	- updateNotifications: Fetch the notifications from the server.
	- deleteNotification: Delete a notification using the id.
	- notifications: A list of notifications.

	@param children - The children components to render.



*/

export const NotificationProvider = ({ children }) => {
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState([]);
	/*
		sendNotification function is used to send a notification to a user.
		@param user - The user to send the notification to.
		@param title - The title of the notification.
		@param content - The content of the notification.
		@param redirect - The URL to redirect to when the notification is clicked.
		@param popup - A boolean value to determine if the notification should be displayed as a popup using the toaster
		@param icon - The icon to display with the notification (default is bell).
		@param image - The image to display with the notification.
	*/
	const sendNotification = (user, title, content, redirect, popup, icon, image) => {
		Post("notifications/create", { title: title, content: content, redirect: redirect, icon: icon, image: image, isSent: true}, null, { user: user }).then((response) => {
			if (response.ok && popup) {
				updateNotifications(user)
				toast.success(title, {
					description: content,
					icon: <BellRing size={24} />,
					action: {
						label: "Go",
						onClick: () => {
							response.json().then((data) => {
								deleteNotification(user, data.id, () => {
									navigate(redirect)
								})
							})
						}
					}
				})
			}
		})
	}
	/*
		updateNotifications function is used to fetch the notifications from the server.
		@param user - The user to fetch the notifications for.
	*/
	const updateNotifications = (user) => {
		Get("notifications", null, { user: user }).then((response) => {
			if (response.ok) {
				response.json().then((data) => {
					setNotifications(data)
				})
			}
		})
	}
	/*
		deleteNotification function is used to delete a notification using the id.
		@param user - The user to delete the notification for.
		@param idToRemove - The id of the notification to delete.
		@param callback - A callback function to call after the notification is deleted.

	*/
	const deleteNotification = (user, idToRemove, callback) => {
		Post("notifications/delete", { id: idToRemove }, null, { user: user }).then((response) => {
			if (response.ok) {
				updateNotifications(user);
				if (callback) {
					callback();
				}
			} else {
				toast.error("Failed to delete notification", {
					description: "Please try again later",
					action: {
						label: "Okay",
						onClick: () => { },
					},
				});
			}
		})
	}

	return (
		<NotificationContext.Provider value={{ sendNotification, updateNotifications, deleteNotification, notifications }}>
			{children}
		</NotificationContext.Provider>
	);

};

export const useNotification = () => useContext(NotificationContext);
