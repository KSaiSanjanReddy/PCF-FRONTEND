import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 15 }
    }
  };

  return (
    <section id="how-it-works" className="bg-white">
      <div className="container">
        <motion.div 
          className="hiw-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow-tag">HOW IT WORKS</span>
          <h2>Seamless integration, compliant outputs.</h2>
        </motion.div>

        <motion.div 
          className="hiw-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Step 1 */}
          <motion.div className="hiw-card" variants={cardVariants}>
            <div className="hiw-num-container">
              <span className="hiw-num">01</span>
              <div className="hiw-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <polyline points="9 15 12 12 15 15" />
                </svg>
              </div>
            </div>
            <h3 className="hiw-title">Request</h3>
            <p className="hiw-desc">Import a product and its BOM. Enviraan maps the components and sends data requests matched to the required standard to the right suppliers.</p>
          </motion.div>

          {/* Step 2 */}
          <motion.div className="hiw-card" variants={cardVariants}>
            <div className="hiw-num-container">
              <span className="hiw-num">02</span>
              <div className="hiw-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
            </div>
            <h3 className="hiw-title">Respond</h3>
            <p className="hiw-desc">Suppliers complete a guided questionnaire matched to the required methodology. Enviraan calculates the footprint and assigns its quality rating.</p>
          </motion.div>

          {/* Step 3 */}
          <motion.div className="hiw-card" variants={cardVariants}>
            <div className="hiw-num-container">
              <span className="hiw-num">03</span>
              <div className="hiw-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
            </div>
            <h3 className="hiw-title">Share</h3>
            <p className="hiw-desc">Publish the finished PCF as a Catena-X digital twin, reaching customers, auditors, and your own reporting in the format they expect.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
