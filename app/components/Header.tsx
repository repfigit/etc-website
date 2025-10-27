import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header>
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h1>
          <Image
            className="logo"
            src="/img/favicon/favicon.svg"
            alt="Logo"
            width={24}
            height={24}
            priority
          />
          <span style={{ whiteSpace: 'nowrap' }}>New Hampshire</span> Emerging Technologies Caucus
        </h1>
      </Link>
      <p>Fostering Innovation, Collaboration, and Progress</p>
    </header>
  );
}

