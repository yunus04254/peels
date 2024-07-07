import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Get, Post } from "src/lib/api";
import "../../styles/components/FriendsSection.css";

const FriendsSection = () => {
  const { user } = useAuth();
  const [friendsList, setFriendsList] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchIncomingRequests = useCallback(async () => {
    try {
      const response = await Get(
        "friends/incoming",
        { toID: user.userID },
        { user: user }
      );
      if (!response.ok)
        throw new Error("Failed to fetch incoming friend requests");
      const data = await response.json();
      setIncomingRequests(data);
    } catch (error) {
      //console.error("Error fetching incoming friend requests:", error);
      setErrors("Failed to load incoming friend requests");
    }
  }, [user.userID]);

  const fetchFriendsList = useCallback(async () => {
    try {
      const response = await Get("friends/list", null, { user: user });
      if (!response.ok) throw new Error("Failed to fetch friends list");
      const data = await response.json();
      setFriendsList(data);
    } catch (error) {
      //console.error("Error fetching friends list:", error);
      setErrors("Failed to load friends list");
    }
  }, [user.userID]);

  useEffect(() => {
    fetchIncomingRequests();
    fetchFriendsList();
  }, [fetchIncomingRequests, fetchFriendsList]);

  const handleSendFriendRequest = async () => {
    if (!username) {
      setErrors("Username is required to send a friend request");
      return;
    }

    if (username === user.username) {
      setErrors("You cannot send a friend request to yourself!");
      return;
    }

    try {
      const response = await Post(
        "friends/send",
        {
          fromID: user.userID,
          toUsername: username,
        },
        null,
        { user: user }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setUsername("");
      setSuccessMessage("Friend request sent successfully!");
      setErrors("");
    } catch (error) {
      //console.error("Error sending friend request:", error.message);
      setErrors(error.message);
      setSuccessMessage("");
    }
  };

  const handleAcceptFriendRequest = async (friendID) => {
    try {
      const response = await Post(
        "friends/accept",
        {
          userID: user.userID,
          friendID,
        },
        null,
        { user: user }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setIncomingRequests((prev) =>
        prev.filter((request) => request.friendID !== friendID)
      );
      fetchFriendsList();
    } catch (error) {
      //console.error("Error accepting friend request:", error.message);
      setErrors(error.message);
    }
  };

  const handleDeclineFriendRequest = async (friendID) => {
    try {
      const response = await Post(
        "friends/decline",
        {
          userID: user.userID,
          friendID,
        },
        null,
        { user: user }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setIncomingRequests((prev) =>
        prev.filter((request) => request.friendID !== friendID)
      );
    } catch (error) {
      //console.error("Error declining friend request:", error.message);
      setErrors(error.message);
    }
  };

  const handleRemoveFriend = async (friend) => {
    const friendID = friend.userID;
    try {
      const response = await Post(
        "friends/remove",
        {
          friendID: friendID,
        },
        null,
        { user: user }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setFriendsList((prev) => prev.filter((f) => f.userID !== friendID));
    } catch (error) {
      setErrors(error.message);
    }
  };

  return (
    <div className="content">
      <Card className="card-section">
        <CardHeader>
          <CardTitle>Add Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="search">Send a friend request</Label>
          <Input
            id="search"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          {errors && (
            <p style={{ color: "red", fontSize: "0.75rem" }}>{errors}</p>
          )}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        </CardContent>
        <CardFooter>
          <Button className="button" onClick={handleSendFriendRequest}>
            Send Friend Request
          </Button>
        </CardFooter>
      </Card>

      <Card className="card-section">
        <CardHeader>
          <CardTitle>Incoming Friend Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ color: "red", fontSize: "0.75rem" }}></p>
          {incomingRequests.length > 0 ? (
            incomingRequests.map((request) => (
              <Card
                key={request.friendID} // Unique key for each friend request
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  padding: "10px",
                }}
              >
                <span>{request.fromUsername}</span>
                <div>
                  <Button
                    className="button"
                    onClick={() => handleAcceptFriendRequest(request.friendID)}
                  >
                    Accept
                  </Button>
                  <Button
                    className="button"
                    onClick={() => handleDeclineFriendRequest(request.friendID)}
                    style={{ marginLeft: "10px" }}
                  >
                    Decline
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Label>No incoming friend requests</Label>
          )}
        </CardContent>
      </Card>

      <Card className="card-section">
        <CardHeader>
          <CardTitle>My Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {friendsList.length > 0 ? (
            friendsList.map((friend) => (
              <Card
                key={friend.friendID} // Unique key for each friend
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  padding: "10px",
                }}
              >
                <span>{friend.username}</span>
                <Button
                  className="button"
                  onClick={() => handleRemoveFriend(friend)}
                  style={{ marginLeft: "10px" }}
                >
                  Remove Friend
                </Button>
              </Card>
            ))
          ) : (
            <Label>No friends :(</Label>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendsSection;
