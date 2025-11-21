import Image from 'next/image';

export default function ContactSection() {
  return (
    <section id="contact">
      <div className="image-container">
        <Image src="/img/contact.webp" alt="Contact Us" width={400} height={400} />
      </div>
      <div className="content-container">
        <h2>Contact Us</h2>
        <p>If you have questions or wish to get involved, please reach out.</p>
        <div>
          E-mail: <a href="mailto:info@emergingtechnh.org">info@emergingtechnh.org</a>
        </div>
        <div>
          X/Twitter: <a href="https://x.com/EmergingTechNH" target="_blank" rel="noopener noreferrer">@EmergingTechNH</a>&nbsp;
          <span className="flashing-cursor"></span>
        </div>
      </div>
    </section>
  );
}

