import React, { useState } from 'react';
import { useDemoModal } from '../context/DemoModalContext';

const LOGIN_URL = import.meta.env.VITE_APP_LOGIN_URL || '/login';

export default function Navbar() {
  const { openDemoModal } = useDemoModal();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <nav className="navbar">
        <div className="container nav-wrapper">
          <a href="#" className="logo-container" aria-label="Enviraan Home" onClick={closeMenu}>
            <img src="/logoblack.png" alt="Enviraan Logo" className="nav-logo" />
          </a>

          <ul className="nav-links">
            <li><a href="#platform">Platform</a></li>
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#standards">Standards</a></li>
            <li><a href="#resources">Resources</a></li>
          </ul>

          <div className="nav-actions">
            <a href={LOGIN_URL} className="btn btn-secondary nav-btn-desktop nav-login">
              <span>Log in</span>
            </a>
            <button type="button" className="btn btn-primary nav-btn-desktop" onClick={openDemoModal}>
              <span>Book a demo</span>
              <span className="btn-arrow">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            <button
              className={`menu-toggle ${isOpen ? 'active' : ''}`}
              onClick={toggleMenu} 
              aria-label="Toggle Mobile Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`mobile-overlay ${isOpen ? 'open' : ''}`} 
        onClick={closeMenu}
      ></div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
        <ul className="mobile-links">
          <li><a href="#platform" className="mobile-link" onClick={closeMenu}>Platform</a></li>
          <li><a href="#how-it-works" className="mobile-link" onClick={closeMenu}>How it works</a></li>
          <li><a href="#standards" className="mobile-link" onClick={closeMenu}>Standards</a></li>
          <li><a href="#resources" className="mobile-link" onClick={closeMenu}>Resources</a></li>
        </ul>
        <div className="mobile-cta">
          <a href={LOGIN_URL} className="btn btn-secondary mobile-link" style={{ width: '100%', marginBottom: '12px' }} onClick={closeMenu}>
            <span>Log in</span>
          </a>
          <button
            type="button"
            className="btn btn-primary mobile-link"
            style={{ width: '100%' }}
            onClick={() => { closeMenu(); openDemoModal(); }}
          >
            <span>Book a demo</span>
            <span className="btn-arrow">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
