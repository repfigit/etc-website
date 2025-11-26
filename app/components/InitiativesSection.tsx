import Image from 'next/image';

export default function InitiativesSection() {
  return (
    <section id="initiatives">
      <div className="image-container">
        <Image src="/img/initiatives.webp" alt="Technology Initiatives" width={400} height={400} style={{ height: 'auto' }} />
      </div>
      <div className="content-container">
        <h2>Initiatives:</h2>
        <ul>
          <li><strong>Artificial intelligence</strong> and machine learning</li>
          <li><strong>Blockchain technology</strong> and its many applications</li>
          <li><strong>Advanced nuclear</strong> and clean energy technologies</li>
          <li><strong>Government efficiency</strong> through innovation and technology adoption</li>
          <li><strong>Consumer data privacy</strong> and cybersecurity best practices</li>
          <li><strong>STEM education</strong> and workforce development</li>
          <li><strong>Technology entrepreneurship</strong> and economic growth</li>
        </ul>
      </div>
    </section>
  );
}

