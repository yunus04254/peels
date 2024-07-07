import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Get } from "src/lib/api";
import ResetPassword from "./ResetPassword";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const fetchUsername = async (uid) => {
    try {
      const response = await Get("users/findByUid", { uid: uid });
      if (!response.ok) {
        throw new Error("User not found");
      }
      const userData = await response.json();
      return userData.username;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Email and password are required.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const uid = userCredential.user.uid;
        const username = await fetchUsername(uid);
        if (username) {
          navigate("/home", { state: { username } });
        } else {
          setLoginError("Failed to fetch user data.");
        }
      })
      .catch((error) => {
        setLoginError("Invalid username or password.");
      });
  }

  return (
    <div className="form-container">
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription className="pt-2.5">
            Already a user? Log in to peels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="login_email">Email</Label>
                <Input
                  id="login_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Label htmlFor="login_password">Password</Label>
                <Input
                  id="login_password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {loginError && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "0.75rem",
                      marginTop: "10px",
                    }}
                  >
                    {loginError}
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <ResetPassword />
          <Button data-testid="login" type="submit" onClick={handleLogin}>
            Log in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
