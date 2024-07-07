import {Card, 
    CardContent,
    CardFooter,
    CardDescription,
    CardHeader,
    CardTitle,
} from "src/components/ui/card";

import "src/styles/components/Leaderboard.css";
import LeaderBoardRow from "src/components/custom/LeaderboardRow";
import {useEffect, useState} from "react";
import { useAuth } from "src/context/AuthContext";
import { useMediaQuery } from "@react-hook/media-query"
import { Avatar, AvatarImage, AvatarFallback } from "src/components/ui/avatar";
import ConfettiExplosion from "react-confetti-explosion";

function ViewLeaderboard(props) {

const [users, setUsers] = useState({}); 
const {user} = useAuth();
const [loading, setLoading] = useState(true);
const canDisplayChart = useMediaQuery("(min-width: 600px)");
const [isExploding, setIsExploding] = useState(false);

//fetch a given subset of users from props
useEffect(() => {
    async function fetchData() {
        setUsers(await props.getUsers());       
        setLoading(false);
        return () => {};
    }
    fetchData();
}, []);

useEffect(() => {
    let timeoutId = null;
    if (!loading &&  canDisplayChart) {
    timeoutId = setTimeout(() => {
        setIsExploding(true);
        setTimeout(() => {
        setIsExploding(false);
        }, 2700); // Duration of confetti explosion animation
    }, 2700); // Delay before triggering confetti explosion
    }

    return () => {
    clearTimeout(timeoutId);
    };
}, [loading]);

if (loading) {
    return;
}

var user1 = null;
var user2 = null;
var user3 = null;
var enoughUsers = users.length >= 3;
if (enoughUsers ){
    user1 = users[0];
    user2 = users[1];
    user3 = users[2];
}

return (
    <Card className="mt-6 w-full overflow-auto inner-border cream">
        <CardHeader className="">
            <CardTitle className="mx-auto double-border-text sm:text-lg md:text-2xl lg:text-4xl">{props.title}</CardTitle>
            <CardDescription className="mx-auto text-center leaderboard-description md:text-xl">
                   {props.description}
            </CardDescription>
            {canDisplayChart && enoughUsers && <div className="mx-auto flex flex-row gap-5">
                {user2 &&
                <div className="second-place flex flex-col justify-center fade-2">
                    <Avatar className="second-place-icon w-[10vh] h-[10vh] mx-auto roll-right">
                        <AvatarImage src={user2.favPfp} />
                        <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                    <img src="podiumrank2.png" className="w-[8vh] h-[8vh] mx-auto"/>
                    <h1 className="text-center font-bold brown">{user2.username}</h1>
                    <h1 className="text-center font-bold brown">{user2.xp} XP</h1>
                </div>
                }
                {user1 &&
                <div className="first-place flex flex-col justify-center fade-1">
                    <Avatar className="first-place-icon w-[15vh] h-[15vh] mx-auto">
                        <AvatarImage src={user1.favPfp} />
                        <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                    <img src="podiumrank1.png" className="w-[13vh] h-[13vh] mx-auto "/>
                    <h1 className="text-center font-bold brown">{user1.username}</h1>
                    <h1 className="text-center font-bold brown">{user1.xp} XP</h1>
                </div>
                }
                {isExploding && <ConfettiExplosion className="absolute top-[30%] bottom-[50%] left-[60%] right-[50%]" particleSize={10} force={0.7} duration={3000} particleCount={35} width={1600} />}
                {user3 &&
                <div className="third-place flex flex-col justify-center fade-3">
                    <Avatar className="third-place-icon w-[10vh] h-[10vh] mx-auto roll-left">
                        <AvatarImage src={user3.favPfp} />
                        <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                    <img src="podiumrank3.png" className="w-[8vh] h-[8vh] mx-auto"/>
                    <h1 className="text-center font-bold brown">{user3.username}</h1>
                    <h1 className="text-center font-bold brown">{user3.xp} XP</h1>
                </div>
                }
            </div>}
        </CardHeader>
       
        <CardContent className="pl-0 pr-0 pb-0 max-h-[50vh] overflow-auto">

        {canDisplayChart && enoughUsers && 
        <div className="leaderboard-frame">
            {users.map((competer, index) => {
                if (index >= 3) {
                    return (
                        <div className="">
                            <LeaderBoardRow key={index} rank={index + 1} user={competer} xp={competer.xp} logged_in_user={user} />
                        </div>
                    );
                }
                return null; // Skip rendering for the first 3 elements
            })}
        </div>
        }
        {(!canDisplayChart || !enoughUsers) &&
        <div className="leaderboard-frame">
            {users.map((competer, index) => {
                return (
                    <LeaderBoardRow key={index} rank={index+1} user={competer} xp={competer.xp} logged_in_user={user}/>
                );
            })}
        </div>
        }

        </CardContent>
    </Card>
);
}

export default ViewLeaderboard;