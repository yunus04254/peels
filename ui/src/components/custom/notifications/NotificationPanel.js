import { BellRing, Check } from "lucide-react"
import { Button } from "src/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "src/components/ui/card"

import { React, useContext, useEffect, useState } from "react"

import { Get, Post } from "src/lib/api"
import Notification from "./Notification"
import { toast } from 'sonner';
import { useNotification } from "src/context/NotificationContext"

/*
    NotificationPanel component is a card component used to display the notifications as a list of child cards.

    @param props.user - The user object to fetch the notifications for.

*/

const NotificationPanel = (props) => {
    const { updateNotifications, deleteNotification, notifications } = useNotification()
    
    useEffect(() => {
        updateNotifications(props.user)
    }, [])

    return (
        <Card className="min-h-[400px] max-h-full min-w-full bg-white shadow-md">
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>You have {notifications.length === 0 && "no"} {notifications.length !== 0 && notifications.length} new notifications</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 min-h-full min-w-full max-h-[300px] overflow-y-auto pr-3">
                    
                    {[...notifications].reverse().map((notification) => {
                        return <Notification notification={notification} deleteNotification={(id) => deleteNotification(props.user, id, () => updateNotifications(props.user))}/>
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default NotificationPanel