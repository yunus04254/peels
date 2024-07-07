import React from 'react';
import NotificationPanel from '../components/custom/notifications/NotificationPanel';
import { useAuth } from '../context/AuthContext';

const Notifications = (props) => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <NotificationPanel className="max-h-full min-h-full" user={user} />
        </div>
    );

}

export default Notifications;