import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* VΞW Logo */}
      <div className="text-4xl font-bold text-white mb-2">
        <span className="text-white">Enviguide</span>
      </div>
      {/* Company Name */}
      <div className="text-white text-lg font-medium">
        Envguide Works
      </div>
    </div>
  );
};

export default Logo;
