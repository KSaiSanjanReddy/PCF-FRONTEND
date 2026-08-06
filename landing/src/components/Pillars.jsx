import React from 'react';
import { motion } from 'framer-motion';

export default function Pillars() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 15 }
    }
  };

  return (
    <section id="platform" className="bg-warm-gray">
      <div className="container">
        <motion.div 
          className="pillars-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow-tag">WHAT ENVIRAAN DOES</span>
          <h2>One end-to-end platform for secure footprint management.</h2>
        </motion.div>
        
        <motion.div 
          className="pillars-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Pillar 1 */}
          <motion.div className="pillar-card" variants={cardVariants}>
            <div className="pillar-meta">
              <div className="pillar-icon-row">
                <div className="pillar-icon-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                    <line x1="9" y1="22" x2="9" y2="16" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="16" y1="16" x2="16" y2="22" />
                    <line x1="12" y1="16" x2="12" y2="22" />
                    <line x1="9" y1="16" x2="15" y2="16" />
                    <rect x="8" y="10" width="3" height="3" />
                    <rect x="13" y="10" width="3" height="3" />
                  </svg>
                </div>
                <span className="pillar-num">Pillar 01: Calculate</span>
              </div>
              <h3 className="pillar-title-tagline">Turn a bill of materials into a defensible PCF.</h3>
            </div>
            <div className="pillar-desc-box">
              <p>By importing your product parts and gathering supplier inputs, Enviraan calculates carbon footprints across every stage of the lifecycle: materials, manufacturing, packaging, logistics, and disposal. Whether you need cradle-to-gate or cradle-to-grave reporting, our platform follows the Catena-X v9 model, displaying a step-by-step breakdown instead of a single black-box figure.</p>
            </div>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div className="pillar-card" variants={cardVariants}>
            <div className="pillar-meta">
              <div className="pillar-icon-row">
                <div className="pillar-icon-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="pillar-num">Pillar 02: Exchange</span>
              </div>
              <h3 className="pillar-title-tagline">Publish once. Let the network request it.</h3>
            </div>
            <div className="pillar-desc-box">
              <p>Each footprint is converted into a Catena-X digital twin (Asset Administration Shell submodel) that partners can easily search and access. Inbound requests from customers route directly into Enviraan, allowing you to share data through the secure network instead of managing endless email threads.</p>
            </div>
          </motion.div>

          {/* Underpinning Both */}
          <motion.div className="pillar-card underpinning" variants={cardVariants}>
            <div className="pillar-meta">
              <div className="pillar-icon-row">
                <div className="pillar-icon-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
                <span className="pillar-num" style={{ color: 'var(--color-primary-lime)' }}>Underpinning Both: Data Quality Rating</span>
              </div>
              <h3 className="pillar-title-tagline">A number your customers can audit.</h3>
            </div>
            <div className="pillar-desc-box">
              <p>Every footprint includes a PACT-aligned quality rating that evaluates data age, technology, geography, completeness, and reliability. This means your customers receive a verified, audit-ready score they can actually trust, making your carbon reporting truly valuable.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
