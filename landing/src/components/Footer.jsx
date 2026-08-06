import React from 'react';
import { useDemoModal } from '../context/DemoModalContext';

export default function Footer() {
  const { openDemoModal } = useDemoModal();

  return (
    <>
      {/* Final CTA (Dark Band) */}
      <section id="demo" className="cta-band">
        <div className="container">
          <div className="cta-wrapper">
            <h2>See your first PCF, published to the dataspace.</h2>
            <p>Book a 30-minute demo and we'll walk through a footprint end to end, from BOM to a live Catena-X digital twin.</p>
            <button type="button" className="btn btn-primary-dark" id="btnBookDemo" onClick={openDemoModal}>
              <span>Book a demo</span>
              <span className="btn-arrow">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        {/* Decorative forest landscape — sustainable automotive theme */}
        <div className="footer-scene" aria-hidden="true">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
            {/* Back mountain range */}
            <path
              className="scene-mountains"
              d="M0,200 L150,110 L280,175 L430,80 L560,165 L720,95 L880,170 L1030,105 L1180,175 L1320,120 L1440,165 L1440,320 L0,320 Z"
            />

            {/* Wind turbines (renewable energy) on the ridge — blades spin */}
            <g className="scene-turbines">
              <g transform="translate(300 122)">
                <path className="turbine-pole" d="M-2,0 L2,0 L1.4,120 L-1.4,120 Z" />
                <g className="turbine-blades">
                  <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite" />
                  <path d="M0,0 C-3,-14 -3,-32 0,-42 C3,-32 3,-14 0,0 Z" />
                  <path d="M0,0 C-3,-14 -3,-32 0,-42 C3,-32 3,-14 0,0 Z" transform="rotate(120)" />
                  <path d="M0,0 C-3,-14 -3,-32 0,-42 C3,-32 3,-14 0,0 Z" transform="rotate(240)" />
                </g>
                <circle r="3" />
              </g>
              <g transform="translate(1150 112)">
                <path className="turbine-pole" d="M-2,0 L2,0 L1.5,130 L-1.5,130 Z" />
                <g className="turbine-blades">
                  <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 0 0" to="360 0 0" dur="6.5s" repeatCount="indefinite" />
                  <path d="M0,0 C-3,-16 -3,-36 0,-46 C3,-36 3,-16 0,0 Z" />
                  <path d="M0,0 C-3,-16 -3,-36 0,-46 C3,-36 3,-16 0,0 Z" transform="rotate(120)" />
                  <path d="M0,0 C-3,-16 -3,-36 0,-46 C3,-36 3,-16 0,0 Z" transform="rotate(240)" />
                </g>
                <circle r="3.4" />
              </g>
              <g transform="translate(1350 150)">
                <path className="turbine-pole" d="M-1.6,0 L1.6,0 L1.1,90 L-1.1,90 Z" />
                <g className="turbine-blades">
                  <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 0 0" to="360 0 0" dur="9.5s" repeatCount="indefinite" />
                  <path d="M0,0 C-2.4,-11 -2.4,-25 0,-32 C2.4,-25 2.4,-11 0,0 Z" />
                  <path d="M0,0 C-2.4,-11 -2.4,-25 0,-32 C2.4,-25 2.4,-11 0,0 Z" transform="rotate(120)" />
                  <path d="M0,0 C-2.4,-11 -2.4,-25 0,-32 C2.4,-25 2.4,-11 0,0 Z" transform="rotate(240)" />
                </g>
                <circle r="2.6" />
              </g>
            </g>

            {/* Mid hill with pine trees */}
            <g className="scene-mid">
              <path d="M0,235 C180,200 320,225 500,210 C700,193 900,235 1100,212 C1260,194 1360,222 1440,208 L1440,320 L0,320 Z" />
              <g className="sway">
                <path d="M210,235 l16,32 h-32 Z M210,215 l13,26 h-26 Z M210,198 l10,20 h-20 Z" />
                <path d="M620,232 l18,36 h-36 Z M620,210 l14,28 h-28 Z M620,192 l11,22 h-22 Z" />
                <path d="M980,236 l16,32 h-32 Z M980,216 l13,26 h-26 Z M980,199 l10,20 h-20 Z" />
                <path d="M1290,233 l17,34 h-34 Z M1290,212 l13,26 h-26 Z M1290,195 l10,20 h-20 Z" />
              </g>
            </g>

            {/* Front hill with mixed trees + driving car */}
            <g className="scene-front">
              <path d="M0,275 C220,250 360,282 560,268 C780,252 980,288 1180,270 C1300,259 1380,278 1440,270 L1440,320 L0,320 Z" />
              <g className="sway">
                {/* broadleaf trees */}
                <path d="M120,275 a34,34 0 1 1 0,-1 Z M112,270 h16 v22 h-16 Z" />
                <path d="M400,278 a30,30 0 1 1 0,-1 Z M393,274 h14 v20 h-14 Z" />
                <path d="M840,276 a36,36 0 1 1 0,-1 Z M831,271 h18 v24 h-18 Z" />
                <path d="M1120,278 a30,30 0 1 1 0,-1 Z M1113,274 h14 v20 h-14 Z" />
                {/* tall pines */}
                <path d="M700,285 l22,44 h-44 Z M700,258 l17,34 h-34 Z M700,236 l13,26 h-26 Z" />
                <path d="M1000,285 l20,40 h-40 Z M1000,260 l16,32 h-32 Z M1000,240 l12,24 h-24 Z" />
              </g>
              {/* Automotive focal point — car drives slowly right-to-left across the road */}
              <g transform="translate(0 278) scale(1.15)">
                <g className="scene-car">
                  {/* mirror so the car faces its direction of travel (left) */}
                  <g transform="scale(-1 1)">
                    <path d="M4,-6 C4,-11 6,-12 10,-13 C14,-18 20,-20 28,-20 L40,-20 C48,-20 53,-17 57,-13 L61,-12 C63,-11 64,-9 64,-6 L4,-6 Z" />
                    <circle cx="18" cy="-5" r="5" />
                    <circle cx="48" cy="-5" r="5" />
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>

        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/logowhite.png" alt="Enviraan Logo" className="footer-logo-img" />
              </div>
              <p className="footer-desc">B2B product carbon footprint transparency native to Catena-X dataspaces and PACT alignment.</p>
            </div>

            <div className="footer-links-grid">
              <div>
                <h4 className="footer-column-title">Platform</h4>
                <ul className="footer-links">
                  <li><a href="#platform">Overview</a></li>
                  <li><a href="#platform">Calculations</a></li>
                  <li><a href="#platform">Exchange</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-column-title">How it works</h4>
                <ul className="footer-links">
                  <li><a href="#how-it-works">Requests</a></li>
                  <li><a href="#how-it-works">Questionnaires</a></li>
                  <li><a href="#how-it-works">Digital Twins</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-column-title">Standards</h4>
                <ul className="footer-links">
                  <li><a href="#standards">WBCSD PACT</a></li>
                  <li><a href="#standards">ISO 14067</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-column-title">Resources</h4>
                <ul className="footer-links">
                  <li><a href="#resources">Who It's For</a></li>
                  <li><a href="#demo" onClick={(e) => { e.preventDefault(); openDemoModal(); }}>Book a Demo</a></li>
                  <li><a href="#platform">Governance</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copy">© 2026 Enviraan - Environmental Management Suite.</span>
            <ul className="footer-links" style={{ flexDirection: 'row', gap: '24px' }}>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#contact">Contact Support</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
