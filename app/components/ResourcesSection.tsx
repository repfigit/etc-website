import Image from 'next/image';

export default function ResourcesSection() {
  return (
    <section id="resources">
      <div className="image-container">
        <Image src="/img/resources.webp" alt="Technology Resources" width={400} height={400} />
      </div>
      <div className="content-container">
        <h2>Resources</h2>
        <p>Access research papers, legislative updates, and white papers on emerging technologies.</p>
        <p>For example:</p>
        <ul>
          <li>
            <a href="https://setr.stanford.edu/" target="_blank" rel="noopener noreferrer">
              Stanford Emerging Technology Review
            </a>
          </li>
          <li>
            <a href="https://www.energy.gov/#:~:text=Exploring%20New%20Horizons" target="_blank" rel="noopener noreferrer">
              U.S. Department of Energy - New Horizons
            </a>
          </li>
          <li>
            <a href="https://www.whitehouse.gov/crypto/" target="_blank" rel="noopener noreferrer">
              White House Working Group Digital Assets Report
            </a>
          </li>
          <li>
            <a href="https://oecd.ai/en/ai-principles/" target="_blank" rel="noopener noreferrer">
              AI Ethics Guidelines
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

