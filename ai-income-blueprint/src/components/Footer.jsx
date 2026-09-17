import { Link } from 'react-router-dom';
import Brand from './Brand';
import { ShieldIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Brand />
          <p className="muted">Built for creators ready to move.</p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <a href="/#curriculum">Curriculum</a>
          <a href="/#enroll">Enroll</a>
          <Link to="/status">Check status</Link>
        </nav>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} AI Income Blueprint by HoblemercyTech</span>
        <span className="footer__secure"><ShieldIcon width={16} height={16} /> Secure receipt handling</span>
      </div>
    </footer>
  );
}
