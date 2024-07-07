import React, { useEffect, useState } from 'react';
import './../styles/App.css';
import Login from '../components/custom/Login';
import Signup from '../components/custom/Signup';
import '../styles/Welcome.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
function Welcome() {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const {user} = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);
  return (
    <div className="App">
      <header className="App-header">
        <div className="welcome-container">
          <div className="welcome-left">
            <h1>Peels</h1>
            {/* Logo placeholder */}
            {/* <img src="" alt="Peels" /> */}
          </div>
          <div className="welcome-right">
            <div className="form-container">
              {isSignUpActive ? (
                <>
                  <Signup />
                  <p className="alternate-action">
                    Already have an account?{' '}
                    <button onClick={() => setIsSignUpActive(false)}>Log in</button>
                  </p>
                </>
              ) : (
                <>
                  <Login />
                  <p className="alternate-action">
                    Don't have an account?{' '}
                    <button onClick={() => setIsSignUpActive(true)}>Sign up</button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Welcome;
