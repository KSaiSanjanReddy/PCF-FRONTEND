import React from 'react';
import { motion } from 'framer-motion';

export default function Standards() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 }
    }
  };

  return (
    <section id="standards" className="bg-white">
      <div className="container">
        <motion.div 
          className="standards-grid-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow-tag">STANDARDS & ECOSYSTEM</span>
          <h2>Speaks the standards your supply chain runs on.</h2>
        </motion.div>

        <motion.div 
          className="standards-grid-layout"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1 */}
          <motion.div className="standards-grid-card" variants={cardVariants}>
            <div className="standards-grid-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <h3 className="standards-grid-title">Native to Catena-X</h3>
            <p className="standards-grid-desc">Publish and exchange PCFs as AAS submodels on the Catena-X v9 data model, with the data sovereignty the automotive supply chain demands.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div className="standards-grid-card" variants={cardVariants}>
            <div className="standards-grid-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M22 12H2" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3 className="standards-grid-title">Aligned with PACT</h3>
            <p className="standards-grid-desc">Footprints generated and rated to the WBCSD Partnership for Carbon Transparency methodology, so they're comparable across partners.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div className="standards-grid-card" variants={cardVariants}>
            <div className="standards-grid-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="standards-grid-title">ISO 14067 & GHG Protocol</h3>
            <p className="standards-grid-desc">Calculations follow recognized lifecycle and accounting standards, expressed in CO₂e.</p>
          </motion.div>

          {/* Card 4 */}
          <motion.div className="standards-grid-card" variants={cardVariants}>
            <div className="standards-grid-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
            </div>
            <h3 className="standards-grid-title">Direct exchange</h3>
            <p className="standards-grid-desc">Not on a shared dataspace yet? Request and share primary data peer-to-peer with your suppliers and customers.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
