import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Brand from '../components/Brand';
import {
  AlertIcon, CheckIcon, CloseIcon, FileIcon, LogoutIcon, MailIcon, RefreshIcon, SearchIcon,
} from '../components/Icons';

const LEVEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const SOURCE = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', whatsapp: 'WhatsApp', none: 'None' };
const TABS = ['pending', 'approved', 'rejected', 'all'];
const TAB_LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', all: 'All' };

const fmtDate = (d) =>
  new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

const waLink = (num) => {
  let d = String(num).replace(/\D/g, '');
  if (d.startsWith('0')) d = `234${d.slice(1)}`;
  return `https://wa.me/${d}`;
};

export default function Admin() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) {
      setIsAdmin(null);
      return;
    }
    supabase.rpc('is_admin').then(({ data, error }) => setIsAdmin(!error && data === true));
  }, [userId]);

  const signOut = () => supabase.auth.signOut();

  let body;
  if (!ready || (session && isAdmin === null)) {
    body = <div className="admin-center"><span className="spinner spinner--lg" aria-label="Loading" /></div>;
  } else if (!session) {
    body = <Login />;
  } else if (!isAdmin) {
    body = (
      <div className="admin-center">
        <div className="card form-card center">
          <h1 className="h3">This account isn’t an admin.</h1>
          <p className="muted">Sign in with the admin account, or add this user to the admins table in Supabase.</p>
          <button type="button" className="btn btn-ghost btn-block" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  } else {
    body = <Dashboard />;
  }

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="container admin__bar-inner">
          <Link to="/" aria-label="Back to site"><Brand /></Link>
          {session && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={signOut}>
              <LogoutIcon width={18} height={18} /> Sign out
            </button>
          )}
        </div>
      </header>
      {body}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) setError('Incorrect email or password.');
  };

  return (
    <div className="admin-center">
      <form className="card form-card login" onSubmit={submit}>
        <div className="form-card__head">
          <h1 className="h3">Admin sign in</h1>
          <p className="muted">Review receipts and approve students.</p>
        </div>
        <div className="field">
          <label className="label" htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" className="input" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoCapitalize="none" required />
        </div>
        <div className="field">
          <label className="label" htmlFor="admin-pass">Password</label>
          <input id="admin-pass" type="password" className="input" value={password}
            onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </div>
        {error && <div className="alert" role="alert"><AlertIcon /><span>{error}</span></div>}
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? <><span className="spinner" aria-hidden="true" /> Signing in…</> : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState('pending');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const showToast = (text, tone = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ text, tone });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setLoadError(error.message);
    else {
      setLoadError('');
      setRows(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    return () => clearTimeout(toastTimer.current);
  }, [load]);

  const counts = useMemo(
    () =>
      rows.reduce(
        (acc, r) => {
          acc.all += 1;
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        },
        { all: 0, pending: 0, approved: 0, rejected: 0 }
      ),
    [rows]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (tab === 'all' || r.status === tab) &&
        (!q || [r.full_name, r.email, r.whatsapp, r.state, r.country].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [rows, tab, query]);

  const review = async (row, action) => {
    let note = null;
    if (action === 'approve') {
      if (!window.confirm(`Approve ${row.full_name}? They’ll get the class link by email.`)) return;
    } else if (action === 'reject') {
      note = window.prompt('Reason for rejecting (optional, included in their email):', '');
      if (note === null) return;
    } else if (action === 'resend') {
      if (!window.confirm(`Send the class link to ${row.email} again?`)) return;
    }

    setBusyId(row.id);
    const { data, error } = await supabase.functions.invoke('review-enrollment', {
      body: { id: row.id, action, note: note?.trim() || null },
    });

    if (error) {
      let msg = error.message;
      try {
        const payload = await error.context?.json();
        if (payload?.error) msg = payload.error;
      } catch { /* keep default message */ }
      showToast(msg, 'error');
    } else if (data?.emailSent) {
      const done = { approve: 'Approved. Class link sent.', reject: 'Rejected. Student notified.', resend: 'Class link sent again.' };
      showToast(done[action]);
    } else {
      showToast('Status saved, but the email didn’t send. Check your Resend settings.', 'error');
    }

    setBusyId(null);
    load();
  };

  const openReceipt = async (row) => {
    setReceipt({ row, url: '', loading: true, error: '' });
    const { data, error } = await supabase.storage.from('receipts').createSignedUrl(row.receipt_path, 600);
    setReceipt({ row, url: data?.signedUrl || '', loading: false, error: error ? 'Could not load this receipt.' : '' });
  };

  useEffect(() => {
    if (!receipt) return;
    const onKey = (e) => e.key === 'Escape' && setReceipt(null);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [receipt]);

  const isPdf = receipt?.row?.receipt_path?.endsWith('.pdf');

  return (
    <div className="container admin__main">
      <div className="admin__head">
        <h1 className="h3">Enrollments</h1>
        <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          <RefreshIcon width={18} height={18} /> Refresh
        </button>
      </div>

      <div className="stats">
        <div className="stat"><span>Pending</span><strong>{counts.pending}</strong></div>
        <div className="stat"><span>Approved</span><strong>{counts.approved}</strong></div>
        <div className="stat"><span>Rejected</span><strong>{counts.rejected}</strong></div>
        <div className="stat"><span>Total</span><strong>{counts.all}</strong></div>
      </div>

      <div className="toolbar">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t}
              className={`tab${tab === t ? ' is-active' : ''}`} onClick={() => setTab(t)}>
              {TAB_LABEL[t]} <span className="tab__count">{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="search">
          <SearchIcon width={18} height={18} />
          <input type="search" className="input" placeholder="Search name, email, phone, state"
            value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search enrollments" />
        </div>
      </div>

      {loadError && <div className="alert" role="alert"><AlertIcon /><span>{loadError}</span></div>}

      {loading && rows.length === 0 ? (
        <div className="admin-center"><span className="spinner spinner--lg" aria-label="Loading" /></div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p>{query ? 'No enrollments match your search.' : `No ${tab === 'all' ? '' : TAB_LABEL[tab].toLowerCase() + ' '}enrollments yet.`}</p>
        </div>
      ) : (
        <ul className="rows">
          {visible.map((r) => (
            <li key={r.id} className="row card">
              <div className="row__top">
                <div className="row__who">
                  <strong>{r.full_name}</strong>
                  <a href={`mailto:${r.email}`}>{r.email}</a>
                </div>
                <span className={`badge badge--${r.status}`}>{r.status}</span>
              </div>

              <dl className="row__meta">
                <div><dt>WhatsApp</dt><dd><a href={waLink(r.whatsapp)} target="_blank" rel="noreferrer">{r.whatsapp}</a></dd></div>
                <div><dt>Location</dt><dd>{r.state}, {r.country}</dd></div>
                <div><dt>Level</dt><dd>{LEVEL[r.level] || r.level}</dd></div>
                <div><dt>Heard from</dt><dd>{SOURCE[r.referral_source] || r.referral_source}</dd></div>
                <div><dt>Submitted</dt><dd>{fmtDate(r.created_at)}</dd></div>
                {r.email_sent_at && <div><dt>Email sent</dt><dd>{fmtDate(r.email_sent_at)}</dd></div>}
                {r.admin_note && <div className="row__note"><dt>Note</dt><dd>{r.admin_note}</dd></div>}
              </dl>

              <div className="row__actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openReceipt(r)}>
                  <FileIcon width={18} height={18} /> Receipt
                </button>
                {r.status === 'pending' && (
                  <>
                    <button type="button" className="btn btn-danger btn-sm" disabled={busyId === r.id} onClick={() => review(r, 'reject')}>
                      <CloseIcon width={18} height={18} /> Reject
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" disabled={busyId === r.id} onClick={() => review(r, 'approve')}>
                      {busyId === r.id ? <span className="spinner" aria-hidden="true" /> : <CheckIcon width={18} height={18} />} Approve
                    </button>
                  </>
                )}
                {r.status === 'approved' && (
                  <button type="button" className="btn btn-ghost btn-sm" disabled={busyId === r.id} onClick={() => review(r, 'resend')}>
                    {busyId === r.id ? <span className="spinner" aria-hidden="true" /> : <MailIcon width={18} height={18} />} Resend email
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {receipt && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Payment receipt" onClick={() => setReceipt(null)}>
          <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <strong>{receipt.row.full_name}</strong>
              <button type="button" className="icon-btn" onClick={() => setReceipt(null)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>
            <div className="modal__body">
              {receipt.loading && <span className="spinner spinner--lg" aria-label="Loading" />}
              {receipt.error && <p className="error">{receipt.error}</p>}
              {receipt.url && !isPdf && <img src={receipt.url} alt={`Receipt from ${receipt.row.full_name}`} />}
              {receipt.url && isPdf && <p className="muted">This receipt is a PDF.</p>}
            </div>
            {receipt.url && (
              <a href={receipt.url} target="_blank" rel="noreferrer" className="btn btn-light btn-block">
                Open full size
              </a>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast--${toast.tone}`} role="status">
          {toast.tone === 'error' ? <AlertIcon /> : <CheckIcon />}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
