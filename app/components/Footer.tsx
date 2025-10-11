'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer>
      <p>State House Address: 107 North Main Street, Concord, NH 03301</p>
      <p>&copy; <span className="copyright-year">{year}</span> New Hampshire Emerging Technologies Caucus. All rights reserved.</p>
      <p>Made with &#129505; using <a href="https://chatgpt.com/">&#129302;</a> etc.</p>
    </footer>
  );
}

