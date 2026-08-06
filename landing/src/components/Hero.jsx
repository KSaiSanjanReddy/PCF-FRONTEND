import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useDemoModal } from '../context/DemoModalContext';

export default function Hero() {
  const { openDemoModal } = useDemoModal();
  const visualRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('translate(0, 0) scale(1)');
  const [shadowStyle, setShadowStyle] = useState('0 30px 60px rgba(14, 18, 17, 0.12)');
  // No chart animation state needed — all charts are static

  const { scrollY } = useScroll();
  const yTransform = useTransform(scrollY, [0, 300], [80, 0]);
  const yScroll = useSpring(yTransform, { stiffness: 100, damping: 30, restDelta: 0.001 });


  const handleMouseMove = (e) => {
    if (!visualRef.current) return;
    const rect = visualRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const percentX = (mouseX / rect.width) - 0.5;
    const percentY = (mouseY / rect.height) - 0.5;

    const maxMoveX = 24;
    const maxMoveY = 16;

    const moveX = percentX * maxMoveX;
    const moveY = percentY * maxMoveY;

    setTransformStyle(`translate(${moveX}px, ${moveY}px) scale(1.008)`);
    setShadowStyle(`${-moveX * 0.4}px ${40 - moveY * 0.4}px 80px rgba(14, 18, 17, 0.16)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('translate(0, 0) scale(1)');
    setShadowStyle('0 30px 60px rgba(14, 18, 17, 0.12)');
  };

  // Stagger entry animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <section className="hero-section" style={{ position: 'relative' }}>
      {/* Topographic Hero Background SVG (absolute positioned behind nav & hero) */}
      <div className="hero-topo-bg">
        <svg viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Primary curve — most prominent, thicker stroke */}
          <path d="M-100 150 C200 80, 500 280, 800 180 C1100 80, 1300 240, 1600 170" stroke="rgba(143, 224, 0, 0.28)" strokeWidth="2.5" fill="none" />
          {/* Secondary curve */}
          <path d="M-100 210 C200 140, 500 340, 800 240 C1100 140, 1300 300, 1600 230" stroke="rgba(143, 224, 0, 0.20)" strokeWidth="2" fill="none" />
          {/* Mid curve */}
          <path d="M-100 270 C200 200, 500 400, 800 300 C1100 200, 1300 360, 1600 290" stroke="rgba(143, 224, 0, 0.14)" strokeWidth="1.8" fill="none" />
          {/* Lower curve */}
          <path d="M-100 330 C200 260, 500 460, 800 360 C1100 260, 1300 420, 1600 350" stroke="rgba(143, 224, 0, 0.09)" strokeWidth="1.5" fill="none" />
          {/* Faintest bottom curve */}
          <path d="M-100 390 C200 320, 500 520, 800 420 C1100 320, 1300 480, 1600 410" stroke="rgba(143, 224, 0, 0.06)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', alignItems: 'center' }}>
          
          <motion.div 
            className="hero-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span className="eyebrow-tag" variants={itemVariants}>
              CATENA-X & PACT-READY PCF PLATFORM
            </motion.span>
            <motion.h1 variants={itemVariants}>
              Product carbon footprints your customers can actually trust.
            </motion.h1>
            <motion.p className="hero-subhead" variants={itemVariants}>
              Enviraan calculates PCFs from your bill of materials, scores their data quality, and publishes them as Catena-X digital twins your supply chain can request directly. One workflow, from supplier data to verified footprint.
            </motion.p>
            
            <motion.div className="hero-buttons" variants={itemVariants}>
              <button type="button" className="btn btn-primary" onClick={openDemoModal}>
                <span>Book a demo</span>
                <span className="btn-arrow">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
              <a href="#how-it-works" className="btn btn-secondary">
                <span>See how it works</span>
                <span className="btn-arrow">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </a>
            </motion.div>
            
            <motion.div className="hero-caption" variants={itemVariants}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Aligned with the Catena-X PCF data model (v9.0) and the WBCSD PACT framework.</span>
            </motion.div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, y: 60, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          >
            <motion.div className="dashboard-mock" style={{ y: yScroll }}>
              {/* Sidebar (Left) */}
              <div className="db-sidebar">
                <div className="db-sidebar-header">
                  <div className="db-logo">
                    <img src="/logowhite.png" alt="Enviraan Logo" className="db-logo-img" style={{ height: '40px', width: 'auto' }} />
                  </div>
                </div>
                
                <div className="db-sidebar-menu">
                  <div className="db-menu-item active">
                    <svg className="db-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                    <span>Dashboard</span>
                  </div>
                  <div className="db-menu-item">
                    <svg className="db-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <span>Footprint Connect</span>
                  </div>
                  <div className="db-menu-item">
                    <svg className="db-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    <span>Product Hub</span>
                  </div>
                  <div className="db-menu-item">
                    <svg className="db-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    <span>Components Catalog</span>
                  </div>
                  <div className="db-menu-item">
                    <svg className="db-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span>Evidence Vault</span>
                  </div>
                  <div className="db-menu-item">
                    <svg className="db-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                    <span>Workflow Center</span>
                  </div>
                  <div className="db-menu-item">
                    <svg className="db-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    <span>Analytics Center</span>
                  </div>
                  <div className="db-menu-item">
                    <svg className="db-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                    <span>Data Trust Score</span>
                  </div>
                  <div className="db-menu-item">
                    <svg className="db-menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>Settings</span>
                  </div>
                </div>
                
                <div className="db-kb-box">
                  <div className="db-kb-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <span>Knowledge Base</span>
                  </div>
                  <p className="db-kb-text">Unlock the full potential of Enviraan with our expert-led documentation.</p>
                </div>
              </div>
              
              {/* Main Panel (Right) */}
              <div className="db-main">
                {/* Topbar */}
                <div className="db-topbar">
                  <div className="db-topbar-left">
                    <span className="db-topbar-welcome">Welcome back!</span>
                    <span className="db-topbar-sub">Manage your carbon, product & compliance data</span>
                  </div>
                  <div className="db-topbar-right">
                    <div className="db-search">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <input type="text" placeholder="Search..." disabled />
                    </div>
                    <div className="db-user">
                      <div className="db-user-avatar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <div className="db-user-info">
                        <span className="db-user-name">narasimha</span>
                        <span className="db-user-role">superadmin</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Green Banner */}
                <div className="db-banner">
                  <div className="db-banner-left">
                    <div className="db-banner-icon-bg">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    </div>
                    <div>
                      <h3 className="db-banner-title">Good afternoon, narasimha!</h3>
                      <p className="db-banner-sub">Platform Overview – Product Carbon Intelligence Dashboard</p>
                    </div>
                  </div>
                  <div className="db-banner-stats">
                    <div className="db-banner-stat-card">
                      <span className="db-banner-stat-label">Active Clients</span>
                      <span className="db-banner-stat-val">5/7</span>
                    </div>
                    <div className="db-banner-stat-card">
                      <span className="db-banner-stat-label">Pending Requests</span>
                      <span className="db-banner-stat-val yellow-text">2</span>
                    </div>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="db-stats-row-4">
                  <div className="db-mini-card">
                    <div className="db-mini-card-header">
                      <div className="db-mini-icon-container blue">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      </div>
                    </div>
                    <div className="db-mini-card-content">
                      <span className="db-mini-val">7</span>
                      <span className="db-mini-label">Total Clients</span>
                      <span className="db-mini-sub">5 active</span>
                    </div>
                  </div>
                  <div className="db-mini-card">
                    <div className="db-mini-card-header">
                      <div className="db-mini-icon-container purple">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                      </div>
                    </div>
                    <div className="db-mini-card-content">
                      <span className="db-mini-val">33</span>
                      <span className="db-mini-label">Total Suppliers</span>
                      <span className="db-mini-sub">Across all clients</span>
                    </div>
                  </div>
                  <div className="db-mini-card">
                    <div className="db-mini-card-header">
                      <div className="db-mini-icon-container orange">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                      </div>
                    </div>
                    <div className="db-mini-card-content">
                      <span className="db-mini-val">121</span>
                      <span className="db-mini-label">PCF Requests</span>
                      <span className="db-mini-sub">2 pending approval</span>
                    </div>
                  </div>
                  <div className="db-mini-card">
                    <div className="db-mini-card-header">
                      <div className="db-mini-icon-container green">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
                      </div>
                    </div>
                    <div className="db-mini-card-content">
                      <span className="db-mini-val">119</span>
                      <span className="db-mini-label">Completed</span>
                      <span className="db-mini-sub">Approved PCF</span>
                    </div>
                  </div>
                </div>
                               {/* Charts Row — fully static, no animations */}
                 <div className="db-grid-3">

                  {/* Chart 1 — Client Status (static 3-segment donut) */}
                  <div className="db-chart-panel">
                    <h4 className="db-chart-panel-title">Client Status</h4>
                    <span className="db-chart-panel-sub">Distribution by status</span>
                    <div className="db-donut-wrapper">
                      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                        {/* Background ring */}
                        <circle cx="50" cy="50" r="38" stroke="#e2e8f0" strokeWidth="14" fill="transparent" />
                        {/* Active — 60% green */}
                        <circle cx="50" cy="50" r="38" stroke="#7ED957" strokeWidth="14" fill="transparent"
                          strokeDasharray="143.26 238.76"
                          strokeDashoffset="0"
                        />
                        {/* Inactive — 15% red */}
                        <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="14" fill="transparent"
                          strokeDasharray="35.81 238.76"
                          strokeDashoffset="-143.26"
                        />
                        {/* Pending — 25% orange */}
                        <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="14" fill="transparent"
                          strokeDasharray="59.69 238.76"
                          strokeDashoffset="-179.07"
                        />
                        {/* Center hole */}
                        <circle cx="50" cy="50" r="28" fill="#ffffff" />
                      </svg>
                    </div>
                    <div className="db-chart-legend">
                      <span className="legend-item"><span className="legend-dot green"></span>Active</span>
                      <span className="legend-item"><span className="legend-dot red"></span>Inactive</span>
                      <span className="legend-item"><span className="legend-dot orange"></span>Pending</span>
                    </div>
                  </div>

                  {/* Chart 2 — PCF Request Status (static 4-segment donut) */}
                  <div className="db-chart-panel">
                    <h4 className="db-chart-panel-title">PCF Request Status</h4>
                    <span className="db-chart-panel-sub">Overall request pipeline</span>
                    <div className="db-donut-wrapper">
                      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                        <circle cx="50" cy="50" r="38" stroke="#e2e8f0" strokeWidth="14" fill="transparent" />
                        {/* Completed — 92% green */}
                        <circle cx="50" cy="50" r="38" stroke="#7ED957" strokeWidth="14" fill="transparent"
                          strokeDasharray="219.66 238.76"
                          strokeDashoffset="0"
                        />
                        {/* In Progress — 4% blue */}
                        <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="14" fill="transparent"
                          strokeDasharray="9.55 238.76"
                          strokeDashoffset="-219.66"
                        />
                        {/* Pending — 2% orange */}
                        <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="14" fill="transparent"
                          strokeDasharray="4.78 238.76"
                          strokeDashoffset="-229.21"
                        />
                        {/* Rejected — 2% red */}
                        <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="14" fill="transparent"
                          strokeDasharray="4.78 238.76"
                          strokeDashoffset="-233.99"
                        />
                        {/* Center hole */}
                        <circle cx="50" cy="50" r="28" fill="#ffffff" />
                      </svg>
                    </div>
                    <div className="db-chart-legend">
                      <span className="legend-item"><span className="legend-dot green"></span>Completed</span>
                      <span className="legend-item"><span className="legend-dot blue"></span>In Progress</span>
                      <span className="legend-item"><span className="legend-dot orange"></span>Pending</span>
                      <span className="legend-item"><span className="legend-dot red"></span>Rejected</span>
                    </div>
                  </div>

                  {/* Chart 3 — Top Emitting Clients (static bars) */}
                  <div className="db-chart-panel">
                    <h4 className="db-chart-panel-title">Top Emitting Clients</h4>
                    <span className="db-chart-panel-sub">By total CO₂e emissions</span>
                    <div className="db-horizontal-bar-chart">
                      <div className="hbar-item">
                        <span className="hbar-name">Archana</span>
                        <div className="hbar-bar-container">
                          <div className="hbar-bar" style={{ width: '85%', backgroundColor: '#7ED957' }} />
                        </div>
                      </div>
                      <div className="hbar-item">
                        <span className="hbar-name">hruday</span>
                        <div className="hbar-bar-container">
                          <div className="hbar-bar" style={{ width: '10%', backgroundColor: '#3b82f6' }} />
                        </div>
                      </div>
                      <div className="hbar-item">
                        <span className="hbar-name">vishnu</span>
                        <div className="hbar-bar-container">
                          <div className="hbar-bar" style={{ width: '3%', backgroundColor: '#7ED957' }} />
                        </div>
                      </div>
                      <div className="hbar-item">
                        <span className="hbar-name">cal client</span>
                        <div className="hbar-bar-container">
                          <div className="hbar-bar" style={{ width: '1%', backgroundColor: '#7ED957' }} />
                        </div>
                      </div>
                      <div className="hbar-item">
                        <span className="hbar-name">Shan_mfr</span>
                        <div className="hbar-bar-container">
                          <div className="hbar-bar" style={{ width: '0%', backgroundColor: '#7ED957' }} />
                        </div>
                      </div>
                    </div>
                    <div className="hbar-xaxis">
                      <span>0</span>
                      <span>2000000</span>
                      <span>4000000</span>
                      <span>6000000</span>
                      <span>8000000</span>
                    </div>
                  </div>

                </div>
                
                {/* Bottom Grid */}
                <div className="db-grid-bottom">
                  <div className="db-chart-panel">
                    <h4 className="db-chart-panel-title">Client Drill-Down</h4>
                    <div className="db-dropdown">
                      <span>Search and select a client...</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                  <div className="db-chart-panel">
                    <h4 className="db-chart-panel-title">Recent Activity</h4>
                    <div className="db-activity-list">
                      <div className="db-activity-item">
                        <div className="activity-dot"></div>
                        <span className="activity-text"><strong>Sai Saptan</strong> approved PCF request: <span className="activity-code">PCF-009</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
