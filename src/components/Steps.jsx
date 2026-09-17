const STEPS = [
  { title: 'Pay', body: 'Transfer the tuition to the PalmPay account on this page.' },
  { title: 'Register', body: 'Fill in your details and tell us where to send your access.' },
  { title: 'Upload proof', body: 'Attach your transfer receipt so we can confirm it.' },
  { title: 'Join the class', body: 'Once confirmed, your private WhatsApp group link lands in your email.' },
];

export default function Steps() {
  return (
    <section id="how" className="section">
      <div className="container">
        <header className="section__head">
          <p className="eyebrow">Simple by design</p>
          <h2 className="h2">From payment proof to your private class link.</h2>
          <p className="section__lead">
            Pay directly, submit your receipt, and your access is unlocked after a quick manual review.
          </p>
        </header>

        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__body">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
