import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { EMAIL_RE } from '../components/EnrollForm';
import { AlertIcon, ArrowIcon, CheckIcon, ClockIcon, SearchIcon } from '../components/Icons';

const RESULTS = {
  pending: {
    tone: 'warn',
    icon: ClockIcon,
    title: 'Under review',
    body: 'We’re confirming your transfer. Once it’s approved, your WhatsApp class link will be sent to this email.',
  },
  approved: {
    tone: 'ok',
    icon: CheckIcon,
    title: 'Approved',
    body: 'You’re in. Open the email we sent and tap “Join the class group”. If you can’t find it, check your spam or promotions folder.',
  },
  rejected: {
    tone: 'danger',
    icon: AlertIcon,
    title: 'Not approved',
    body: 'We couldn’t match your receipt to a payment. Check the email we sent for details, then submit again with the correct receipt.',
    cta: true,
  },
  none: {
    tone: 'muted',
    icon: SearchIcon,
    title: 'No submission found',
    body: 'We don’t have a registration for this email. Check the spelling, or register now.',
    cta: true,
  },
};

export default function Status() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const check = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter the email you registered with.');
      return;
    }
    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc('get_enrollment_status', {
      p_email: email.trim().toLowerCase(),
    });
    setLoading(false);
    if (rpcError) {
      setError('We couldn’t check your status right now. Try again in a moment.');
      return;
    }
    setResult(data?.[0]?.status || 'none');
  };

  const info = result ? RESULTS[result] : null;
  const Icon = info?.icon;

  return (
    <section className="page">
      <div className="container container--narrow">
        <header className="section__head">
          <p className="eyebrow">Payment status</p>
          <h1 className="h2">Check where your payment stands.</h1>
          <p className="section__lead">Enter the email you used when you registered.</p>
        </header>

        <form className="card form-card" onSubmit={check} noValidate>
          <div className={`field${error ? ' has-error' : ''}`}>
            <label className="label" htmlFor="status-email">Email address</label>
            <input
              id="status-email"
              type="email"
              inputMode="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="you@example.com"
            />
            {error && <p className="error">{error}</p>}
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" aria-hidden="true" /> Checking…</> : 'Check status'}
          </button>

          {info && (
            <div className={`result result--${info.tone}`} role="status">
              <span className="result__icon"><Icon /></span>
              <div>
                <strong className="result__title">{info.title}</strong>
                <p>{info.body}</p>
                {info.cta && (
                  <a href="/#enroll" className="link link--arrow">Go to registration <ArrowIcon width={16} height={16} /></a>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
