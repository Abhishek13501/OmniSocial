import React from 'react';
import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-darkbg flex flex-col">
      <Navbar />
      <div className="flex-1 w-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
