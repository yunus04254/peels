import { Avatar, AvatarImage, AvatarFallback } from "src/components/ui/avatar";
import { Link } from 'react-router-dom';

function LeaderboardRow(props) {

    const isUserBeingDisplayed = props.user.username === props.logged_in_user.username;

    return (
        <div className={`user-frame items-center`}>
            {props.rank===1 && <img src="rank-1.png" alt="Rank 1" className="rank-icon row-transition"></img>}
            {props.rank===2 && <img src="rank-2.png" alt="Rank 2" className="rank-icon row-transition"></img>}
            {props.rank===3 && <img src="rank-3.png" alt="Rank 3" className="rank-icon row-transition"></img>}
            {props.rank>3 && <h2 className="ml-3 rank-number row-transition">{props.rank}.</h2>}
            <Avatar className="profile-icon row-transition">
                <AvatarImage src={props.user.favPfp} />
                <AvatarFallback>User</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden row-transition">
            {isUserBeingDisplayed && <h2 className="selected-user-frame truncate overflow-ellipsis whitespace-normal">You</h2>}
            {!isUserBeingDisplayed && <h2 className="leaderboard-description truncate overflow-ellipsis whitespace-normal">{props.user.username}</h2>}
            </div> 
            <h2 className="ml-auto mr-5 leaderboard-description italic whitespace-nowrap row-transition">{props.xp} XP</h2>
        </div>
    );
}

export default LeaderboardRow;