import React from 'react';
import { motion } from 'framer-motion';

export default function Comparison() {
  return (
    <section className="bg-warm-gray">
      <div className="container">
        <motion.div 
          className="compare-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow-tag accent-style">THE ENVIRAAN ADVANTAGE</span>
          <h2>Why teams move off spreadsheets.</h2>
        </motion.div>

        {/* Desktop Comparison Table */}
        <motion.div 
          className="compare-table-wrapper"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          <table className="compare-table">
            <thead>
              <tr>
                <th>Spreadsheets & email</th>
                <th>Enviraan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon red">✕</span>
                    <span>Footprints rebuilt by hand each time</span>
                  </div>
                </td>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon green">✓</span>
                    <span>Calculated from your BOM automatically</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon red">✕</span>
                    <span>No quality score, relying on trust alone</span>
                  </div>
                </td>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon green">✓</span>
                    <span>PACT-aligned Data Quality Rating on every PCF</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon red">✕</span>
                    <span>PDFs lost in inboxes</span>
                  </div>
                </td>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon green">✓</span>
                    <span>Published as Catena-X digital twins</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon red">✕</span>
                    <span>Supplier requests ignored or off-format</span>
                  </div>
                </td>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon green">✓</span>
                    <span>Guided questionnaires matched to the required standard</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon red">✕</span>
                    <span>Starts over for every customer</span>
                  </div>
                </td>
                <td>
                  <div className="compare-row">
                    <span className="compare-icon green">✓</span>
                    <span>Reuse and update one source of truth</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* Mobile Grid Cards (Replaces table on small screens) */}
        <div className="compare-cards-wrapper">
          <div className="compare-card">
            <div className="compare-card-title">
              <span>Comparison 01</span>
            </div>
            <div className="compare-card-body">
              <div className="compare-card-item">
                <span className="compare-card-label">Spreadsheets & email</span>
                <span className="compare-card-value text-red" style={{ color: '#EF4444' }}>✕ Footprints rebuilt by hand each time</span>
              </div>
              <div className="compare-card-item">
                <span className="compare-card-label">Enviraan</span>
                <span className="compare-card-value text-green" style={{ color: '#5A9300' }}>✓ Calculated from your BOM automatically</span>
              </div>
            </div>
          </div>

          <div className="compare-card">
            <div className="compare-card-title">
              <span>Comparison 02</span>
            </div>
            <div className="compare-card-body">
              <div className="compare-card-item">
                <span className="compare-card-label">Spreadsheets & email</span>
                <span className="compare-card-value text-red" style={{ color: '#EF4444' }}>✕ No quality score, relying on trust alone</span>
              </div>
              <div className="compare-card-item">
                <span className="compare-card-label">Enviraan</span>
                <span className="compare-card-value text-green" style={{ color: '#5A9300' }}>✓ PACT-aligned Data Quality Rating on every PCF</span>
              </div>
            </div>
          </div>

          <div className="compare-card">
            <div className="compare-card-title">
              <span>Comparison 03</span>
            </div>
            <div className="compare-card-body">
              <div className="compare-card-item">
                <span className="compare-card-label">Spreadsheets & email</span>
                <span className="compare-card-value text-red" style={{ color: '#EF4444' }}>✕ PDFs lost in inboxes</span>
              </div>
              <div className="compare-card-item">
                <span className="compare-card-label">Enviraan</span>
                <span className="compare-card-value text-green" style={{ color: '#5A9300' }}>✓ Published as Catena-X digital twins</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
