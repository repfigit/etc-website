'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successNotificationRef = useRef<HTMLDivElement | null>(null);
  const errorNotificationRef = useRef<HTMLDivElement | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Scroll to notification when it appears
  useEffect(() => {
    // Clear any existing scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    if (submitStatus === 'success' && successNotificationRef.current) {
      scrollTimeoutRef.current = setTimeout(() => {
        if (successNotificationRef.current) {
          successNotificationRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }
      }, 100);
    } else if (submitStatus === 'error' && errorNotificationRef.current) {
      scrollTimeoutRef.current = setTimeout(() => {
        if (errorNotificationRef.current) {
          errorNotificationRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }
      }, 100);
    }

    // Cleanup function to cancel timeout if component unmounts or status changes
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [submitStatus]);

  const clearNotification = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setErrorMessage('');
        // Increased to 12 seconds
        timeoutRef.current = setTimeout(() => {
          setSubmitStatus('idle');
          setErrorMessage('');
        }, 12000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'There was an error sending your message. Please try again.');
        // Increased to 10 seconds
        timeoutRef.current = setTimeout(() => {
          setSubmitStatus('idle');
          setErrorMessage('');
        }, 10000);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
      // Increased to 10 seconds
      timeoutRef.current = setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 10000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact">
      <div className="image-container">
        <Image src="/img/contact.webp" alt="Contact Us" width={400} height={400} />
      </div>
      <div className="content-container">
        <h2>Contact Us</h2>
        <p>If you have questions or wish to get involved, please reach out.</p>
        
        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <div>
              <strong>E-mail:</strong>{' '}
              <a href="mailto:info@emergingtechnh.org">info@emergingtechnh.org</a>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">🐦</span>
            <div>
              <strong>X/Twitter:</strong>{' '}
              <a href="https://x.com/EmergingTechNH" target="_blank" rel="noopener noreferrer">
                @EmergingTechNH
              </a>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <div>
              <strong>Address:</strong> 107 North Main Street, Concord, NH 03301
            </div>
          </div>
        </div>

        {/* Contact form temporarily hidden */}
        {false && (
          <div className="contact-form-container">
            <h3>Send us a message</h3>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <button type="submit" className="contact-submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              {submitStatus === 'success' && (
                <div ref={successNotificationRef} className="contact-success-message">
                  <div className="contact-notification-content">
                    <span className="contact-notification-icon">✓</span>
                    <span>Thank you! Your message has been sent. We&apos;ll get back to you soon.</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearNotification}
                    className="contact-notification-close"
                    aria-label="Close notification"
                  >
                    ×
                  </button>
                </div>
              )}
              {submitStatus === 'error' && (
                <div ref={errorNotificationRef} className="contact-error-message">
                  <div className="contact-notification-content">
                    <span className="contact-notification-icon">⚠</span>
                    <span>{errorMessage || 'There was an error sending your message. Please try again or email us directly.'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearNotification}
                    className="contact-notification-close"
                    aria-label="Close notification"
                  >
                    ×
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

