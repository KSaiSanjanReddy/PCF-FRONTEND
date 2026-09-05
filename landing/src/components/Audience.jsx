import React from 'react';
import { motion } from 'framer-motion';

export default function Audience() {
  return (
    <section id="resources" className="bg-warm-gray">
      <div className="container">
        
        <div className="audience-header">
          <span className="eyebrow-tag accent-style">WHO IT'S FOR</span>
          <h2>Designed for collaborative supply chain action.</h2>
        </div>

        <div className="audience-layout">
          {/* ESG Card */}
          <motion.div 
            className="audience-card"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          >
            <div className="audience-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 11l2 2 4-4" />
              </svg>
            </div>
            <h3 className="audience-title">For sustainability & ESG teams</h3>
            <p className="audience-desc">Replace the spreadsheet scramble. Produce standards compliant PCFs with an auditable quality score, ready for CSRD era reporting and customer disclosure.</p>
          </motion.div>

          {/* Procurement Card */}
          <motion.div 
            className="audience-card"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80, delay: 0.15 }}
          >
            <div className="audience-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h3 className="audience-title">For procurement & supply-chain teams</h3>
            <p className="audience-desc">Get primary footprint data from the suppliers that matter, in one format, on the networks your OEMs already mandate, without chasing inboxes.</p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
