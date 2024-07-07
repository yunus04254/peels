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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Get } from "src/lib/api";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isResetSuccess, setIsResetSuccess] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  async function handleResetPassword(event) {
    event.preventDefault();
    if (!resetEmail) {
      setResetMessage("Please enter your email to reset your password.");
      setIsResetSuccess(false);
      return;
    }
    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setResetMessage("Reset email sent! Check your inbox.");
        setIsResetSuccess(true);
      })
      .catch((error) => {
        setResetMessage("This email is not associated with an account.");
        setIsResetSuccess(false);
      });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Reset Password</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Reset Password</DialogTitle>
        <DialogDescription>
          Enter your email to receive password reset instructions.
        </DialogDescription>
        <Input
          className="w-full"
          id="reset_email"
          type="email"
          placeholder="Email"
          data-testid="reset_email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
        />
        {resetMessage && (
          <p
            style={{
              color: isResetSuccess ? "green" : "red",
              fontSize: "0.75rem",
              marginTop: "10px",
            }}
          >
            {resetMessage}
          </p>
        )}
        <DialogFooter>
          <Button className="button" onClick={handleResetPassword}>
            Send Reset Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPassword;
