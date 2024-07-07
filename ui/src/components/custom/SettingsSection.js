import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import ResetPassword from "./ResetPassword";
import { Post } from "src/lib/api";

const SettingsSection = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [userEditable, setUserEditable] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const makeUserEditable = () => {
    setUserEditable(true);
    clearMessages();
  };

  const clearMessages = () => {
    setMessage("");
    setErrorMessage("");
  };

  const saveUser = async () => {
    clearMessages();

    try {
      const response = await Post(
        "users/changeUsername",
        { newUsername: username },
        null,
        { user: user }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || "Success! You changed your username.");
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Reload the page after 1 second
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "An error occurred while changing your username."
        );
      }
    } catch (error) {
      console.error("Error making request", error);
      setErrorMessage("Someone is using this username already!");
    }
  };

  const handleSaveChanges = async () => {
    if (userEditable && username !== user.username) {
      await saveUser();
    } else if (username === user.username) {
      setErrorMessage("You're already using this username.");
    }
  };

  return (
    <div className="content">
      <Card className="card-section">
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="username">Username</Label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input
              id="username"
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              placeholder="Enter username"
              disabled={!userEditable}
              style={{ marginRight: "10px", flex: 1 }}
            />
            <Button
              className="button"
              onClick={makeUserEditable}
              style={{ padding: "0", minWidth: "30px", minHeight: "30px" }}
              disabled={userEditable}
            >
              ✏️
            </Button>
          </div>
          {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
          {message && <div style={{ color: "green" }}>{message}</div>}
          <br />
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="text"
            value={user.email}
            placeholder="Enter email"
            disabled
          />
          <br />
          <Label htmlFor="password">Password</Label>
          <br />
          <ResetPassword />
        </CardContent>
        <br></br>
        <CardFooter>
          <Button
            className="button save"
            onClick={handleSaveChanges}
            disabled={!username.trim()}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsSection;
