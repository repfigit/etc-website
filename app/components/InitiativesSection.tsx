import Image from 'next/image';

const initiatives = [
  {
    title: 'Artificial intelligence',
    description: 'Practical education on AI, machine learning, automation, and public-sector adoption.',
  },
  {
    title: 'Blockchain technology',
    description: 'Clear policy conversations around digital assets, ledgers, identity, and open infrastructure.',
  },
  {
    title: 'Advanced nuclear',
    description: 'Exploration of next-generation energy technologies that can strengthen reliability and growth.',
  },
  {
    title: 'Government efficiency',
    description: 'Modern tools and workflows that help public institutions deliver better services.',
  },
  {
    title: 'Privacy and cybersecurity',
    description: 'Consumer protection, data governance, and security practices that keep pace with innovation.',
  },
  {
    title: 'STEM and workforce',
    description: 'Talent pipelines, education partnerships, and skills development for emerging industries.',
  },
  {
    title: 'Technology entrepreneurship',
    description: 'Policies that help founders, researchers, and employers build in New Hampshire.',
  },
];

export default function InitiativesSection() {
  return (
    <section id="initiatives">
      <div className="image-container">
        <Image src="/img/initiatives.webp" alt="Technology Initiatives" width={400} height={400} style={{ height: 'auto' }} />
      </div>
      <div className="content-container">
        <p className="section-kicker">Focus Areas</p>
        <h2>Initiatives</h2>
        <div className="initiative-grid">
          {initiatives.map((initiative) => (
            <article className="initiative-card" key={initiative.title}>
              <strong>{initiative.title}</strong>
              <p>{initiative.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
