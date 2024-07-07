import React from 'react';
import '../../styles/MainLayout.css';

const Content = ({ title, children }) => {
    return (
        <div className="content">
            {title && <h2>{title}</h2>}
            {children}
        </div>
    );
};

export default Content;
