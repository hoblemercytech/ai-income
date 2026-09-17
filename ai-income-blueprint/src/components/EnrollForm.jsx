import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { COUNTRIES, STATES } from '../data/locations';
import { AlertIcon, ArrowIcon, CheckIcon, CloseIcon, FileIcon, MailIcon, UploadIcon } from './Icons';

const LEVELS = [
  { value: 'beginner', label: 'Beginner', hint: 'New to AI tools' },
  { value: 'intermediate', label: 'Intermediate', hint: 'Tried a few tools' },
  { value: 'advanced', label: 'Advanced', hint: 'Already creating' },
];

const SOURCES = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'none', label: 'None' },
];

const MAX_SIZE = 8 * 1024 * 1024;
const FILE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const INITIAL = {
  fullName: '',
  email: '',
  whatsapp: '',
  country: 'NG',
  state: '',
  level: '',
  referral: '',
};

const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function Field({ label, htmlFor, error, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <p className="error" id={`${htmlFor}-error`}>{error}</p>}
    </div>
  );
}

export default function EnrollForm() {
  const [form, setForm] = useState(INITIAL);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [doneEmail, setDoneEmail] = useState('');
  const fileRef = useRef(null);
  const formRef = useRef(null);
  const topRef = useRef(null);

  const stateOptions = STATES[form.country];

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const clearError = (name) =>
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    clearError(name);
  };

  const onCountry = (e) => {
    setForm((f) => ({ ...f, country: e.target.value, state: '' }));
    clearError('country');
  };

  const pickFile = (f) => {
    if (!f) return;
    if (!FILE_TYPES[f.type]) {
      setErrors((e) => ({ ...e, receipt: 'Upload a PNG, JPG, WEBP or PDF file.' }));
      return;
    }
    if (f.size > MAX_SIZE) {
      setErrors((e) => ({ ...e, receipt: 'This file is larger than 8MB. Upload a smaller screenshot.' }));
      return;
    }
    setFile(f);
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : '');
    clearError('receipt');
  };

  const removeFile = () => {
    setFile(null);
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const validate = () => {
    const e = {};
    if (form.fullName.trim().length < 2) e.fullName = 'Enter your full name.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.';
    const digits = form.whatsapp.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) e.whatsapp = 'Enter a valid WhatsApp number.';
    if (!form.country) e.country = 'Select your country.';
    if (!form.state.trim()) e.state = stateOptions ? 'Select your state.' : 'Enter your state or region.';
    if (!form.level) e.level = 'Choose your current level.';
    if (!form.referral) e.referral = 'Choose where you heard about the program.';
    if (!file) e.receipt = 'Upload your payment receipt.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector('.has-error');
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first?.querySelector('input, select')?.focus({ preventScroll: true });
      });
      return;
    }

    setSubmitting(true);
    const email = form.email.trim().toLowerCase();

    try {
      // Stop duplicates before uploading anything.
      const { data: existing, error: checkError } = await supabase.rpc('get_enrollment_status', {
        p_email: email,
      });
      if (checkError) throw new Error('We could not reach the server. Check your connection and try again.');

      const current = existing?.[0]?.status;
      if (current === 'pending') {
        throw new Error('A payment with this email is already under review. There is no need to submit again.');
      }
      if (current === 'approved') {
        throw new Error('This email is already approved. Check your inbox and spam folder for your class link.');
      }

      const ext = FILE_TYPES[file.type];
      const path = `${new Date().toISOString().slice(0, 10)}/${makeId()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error('Your receipt did not upload. Check your connection and try again.');

      const countryName = COUNTRIES.find((c) => c.code === form.country)?.name || form.country;

      const { error: insertError } = await supabase.from('enrollments').insert({
        full_name: form.fullName.trim(),
        email,
        whatsapp: form.whatsapp.trim(),
        country: countryName,
        state: form.state.trim(),
        level: form.level,
        referral_source: form.referral,
        receipt_path: path,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('This email already has a submission under review or approved.');
        }
        throw new Error('Your details were not saved. Please try again.');
      }

      setDoneEmail(email);
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (doneEmail) {
    return (
      <div ref={topRef} className="card form-card success" role="status">
        <span className="success__icon"><CheckIcon width={28} height={28} /></span>
        <h3 className="h3">Your payment is being reviewed.</h3>
        <p className="muted">
          We’re confirming your transfer now. Once it’s confirmed, you’ll be added to the class: your
          private WhatsApp group link will be sent to <strong className="text-white">{doneEmail}</strong>.
          Tap the link in that email to join the group.
        </p>
        <div className="notice">
          <MailIcon />
          <span>Don’t see the email after approval? Check your spam or promotions folder.</span>
        </div>
        <Link to="/status" className="btn btn-primary btn-block btn-lg">
          Check my payment status <ArrowIcon />
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} className="card form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-card__head">
        <p className="eyebrow">One last step</p>
        <h3 className="h3">Register your seat.</h3>
        <p className="muted">Use the same name and number you’ll use in the class.</p>
      </div>

      <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
        <input
          id="fullName"
          name="fullName"
          className="input"
          value={form.fullName}
          onChange={onChange}
          autoComplete="name"
          placeholder="e.g. Ada Okafor"
          aria-invalid={!!errors.fullName}
        />
      </Field>

      <div className="field-row">
        <Field label="Email address" htmlFor="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            className="input"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck="false"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
          />
        </Field>

        <Field label="WhatsApp number" htmlFor="whatsapp" error={errors.whatsapp}>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            className="input"
            value={form.whatsapp}
            onChange={onChange}
            autoComplete="tel"
            placeholder="0800 000 0000"
            aria-invalid={!!errors.whatsapp}
          />
        </Field>
      </div>

      <div className="field-row">
        <Field label="Country" htmlFor="country" error={errors.country}>
          <div className="select-wrap">
            <select id="country" name="country" className="input" value={form.country} onChange={onCountry}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </Field>

        <Field label={stateOptions ? 'State' : 'State / region'} htmlFor="state" error={errors.state}>
          {stateOptions ? (
            <div className="select-wrap">
              <select
                id="state"
                name="state"
                className={`input${form.state ? '' : ' is-placeholder'}`}
                value={form.state}
                onChange={onChange}
                aria-invalid={!!errors.state}
              >
                <option value="" disabled>Select state</option>
                {stateOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ) : (
            <input
              id="state"
              name="state"
              className="input"
              value={form.state}
              onChange={onChange}
              autoComplete="address-level1"
              placeholder="Your state or region"
              aria-invalid={!!errors.state}
            />
          )}
        </Field>
      </div>

      <fieldset className={`field${errors.level ? ' has-error' : ''}`}>
        <legend className="label">Your current level</legend>
        <div className="choices choices--3">
          {LEVELS.map((l) => (
            <label key={l.value} className={`choice${form.level === l.value ? ' is-active' : ''}`}>
              <input type="radio" name="level" value={l.value} checked={form.level === l.value} onChange={onChange} />
              <span className="choice__title">{l.label}</span>
              <span className="choice__hint">{l.hint}</span>
            </label>
          ))}
        </div>
        {errors.level && <p className="error">{errors.level}</p>}
      </fieldset>

      <fieldset className={`field${errors.referral ? ' has-error' : ''}`}>
        <legend className="label">Where did you hear about the program?</legend>
        <div className="chips">
          {SOURCES.map((s) => (
            <label key={s.value} className={`chip${form.referral === s.value ? ' is-active' : ''}`}>
              <input type="radio" name="referral" value={s.value} checked={form.referral === s.value} onChange={onChange} />
              {s.label}
            </label>
          ))}
        </div>
        {errors.referral && <p className="error">{errors.referral}</p>}
      </fieldset>

      <div className={`field${errors.receipt ? ' has-error' : ''}`}>
        <span className="label">Payment receipt</span>
        {!file ? (
          <label
            className={`dropzone${dragging ? ' is-dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
          >
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <span className="dropzone__icon"><UploadIcon /></span>
            <span className="dropzone__text">
              <span className="dropzone__title">Upload your receipt</span>
              <span className="dropzone__hint">PNG, JPG, WEBP or PDF · max 8MB</span>
            </span>
          </label>
        ) : (
          <div className="file">
            {preview ? (
              <img src={preview} alt="Receipt preview" className="file__thumb" />
            ) : (
              <span className="file__thumb file__thumb--icon"><FileIcon /></span>
            )}
            <span className="file__meta">
              <strong>{file.name}</strong>
              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </span>
            <button type="button" className="icon-btn" onClick={removeFile} aria-label="Remove receipt">
              <CloseIcon />
            </button>
          </div>
        )}
        {errors.receipt && <p className="error">{errors.receipt}</p>}
      </div>

      {serverError && (
        <div className="alert" role="alert">
          <AlertIcon />
          <span>{serverError}</span>
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
        {submitting ? (
          <><span className="spinner" aria-hidden="true" /> Submitting…</>
        ) : (
          <>Submit for verification <ArrowIcon /></>
        )}
      </button>

      <p className="fine center">
        By submitting, you confirm this receipt belongs to your enrollment. Access is granted only after review.
      </p>
    </form>
  );
}
