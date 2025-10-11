import Image from 'next/image';

export default function Header() {
  return (
    <header>
      <h1>
        <Image
          className="logo"
          src="/img/favicon/favicon.svg"
          alt="Logo"
          width={24}
          height={24}
          priority
        />
        <nobr>New Hampshire</nobr> Emerging Technologies Caucus
      </h1>
      <p>Fostering Innovation, Collaboration, and Progress</p>
    </header>
  );
}

