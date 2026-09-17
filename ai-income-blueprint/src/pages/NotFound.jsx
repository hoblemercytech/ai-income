import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page">
      <div className="container container--narrow center">
        <h1 className="h2">This page doesn’t exist.</h1>
        <p className="muted">The link may be wrong or the page has moved.</p>
        <Link to="/" className="btn btn-primary btn-lg">Go to the homepage</Link>
      </div>
    </section>
  );
}
