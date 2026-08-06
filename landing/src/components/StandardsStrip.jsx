import React from 'react';

export default function StandardsStrip() {
  return (
    <div id="standards" className="standards-strip">
      <div className="container strip-wrapper">
        <span className="strip-label">BUILT ON THE STANDARDS YOUR BUYERS ALREADY REQUIRE</span>
        
        <div className="strip-badges">
          <div className="badge-chip">
            <span className="badge-chip-icon"></span>
            <span>Catena-X PCF v9.0</span>
          </div>
          <div className="badge-chip">
            <span className="badge-chip-icon"></span>
            <span>WBCSD PACT</span>
          </div>
          <div className="badge-chip">
            <span className="badge-chip-icon"></span>
            <span>ISO 14067</span>
          </div>
          <div className="badge-chip">
            <span className="badge-chip-icon"></span>
            <span>GHG Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
