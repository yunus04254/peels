import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "src/components/ui/popover"
import { Button } from "src/components/ui/button"

import { React, useEffect, useState } from "react"
import NotificationPanel from "src/components/custom/notifications/NotificationPanel"
import { Get, Post } from "src/lib/api"

import { toast } from 'sonner';

import { BellRing, Check } from "lucide-react"
import { useNotification } from "src/context/NotificationContext"
import { Navigate, useNavigate } from "react-router-dom"
import {useMediaQuery} from "@react-hook/media-query";
/*
    NotificationButton component is a component used to display the open notification button.
    The component uses the NotificationPanel component to display the notifications in a popover.
    The component uses the useNotification hook to fetch the notifications from the server.

    @param props.user - The user object to fetch the notifications for.
    
*/
const NotificationButton = (props) => {
    const { sendNotification, updateNotifications, deleteNotification, notifications } = useNotification()
    const navigate = useNavigate()
    var isDesktop = useMediaQuery("(min-width: 769px)");
    if (props.desktop){
        isDesktop = props.desktop
    }
    useEffect(() => {
        updateNotifications(props.user)
    }, [])

    if (!isDesktop){
        return <Button variant="secondary" size="sm" onClick={()=>navigate("/notifications")}>
            <span className="text-white">{notifications.length}</span>
            <BellRing className="text-white" />
        </Button>
    }

    return (
        <div className="notifications" >
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="secondary" size="sm"> 
                    <span className="text-white">{notifications.length}</span>
                    <BellRing className="text-white" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[350px]">
                <NotificationPanel user={props.user} />
            </PopoverContent>
        </Popover>
        </div>
    )
}

export default NotificationButton