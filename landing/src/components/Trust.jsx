import React from 'react';
import { motion } from 'framer-motion';

export default function Trust() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const statVariants = {
    hidden: { opacity: 0, x: 25 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 }
    }
  };

  return (
    <section className="bg-white">
      <div className="container trust-layout">
        
        <motion.div 
          className="trust-info"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow-tag">TRUST & SECURITY</span>
          <h2>Transparent security for product footprints.</h2>
          <p>We build straightforward security controls and calculation transparency into our platform so you always know where your numbers come from. Your data stays under your governance: you choose what to share, when, and with whom.</p>
        </motion.div>

        <motion.div 
          className="trust-stats"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="stat-group">
            {/* Stat 1 */}
            <motion.div className="stat-item" variants={statVariants}>
              <div className="stat-num-placeholder">
                <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <span>10,000+</span>
              </div>
              <span className="stat-label">Products tracked across Bill of Materials</span>
            </motion.div>

            {/* Stat 2 */}
            <motion.div className="stat-item" variants={statVariants}>
              <div className="stat-num-placeholder">
                <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>5,000+</span>
              </div>
              <span className="stat-label">PCFs published to Catena-X data network</span>
            </motion.div>

            {/* Stat 3 */}
            <motion.div className="stat-item" variants={statVariants}>
              <div className="stat-num-placeholder">
                <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>150+</span>
              </div>
              <span className="stat-label">Active suppliers connected in data flow</span>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
