import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const stepsData = [
  {
    num: "01",
    title: "Client Onboard",
    desc: "Set up company profile and authenticate Catena-X data credentials.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    x: 220,
    y: 180,
    details: {
      type: "Configuration Data",
      title: "Organization Verification",
      items: [
        { label: "BPN Identifier", value: "BPNL00000003CS2" },
        { label: "Catena-X Protocol", value: "EDC v0.4.1 Compliant" },
        { label: "Data Sharing Agreement", value: "Active & Encrypted" }
      ]
    }
  },
  {
    num: "02",
    title: "Create PCF Request",
    desc: "Define product boundary, upload Bill of Materials (BOM), and request PCF.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    x: 600, // Shifted to 600 to prevent Step 1 hover overlap
    y: 110,
    details: {
      type: "Scope Definition",
      title: "Boundary Assessment",
      items: [
        { label: "Product ID", value: "PRD-2026-ALUM" },
        { label: "BOM Sub-parts", value: "12 Components identified" },
        { label: "Standard Selection", value: "PACT v2.0 GHG Protocol" }
      ]
    }
  },
  {
    num: "03",
    title: "Assign to Supplier",
    desc: "Map BOM components to specific tier-1 suppliers and trigger request.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    x: 980, // Shifted horizontally
    y: 240, // Positioned upwards
    details: {
      type: "Supplier Linkage",
      title: "Supply Chain Mapping",
      items: [
        { label: "Suppliers Contacted", value: "5 Selected Tier-1s" },
        { label: "Connection Gateway", value: "Vite EDC Connector v2" },
        { label: "Data Request Token", value: "req_token_889a2f1c" }
      ]
    }
  },
  {
    num: "04",
    title: "Supplier Submits Data",
    desc: "Supplier uploads actual fuel, electricity, transport, and material logs.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    x: 1360, // Shifted horizontally
    y: 110,
    details: {
      type: "Primary Inputs",
      title: "Process Inventory Data",
      items: [
        { label: "Aluminum Alloy", value: "2.45 kg raw material input" },
        { label: "Production Power", value: "4.80 kWh process electricity" },
        { label: "Logistics Distance", value: "450 km via road transport" }
      ]
    }
  },
  {
    num: "05",
    title: "Intelligent Mapping",
    desc: "Enviraan maps inputs to ecoinvent carbon factors and scores data quality.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    x: 1740, // Shifted horizontally
    y: 240, // Positioned upwards
    details: {
      type: "Footprint Mapping",
      title: "Emission Factor Calculation",
      items: [
        { label: "Al Alloy Factor", value: "3.25 kg CO2e / kg material" },
        { label: "Electricity Grid", value: "0.38 kg CO2e / kWh power" },
        { label: "Transport Factor", value: "0.12 kg CO2e / tkm road" }
      ]
    }
  },
  {
    num: "06",
    title: "PCF Generated Report",
    desc: "Verify report, compile PCF digital twin, and publish to partners.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    x: 2120, // Shifted horizontally
    y: 180,
    details: {
      type: "Result Summary",
      title: "Consolidated Footprint",
      items: [
        { label: "Total Footprint", value: "9.79 kg CO2e / unit (Cradle-to-Gate)" },
        { label: "Data Quality Rating", value: "1.4 (Highly Reliable / Primary Data)" },
        { label: "PACT Compliance", value: "100% Fully Compliant" }
      ]
    }
  }
];

// SVG Curved Line Path connecting the shifted nodes smoothly
const pathD = "M 100,200 C 150,200 180,180 220,180 C 320,180 500,110 600,110 C 700,110 880,240 980,240 C 1080,240 1260,110 1360,110 C 1460,110 1640,240 1740,240 C 1840,240 2020,180 2120,180 C 2170,180 2230,200 2300,200";

export default function PcfWizard() {
  const containerRef = useRef(null);
  const [hoveredStep, setHoveredStep] = useState(null);

  // Set up Framer Motion scroll hook targeting our wizard outer scroll block
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth scroll progression
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 20 });

  // Map vertical scroll progress (0 to 1) to horizontal movement
  const xTranslate = useTransform(smoothProgress, [0.05, 0.95], ["0%", "-62%"]);
  
  // Transform scroll progress to animate the SVG curved line drawing progress
  const pathLength = useTransform(smoothProgress, [0.05, 0.95], [0, 1]);

  return (
    <div ref={containerRef} id="how-it-works" className="wizard-scroll-outer">
      <div className="wizard-sticky-wrapper">
        <div className="container">
          <div className="wizard-header">
            <span className="eyebrow-tag accent-style">PROCESS LIFECYCLE</span>
            <h2 className="wizard-title">How a PCF Request Works.</h2>
            <p className="wizard-subtitle">Scroll down to trace the data flow through our system. Hover over any step to inspect calculated data results.</p>
          </div>
        </div>

        {/* Horizontal Track Viewport */}
        <div className="wizard-viewport">
          <motion.div 
            className="wizard-track" 
            style={{ x: xTranslate }}
          >
            <div className="wizard-svg-container">
              <svg viewBox="0 0 2400 400" width="2400" height="400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background dashed curve */}
                <path 
                  d={pathD} 
                  stroke="rgba(22, 163, 74, 0.15)" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeDasharray="12 12" 
                />
                
                {/* Active glowing curve drawn on scroll */}
                <motion.path 
                  d={pathD} 
                  stroke="url(#greenGradient)" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  style={{ pathLength: pathLength }}
                />

                {/* SVG Gradient definitions */}
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="200" x2="2400" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="50%" stopColor="#8FE000" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Nodes and cards positioned on the curve */}
            {stepsData.map((step, index) => {
              return (
                <div 
                  key={index} 
                  className="wizard-step-node"
                  style={{ left: step.x, top: step.y }}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Indicator Dot on the Line */}
                  <motion.div 
                    className="wizard-dot"
                    whileHover={{ scale: 1.3 }}
                    animate={{ 
                      boxShadow: hoveredStep === index ? "0 0 20px #16a34a" : "0 0 8px rgba(22, 163, 74, 0.3)"
                    }}
                  >
                    {step.num}
                  </motion.div>

                  {/* Node Step Card */}
                  <motion.div 
                    className={`wizard-card ${hoveredStep === index ? 'hovered' : ''}`}
                    initial={{ opacity: 0.8, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="wizard-card-icon">{step.icon}</div>
                    <h3 className="wizard-card-title">{step.title}</h3>
                    <p className="wizard-card-desc">{step.desc}</p>
                    
                    <div className="wizard-card-hover-tip">
                      <span className="hover-pulse"></span>
                      Hover to view data
                    </div>
                  </motion.div>

                  {/* Calculations & Data Hover Panel */}
                  {hoveredStep === index && (
                    <motion.div 
                      className="wizard-calc-panel"
                      initial={{ opacity: 0, y: 60, scale: 0.95 }}
                      animate={{ opacity: 1, y: 80, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="calc-panel-header">
                        <span className="calc-tag">{step.details.type}</span>
                        <h4>{step.details.title}</h4>
                      </div>
                      <table className="calc-table">
                        <tbody>
                          {step.details.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.label}</td>
                              <td>{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
