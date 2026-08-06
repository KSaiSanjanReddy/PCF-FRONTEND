import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoModal } from '../context/DemoModalContext';

// Web3Forms access key. Set VITE_WEB3FORMS_ACCESS_KEY in .env.local,
// or paste the key directly in place of the fallback string below.
const WEB3FORMS_ACCESS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE';

const ArrowIcon = () => (
  <span className="btn-arrow">
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export default function DemoModal() {
  const { isOpen, closeDemoModal } = useDemoModal();
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const firstFieldRef = useRef(null);

  // Reset to a fresh form each time the modal opens, lock body scroll,
  // and wire up Escape-to-close.
  useEffect(() => {
    if (!isOpen) return;

    setStatus('idle');
    setErrorMsg('');

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeDemoModal();
    };
    document.addEventListener('keydown', onKeyDown);

    // Focus the first field shortly after the open animation begins.
    const focusTimer = setTimeout(() => firstFieldRef.current?.focus(), 80);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isOpen, closeDemoModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !WEB3FORMS_ACCESS_KEY ||
      WEB3FORMS_ACCESS_KEY === 'PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE'
    ) {
      setStatus('error');
      setErrorMsg(
        'The form is not configured yet. Add your Web3Forms access key to start receiving requests.'
      );
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const company = (data.get('company') || '').toString().trim();
    const name = (data.get('name') || '').toString().trim();

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New demo request${company ? ` from ${company}` : ''} — Enviraan`,
      from_name: 'Enviraan Website',
      name,
      email: data.get('email'),
      company,
      phone: data.get('phone') || '',
      message: data.get('message') || '',
      // Honeypot: bots fill this hidden field; Web3Forms then rejects the submission.
      botcheck: data.get('botcheck') || '',
    };

    setStatus('submitting');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
        setErrorMsg(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="demo-modal-overlay"
          onMouseDown={(e) => {
            // Only close when the backdrop itself (not the card) is clicked.
            if (e.target === e.currentTarget) closeDemoModal();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="demo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <button
              type="button"
              className="demo-modal-close"
              onClick={closeDemoModal}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            {status === 'success' ? (
              <div className="demo-success">
                <div className="demo-success-icon" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 id="demo-modal-title">Request received</h3>
                <p>
                  Thanks — your demo request is on its way to our team. We'll get
                  back to you within one business day.
                </p>
                <button type="button" className="btn btn-primary demo-submit" onClick={closeDemoModal}>
                  <span>Done</span>
                  <ArrowIcon />
                </button>
              </div>
            ) : (
              <>
                <div className="demo-modal-head">
                  <span className="eyebrow-tag">BOOK A DEMO</span>
                  <h3 id="demo-modal-title">See your first PCF, end to end.</h3>
                  <p>
                    Share a few details and we'll set up a 30-minute walkthrough
                    for your team.
                  </p>
                </div>

                <form className="demo-form" onSubmit={handleSubmit} noValidate>
                  {/* Honeypot anti-spam field (hidden from real users) */}
                  <input
                    type="checkbox"
                    name="botcheck"
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ display: 'none' }}
                    aria-hidden="true"
                  />

                  <div className="demo-field">
                    <label htmlFor="demo-name" className="demo-label">Full name</label>
                    <input
                      ref={firstFieldRef}
                      id="demo-name"
                      name="name"
                      type="text"
                      className="demo-input"
                      placeholder="Jane Doe"
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="demo-field">
                    <label htmlFor="demo-email" className="demo-label">Work email</label>
                    <input
                      id="demo-email"
                      name="email"
                      type="email"
                      className="demo-input"
                      placeholder="jane@company.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="demo-row">
                    <div className="demo-field">
                      <label htmlFor="demo-company" className="demo-label">Company</label>
                      <input
                        id="demo-company"
                        name="company"
                        type="text"
                        className="demo-input"
                        placeholder="Acme Automotive"
                        required
                        autoComplete="organization"
                      />
                    </div>
                    <div className="demo-field">
                      <label htmlFor="demo-phone" className="demo-label">
                        Phone <span className="demo-optional">(optional)</span>
                      </label>
                      <input
                        id="demo-phone"
                        name="phone"
                        type="tel"
                        className="demo-input"
                        placeholder="+49 …"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="demo-field">
                    <label htmlFor="demo-message" className="demo-label">
                      What would you like to see? <span className="demo-optional">(optional)</span>
                    </label>
                    <textarea
                      id="demo-message"
                      name="message"
                      className="demo-input demo-textarea"
                      placeholder="e.g. Catena-X publishing, data quality scoring…"
                      rows={2}
                    />
                  </div>

                  {status === 'error' && (
                    <p className="demo-error-text" role="alert">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary demo-submit"
                    disabled={status === 'submitting'}
                  >
                    <span>{status === 'submitting' ? 'Sending…' : 'Send request'}</span>
                    {status !== 'submitting' && <ArrowIcon />}
                  </button>

                  <p className="demo-privacy">
                    By submitting, you agree to be contacted about your demo.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
