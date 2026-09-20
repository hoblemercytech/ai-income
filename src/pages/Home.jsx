import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import Curriculum from '../components/Curriculum';
import Steps from '../components/Steps';
import Enroll from '../components/Enroll';
import FAQ from '../components/FAQ';
import { trackVisit } from '../lib/visits';

export default function Home() {
  const { hash } = useLocation();

    useEffect(() => { trackVisit(); }, []);

  // Scroll to #section when arriving from another page (e.g. /status → /#enroll).
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <Hero />
      <Curriculum />
      <Steps />
      <Enroll />
      <FAQ />
    </>
  );
}

