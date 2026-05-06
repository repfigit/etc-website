import Image from 'next/image';

export default function ContactSection() {
  return (
    <section id="contact">
      <div className="image-container">
        <Image src="/img/contact.webp" alt="Contact Us" width={400} height={400} />
      </div>
      <div className="content-container">
        <p className="section-kicker">Connect</p>
        <h2>Contact Us</h2>
        <p>
          Questions, speaker ideas, policy resources, and partnership opportunities are welcome.
          The caucus is based at the New Hampshire State House in Concord.
        </p>
        
        <div className="contact-info">
          <a className="contact-item" href="mailto:info@emergingtechnh.org">
            <span className="contact-icon" aria-hidden="true">Mail</span>
            <div>
              <strong>Email</strong>
              <span>info@emergingtechnh.org</span>
            </div>
          </a>
          <a className="contact-item" href="https://x.com/EmergingTechNH" target="_blank" rel="noopener noreferrer">
            <span className="contact-icon" aria-hidden="true">X</span>
            <div>
              <strong>X / Twitter</strong>
              <span>@EmergingTechNH</span>
            </div>
          </a>
          <div className="contact-item">
            <span className="contact-icon" aria-hidden="true">NH</span>
            <div>
              <strong>State House Address</strong>
              <span>107 North Main Street, Concord, NH 03301</span>
            </div>
          </div>
        </div>

        <div className="contact-actions">
          <a className="hero-button primary" href="mailto:info@emergingtechnh.org">Start a Conversation</a>
          <a className="hero-button secondary" href="/events">See Upcoming Events</a>
        </div>
      </div>
    </section>
  );
}
