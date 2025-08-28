import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* VΞW Logo */}
      <div className="text-4xl font-bold text-white mb-2">
        <span className="text-white">V</span>
        <span className="text-white">Ξ</span>
        <span className="text-white">W</span>
      </div>
      {/* Company Name */}
      <div className="text-white text-lg font-medium">
        VIPLAV EDIT WORKS
      </div>
    </div>
  );
};

export default Logo;
