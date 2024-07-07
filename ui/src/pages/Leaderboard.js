import React from "react";
import "react-tabs/style/react-tabs.css";
import ViewLeaderboard from "src/components/custom/ViewLeaderboard";
import { Get } from "src/lib/api";
import { useAuth } from "src/context/AuthContext";
import { Button } from "src/components/ui/button";

const Leaderboard = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = React.useState(0);

  const get_top100users = async () => {
    const response = await Get("users/top_100", null, { user: user });
    const data = await response.json();
    data.sort((a, b) => {
      if (a.xp === b.xp) {
        return a.username.localeCompare(b.username);
      }
      return 0;
    });
    return data;
  };

  const get_friendUsers = async () => {
    const response = await Get(
      "friends/list",
      { userID: user.userID },
      { user: user }
    );
    const data = await response.json();
    //add the user thselves to the list
    data.push(user);
    //sort the list by xp
    data.sort((a, b) => b.xp - a.xp);
    //find users who have same xp and sort by their alphabetical order
    data.sort((a, b) => {
      if (a.xp === b.xp) {
        return a.username.localeCompare(b.username);
      }
      return 0;
    });
    return data;
  };

  const get_top100users_this_month = async () => {
    const response = await Get("users/top_100_this_month", null, {
      user: user,
    });
    console.log(response);

    const data = await response.json();
    console.log(data);
    data.sort((a, b) => {
      console.log(a);
      console.log(b);
      if (a.xp === b.xp) {
        return a.User.username.localeCompare(b.User.username);
      }
      return 0;
    });
    const new_data = data.map((user, index) => {
      return {
        xp: user.xp,
        username: user.User.username,
        favPfp: user.User.favPfp,
      };
    });
    return new_data;
  };

  return (
    <div className="content">
      <div className="flex flex-col gap-4">
        <div className="page-header">
          <div className="flex flex-row items-end gap-3">
            <h1 className="font-bold text-[30px]">Leaderboard</h1>
          </div>
        </div>

        <div className="flex flex-row gap-5 justify-left selector flex-wrap">
          <Button className="cream" onClick={(e) => setSelectedTab(0)}>
            Top 100 All Time
          </Button>
          <Button className="cream" onClick={(e) => setSelectedTab(1)}>
            Top 100 This Month
          </Button>
          <Button className="cream" onClick={(e) => setSelectedTab(2)}>
            Friends
          </Button>
        </div>
        {selectedTab === 0 && (
          <ViewLeaderboard
            getUsers={get_top100users}
            title="Global Leaderboard"
            description="Top 100 All Time"
          />
        )}
        {selectedTab === 1 && (
          <ViewLeaderboard
            getUsers={get_top100users_this_month}
            title="Global Leaderboard"
            description="Top 100 This Month"
          />
        )}
        {selectedTab === 2 && (
          <ViewLeaderboard
            getUsers={get_friendUsers}
            title="Friend Leaderboard"
            description="Beat your friends!"
          />
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
