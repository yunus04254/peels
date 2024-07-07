

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/WelcomeSection.css';

const WelcomeSection = ({ username }) => {
  let navigate = useNavigate();

  const handleNewEntryClick = () => {

    navigate('/journals');
  };

  return (
    <div className="welcome-section">
      <h1>Welcome to Peels, {username}!</h1>
      <p>Your journey to personal growth and reflection starts here.</p>
      <button className="cta-button" onClick={handleNewEntryClick}>
        Start Journaling
      </button>
    </div>
  );
};

export default WelcomeSection;
