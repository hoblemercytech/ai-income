import { useState } from 'react';
import { COURSE } from '../config';
import { ArrowIcon, MailIcon, ShieldIcon, SparkleIcon } from './Icons';

export default function Hero() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <span className="pill"><span className="pill__dot" />{COURSE.cohort} · Limited seats</span>

          <h1 className="hero__title">
            Build your <span className="text-lime">AI</span>
            <br />
            <span className="text-grad">income</span> system.
          </h1>

          <p className="hero__lead">
            Create scroll-stopping AI videos, grow a faceless audience, and turn your creative
            workflow into paid opportunities — all with free tools.
          </p>

          <div className="hero__cta">
            <a href="#enroll" className="btn btn-primary btn-lg">Secure your seat <ArrowIcon /></a>
            <a href="#curriculum" className="btn btn-ghost btn-lg">Explore the blueprint</a>
          </div>

          <ul className="trust">
            <li><ShieldIcon /> Receipt-reviewed access</li>
            <li><MailIcon /> Class link sent to your email</li>
          </ul>
        </div>

        <div className="flyer">
          <div className="flyer__frame">
            {imgOk ? (
              <img
                src="/flyer.jpg"
                alt="AI Income Blueprint flyer: create aesthetic AI videos with free tools, build an audience, earn without showing your face."
                onError={() => setImgOk(false)}
              />
            ) : (
              <div className="flyer__fallback">
                <SparkleIcon width={48} height={48} />
                <strong>AI Income Blueprint</strong>
                <span>Create. Grow. Earn.</span>
              </div>
            )}
          </div>
          <div className="flyer__price">
            <div>
              <p className="flyer__label">Early bird access</p>
              <p className="flyer__amount">{COURSE.priceLabel}</p>
            </div>
            <a href="#enroll" className="btn btn-light">Join now</a>
          </div>
        </div>
      </div>
    </section>
  );
}
