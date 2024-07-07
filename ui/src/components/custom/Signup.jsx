
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Progress } from "src/components/ui/progress"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Get, Post } from "src/lib/api";
function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const auth = getAuth();


  const validateEmail = (value) => {
    if (!value || !/\S+@\S+\.\S+/.test(value)) {
      return 'Invalid email format';
    }
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value || !/\S+@\S+\.\S+/.test(value)) {
          return 'Invalid email format';
        }
        break;
      case 'username':
        if (!value.trim()) {
          return 'Username is required';
        }
        break;
      case 'password':
        if (value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
        if (!/\d/.test(value)) {
          return 'Password must contain at least one number';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          return 'Password must contain at least one special character';
        }
        if (!/[A-Z]/.test(value)) {
          return 'Password must contain at least one uppercase letter';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  useEffect(() => {
    // Simple password strength checker
    let strength = 0;
    if (password.length > 5) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name !== 'email') {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
    switch (name) {
      case 'email':
        setEmail(value);
        break;
      case 'username':
        setUsername(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (name === 'email') {
      const error = validateEmail(value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    // Validate all fields before attempting to sign up
    const emailError = validateField('email', email);
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);

    if (emailError || usernameError || passwordError) {
      setErrors({
        ...errors,
        email: emailError,
        username: usernameError,
        password: passwordError
      });
      return;
    }

    try {
      const usernameRes = await Get("users/username-exists", {'username': username});
      const { exists } = await usernameRes.json();
      if (exists) {
        setErrors(prevErrors => ({ ...prevErrors, username: 'Username is already taken' }));
        return;
      }
    } catch (error) {
      setErrors(prevErrors => ({ ...prevErrors, username: 'Unable to check if username exists' }));
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const registerRes = await Post('users/register', { username, email, uid: userCredential.user.uid });
      if (!registerRes.ok) {
        setErrors(prevErrors => ({ ...prevErrors, password: 'Failed to register user in local database'}));
        return;
      }

      alert('Signup successful! Welcome to peels.');
      navigate('/home'); // fix to pass username to dashboard on signup also
      window.location.reload();


    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors(prevErrors => ({ ...prevErrors, email: 'Email is already in use' }));
      } else {
        setErrors(prevErrors => ({ ...prevErrors, general: error.message }));
      }
    }
  };


  return (
    <div className="form-container">
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription className="pt-2.5">Not a user? Sign up to peels!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={email} onChange={handleChange} onBlur={handleBlur} />
                {errors.email && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.email}</p>}
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={username} onChange={handleChange} />
                {errors.username && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.username}</p>}
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={password} onChange={handleChange} />

                {<Progress className="h-3" value={passwordStrength * 25} indicatorClassName={passwordStrength > 2 ? 'bg-green-500' : 'bg-red-500'}/>}


                {errors.password && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.password}</p>}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p></p>
          <Button data-testid="signup" type="submit" onClick={handleSignup}>Sign up</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Signup;

