import React, { createContext, useContext, useState, useCallback } from 'react';

const DemoModalContext = createContext(null);

/**
 * Provides a single shared "Book a demo" modal state so that any button
 * anywhere in the app (navbar, hero, footer) can open the same modal.
 */
export function DemoModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDemoModal = useCallback(() => setIsOpen(true), []);
  const closeDemoModal = useCallback(() => setIsOpen(false), []);

  return (
    <DemoModalContext.Provider value={{ isOpen, openDemoModal, closeDemoModal }}>
      {children}
    </DemoModalContext.Provider>
  );
}

export function useDemoModal() {
  const ctx = useContext(DemoModalContext);
  if (!ctx) {
    throw new Error('useDemoModal must be used within a DemoModalProvider');
  }
  return ctx;
}
