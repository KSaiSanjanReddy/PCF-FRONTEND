import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StandardsStrip from './components/StandardsStrip';
import Problem from './components/Problem';
import PcfWizard from './components/PcfWizard';

import Pillars from './components/Pillars';
import HowItWorks from './components/HowItWorks';
import Comparison from './components/Comparison';
import Standards from './components/Standards';
import Audience from './components/Audience';
import Trust from './components/Trust';
import Footer from './components/Footer';
import DemoModal from './components/DemoModal';
import { DemoModalProvider } from './context/DemoModalContext';

export default function App() {
  return (
    <DemoModalProvider>
      <div className="app-root">
        <Navbar />
        <main>
          <Hero />
          <StandardsStrip />
          <Problem />
          <PcfWizard />

          <Pillars />
          <HowItWorks />
          <Comparison />
          <Standards />
          <Audience />
          <Trust />
        </main>
        <Footer />
      </div>
      <DemoModal />
    </DemoModalProvider>
  );
}
