import Image from 'next/image';

export default function MissionSection() {
  return (
    <section id="mission">
      <div className="image-container">
        <Image src="/img/about.webp" alt="About Us Technology" width={400} height={400} />
      </div>
      <div className="content-container">
        <h2>Mission</h2>
        <p>
          As technological advancements accelerate, New Hampshire&apos;s economy must adapt to remain competitive.
          The Emerging Technologies Caucus is dedicated to ensuring the state&apos;s economy harnesses the
          potential of emerging technologies and drives growth.
        </p>
        <p>
          Guided by a philosophy of <a href="https://a16z.com/the-techno-optimist-manifesto/" target="_blank" rel="noopener noreferrer">Techno-Optimism</a>, 
          we champion progress and innovation while advocating for thoughtful governance that maximizes societal and economic benefits. 
          Our focus areas include:
        </p>
        <ul>
          <li>Educating policymakers about emerging technologies and their economic impact</li>
          <li>Supporting entrepreneurialism and workforce development initiatives</li>
          <li>Safeguarding consumer privacy and responsible technology deployment</li>
          <li>Fostering collaboration and knowledge-sharing between stakeholders</li>
          <li>Promoting forward-thinking policymaking for sustainable innovation and growth</li>
        </ul>
        <p>
          By collaborating to adopt a positive perspective on technological change, we can ensure that New
          Hampshire&apos;s economy stays competitive, innovative, and well-prepared for success in the swiftly
          changing technological landscape.
        </p>
      </div>
    </section>
  );
}

