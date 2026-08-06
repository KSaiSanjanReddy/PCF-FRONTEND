import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { stepsData, pathD } from './PcfWizard';

export default function PcfWizardLight() {
  const containerRef = useRef(null);
  const [hoveredStep, setHoveredStep] = useState(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 20 });
  const xTranslate   = useTransform(smoothProgress, [0.05, 0.95], ["0%", "-62%"]);
  const pathLength   = useTransform(smoothProgress, [0.05, 0.95], [0, 1]);

  return (
    /* White background wrapper — visually distinct from the dark original */
    <div ref={containerRef} className="wizard-scroll-outer wizard-scroll-light">
      <div className="wizard-sticky-wrapper wizard-sticky-light">
        <div className="container">
          <div className="wizard-header">
            <span className="eyebrow-tag accent-style">PROCESS LIFECYCLE</span>
            <h2 className="wizard-title wizard-title-light">How a PCF Request Works.</h2>
            <p className="wizard-subtitle wizard-subtitle-light">
              Scroll down to trace the data flow through our system. Hover over any step to inspect calculated data results.
            </p>
          </div>
        </div>

        {/* Horizontal Track Viewport */}
        <div className="wizard-viewport">
          <motion.div className="wizard-track" style={{ x: xTranslate }}>
            <div className="wizard-svg-container">
              <svg viewBox="0 0 2400 400" width="2400" height="400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background dashed track — lighter on white */}
                <path
                  d={pathD}
                  stroke="rgba(22, 163, 74, 0.12)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="12 12"
                />
                {/* Animated filled curve */}
                <motion.path
                  d={pathD}
                  stroke="url(#greenGradientLight)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  style={{ pathLength }}
                />
                <defs>
                  <linearGradient id="greenGradientLight" x1="0" y1="200" x2="2400" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#16a34a" />
                    <stop offset="50%"  stopColor="#8FE000" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Nodes and cards */}
            {stepsData.map((step, index) => (
              <div
                key={index}
                className="wizard-step-node"
                style={{ left: step.x, top: step.y }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Dot */}
                <motion.div
                  className="wizard-dot wizard-dot-light"
                  whileHover={{ scale: 1.3 }}
                  animate={{
                    boxShadow: hoveredStep === index
                      ? "0 0 20px #16a34a"
                      : "0 0 8px rgba(22, 163, 74, 0.3)"
                  }}
                >
                  {step.num}
                </motion.div>

                {/* Card */}
                <motion.div
                  className={`wizard-card wizard-card-light ${hoveredStep === index ? 'hovered' : ''}`}
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

                {/* Hover data panel */}
                {hoveredStep === index && (
                  <motion.div
                    className="wizard-calc-panel wizard-calc-panel-light"
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
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
