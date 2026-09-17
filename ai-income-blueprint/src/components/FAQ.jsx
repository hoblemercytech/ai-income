import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from './Icons';

const ITEMS = [
  {
    q: 'How is my payment confirmed?',
    a: 'We check every receipt against our PalmPay account. When the transfer matches, your seat is approved and your class link is emailed to you.',
  },
  {
    q: 'Where does the class happen?',
    a: 'In a private WhatsApp group. Lessons are shared there as voice notes, so you can learn at your own pace.',
  },
  {
    q: 'How do I join the WhatsApp group?',
    a: 'After approval, open the email we send and tap “Join the class group”. It opens WhatsApp and adds you to the group in one tap.',
  },
  {
    q: 'I haven’t received the email. What should I do?',
    a: (
      <>
        Check your spam or promotions folder first. You can also see where your payment stands on the{' '}
        <Link to="/status" className="link">status page</Link>.
      </>
    ),
  },
  {
    q: 'Can I resubmit a receipt?',
    a: 'Yes, if your payment was not approved. Submit the form again with the correct receipt. If your first submission is still under review, there is no need to submit again.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section section--tint">
      <div className="container container--narrow">
        <header className="section__head section__head--center">
          <p className="eyebrow">Good to know</p>
          <h2 className="h2">Questions, answered.</h2>
        </header>

        <div className="faq">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`faq__item${isOpen ? ' is-open' : ''}`}>
                <h3 className="faq__q">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    id={`faq-btn-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <PlusIcon className="faq__icon" />
                  </button>
                </h3>
                <div id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} className="faq__a">
                  <div><p>{item.a}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
