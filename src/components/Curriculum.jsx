const TOPICS = [
  {
    title: 'Aesthetic AI UGC videos',
    body: 'Create short-form product and lifestyle videos with free tools, without showing your face.',
  },
  {
    title: 'AI podcast clips',
    body: 'Produce podcast-style clip videos that hold attention and get shared.',
  },
  {
    title: 'Your faceless AI influencer',
    body: 'Design a consistent AI persona and grow a page around it.',
  },
  {
    title: 'Brand deals and affiliate income',
    body: 'Package your content so brands pay you, and earn commission on products you promote.',
  },
  {
    title: 'Premium promotional flyers',
    body: 'Design eye-catching flyers you can use for your own offers or sell as a service.',
  },
];

export default function Curriculum() {
  return (
    <section id="curriculum" className="section section--tint">
      <div className="container">
        <header className="section__head">
          <p className="eyebrow">Inside the blueprint</p>
          <h2 className="h2">Turn your ideas into an <span className="text-grad">income-ready</span> creative engine.</h2>
        </header>

        <div className="topics">
          {TOPICS.map((t, i) => (
            <article key={t.title} className={`topic${i === 0 ? ' topic--wide' : ''}`}>
              <span className="topic__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="topic__title">{t.title}</h3>
              <p className="topic__body">{t.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
