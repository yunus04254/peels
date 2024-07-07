import { React, useEffect, useState, useTransition } from "react"
import { useNavigate } from 'react-router-dom';
import { BellRing, Check, HeartHandshakeIcon } from "lucide-react"
import { Button } from "src/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "src/components/ui/card"
import "src/styles/components/NotificationStyle.css"

const GetIcon = (name) => {
    switch(name){
        case "bell":
            return <BellRing />
        case "heart":
            return <HeartHandshakeIcon />
        default:
            return <BellRing />
    }
}
/*
    Notification component is a component used to represent a notification.
    The component uses the Card component to hold the notification name, description, image, icon, date and checkmark.
    The component uses the GetIcon function to display the icon of the notification.

    @param props.notification - The notification data to display.
    @param props.deleteNotification - The callback function to call when the notification is deleted.

*/
const Notification = (props) => {
    var notification = props.notification
    var [active, setActive] = useState(true)
    const navigate = useNavigate()
    const date = new Date(notification.createdAt)
    return <Card key={notification.id} onAnimationEnd={()=>{}} className={active? "ycard" : "fadecard"} onClick={()=>navigate(notification.redirect)} data-testid="notification-card">
            <CardContent className="pt-4 pl-4 pr-2 pb-0">
                <CardTitle className="flex flex-row justify-between">
                    <div className="flex flex-col" data-testid="notification-view">
                        {GetIcon(notification.icon)}
                        {notification.title}
                    </div>
                    {notification.image &&
                        <img data-testid="notification-image" src={notification.image} className="h-14 w-14"/>
                    }
                    
                </CardTitle>
                <CardDescription>{notification.content}</CardDescription>
                
            </CardContent>
            <CardFooter className="px-2 pt-0 pb-2 flex flex-row items-end justify-between">
                
                <CardDescription className="text-gray-600 px-2">{date.toLocaleString()}</CardDescription>
                <Button variant="secondary" size="sm" onClick={(e)=>{e.stopPropagation(); props.deleteNotification(notification.id)}} >
                    <Check className="text-white"/>
                </Button>
            </CardFooter>
        </Card>
    
}

export default Notification