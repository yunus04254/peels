import React from 'react';
import Sidebar from './Sidebar';
import '../../styles/components/MainLayout.css';


const MainLayout = ({ children }) => {
  return (
    <div className="main-wrapper">
      <div className="layout-container">
        <Sidebar />
        {children} {}
      </div>
    </div>
  );
};

export default MainLayout;
