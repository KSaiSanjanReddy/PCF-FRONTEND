import React from 'react';
import { motion } from 'framer-motion';

export default function Problem() {
  return (
    <section className="bg-white">
      <div className="container problem-layout">
        <motion.div 
          className="problem-header"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow-tag accent-style">PROBLEM</span>
          <h2>Carbon requests are now part of winning the deal.</h2>
        </motion.div>
        
        <motion.div 
          className="problem-copy"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <p>What used to be a sustainability nice-to-have is now a standard requirement in RFPs and procurement contracts. Today, both buyers and suppliers are stuck. Your customers expect carbon footprint data, forcing your team to manually calculate values in spreadsheets without clear verification or standard formats. Meanwhile, your suppliers receive similar requests from you and struggle to return data in a way that fits your systems.</p>
          <p>Enviraan bridges this gap. You can easily gather data from suppliers, compute precise footprints, verify data quality, and publish the results so partners can import them directly.</p>
        </motion.div>
      </div>
    </section>
  );
}
