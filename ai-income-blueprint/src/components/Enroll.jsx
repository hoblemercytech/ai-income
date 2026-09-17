import { useState } from 'react';
import { COURSE } from '../config';
import { CheckIcon, CopyIcon } from './Icons';
import EnrollForm from './EnrollForm';

export default function Enroll() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COURSE.accountNumber);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = COURSE.accountNumber;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="enroll" className="section">
      <div className="container">
        <header className="section__head">
          <p className="eyebrow">Reserve your seat</p>
          <h2 className="h2">Make your next move <span className="text-grad">visible.</span></h2>
        </header>

        <div className="enroll">
          <aside className="card pay">
            <div className="pay__top">
              <span className="muted">Early bird tuition</span>
              <strong className="pay__price">{COURSE.priceLabel}</strong>
            </div>

            <p className="pay__via">Pay via {COURSE.bankName}</p>

            <div className="account">
              <div className="account__info">
                <span className="account__label">Account number</span>
                <span className="account__number">{COURSE.accountNumber}</span>
                {COURSE.accountName && <span className="account__name">{COURSE.accountName}</span>}
              </div>
              <button
                type="button"
                className={`icon-btn${copied ? ' is-done' : ''}`}
                onClick={copy}
                aria-label="Copy account number"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
            <p className="copied" aria-live="polite">{copied ? 'Account number copied' : ''}</p>

            <ol className="pay__steps">
              <li>Transfer exactly <strong>{COURSE.priceLabel}</strong> to the account above.</li>
              <li>Save a screenshot or PDF of your receipt.</li>
              <li>Fill the form and upload the receipt.</li>
            </ol>

            <p className="fine">
              We never ask for card details. Payment goes straight to the account above and is
              confirmed from the receipt you submit.
            </p>
          </aside>

          <EnrollForm />
        </div>
      </div>
    </section>
  );
}
