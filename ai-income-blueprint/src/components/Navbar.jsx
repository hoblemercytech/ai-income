import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowIcon, CloseIcon, MenuIcon } from './Icons';
import Brand from './Brand';

const LINKS = [
  { href: '/#curriculum', label: 'Curriculum' },
  { href: '/#how', label: 'How it works' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/status', label: 'Check status', route: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  const renderLink = (l) =>
    l.route ? (
      <Link key={l.href} to={l.href} onClick={close}>{l.label}</Link>
    ) : (
      <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
    );

  return (
    <header className={`nav${scrolled || open ? ' nav--solid' : ''}`}>
      <div className="container nav__inner">
        <Link to="/" onClick={close} aria-label="AI Income Blueprint home">
          <Brand />
        </Link>

        <nav className="nav__links" aria-label="Main">
          {LINKS.map(renderLink)}
          <a href="/#enroll" className="btn btn-primary btn-sm">Enroll now</a>
        </nav>

        <button
          type="button"
          className="nav__toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          {LINKS.map(renderLink)}
          <a href="/#enroll" className="btn btn-primary btn-block btn-lg" onClick={close}>
            Secure your seat <ArrowIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}
