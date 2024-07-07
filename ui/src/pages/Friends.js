import React from 'react';
import FriendsSection from '../components/custom/FriendsSection';

const Friends = () => {
  return (
    <div className='content'>
      <div className="page-header" style = {{fontSize: '30px', fontWeight:'Bold'}}>
        <h1>Friends</h1>
      </div>
      <FriendsSection />
    </div>
  );
};

export default Friends;
