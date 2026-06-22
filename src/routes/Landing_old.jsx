import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import BrushMark from '../components/BrushMark';

export default function Landing() {
  const navigate = useNavigate();
  const rootRef = useRef(null);

  // Scroll-reveal for the glass cards
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.reveal') || [];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    const t = setTimeout(() => els.forEach((el) => el.classList.add('in')), 1800);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <div ref={rootRef}>
      <Nav variant="landing" />

      {/* hero */}
      <section className="hero">
{/*         <div className="eyebrow">Original paintings · India</div> */}
        <h1 className="serif">Original paintings, straight from India's artists.</h1>
        <p>
          A curated home for one-of-a-kind work. Discover paintings you'll live with — or list
          your own and reach collectors across the country.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Explore paintings</button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/artists')}>Sell your art</button>
        </div>
      </section>

{/*        */}{/* gallery wall */}
{/*       <section className="gallery-band"> */}
{/*         <div className="gallery-row"> */}
{/*           {[{ h: 230, r: -2 }, { h: 300, r: 1 }, { h: 260, r: -1 }, { h: 220, r: 2 }].map((f, i) => ( */}
{/*             <div className="frame" key={i} style={{ maxWidth: 250, transform: `rotate(${f.r}deg)` }}> */}
{/*               <div className="placeholder" style={{ height: f.h }}> */}
{/*                 <span className="ph-label">painting</span> */}
{/*               </div> */}
{/*             </div> */}
{/*           ))} */}
{/*         </div> */}
{/*         <div className="scroll-cue">Scroll to explore ↓</div> */}
{/*       </section> */}

      {/* two ways */}
      <section className="two-ways" id="artists">
        <div className="blob" style={{ top: -40, left: '8%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(201,98,46,0.30), transparent 68%)' }} />
        <div className="blob" style={{ bottom: -80, right: '6%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(86,118,168,0.26), transparent 68%)' }} />
        <div className="two-ways__head">
          <h2 className="serif">Two ways in</h2>
          <p>Whether you're here to collect or to create, 5 Brushes is built for you.</p>
        </div>
        <div className="glass-grid">
          {/* buyers */}
          <div className="glass glass--light reveal">
            <div className="eyebrow">For buyers</div>
            <h3 className="serif" style={{ marginTop: 16 }}>Collect original art you'll love</h3>
            <p>
              Browse a curated catalogue of one-of-a-kind paintings by artists across India.
              Every piece is reviewed before it's listed — so you only ever see the real thing.
            </p>
            <ul>
              <li><span>✓</span> Only original, hand-made paintings</li>
              <li><span>✓</span> Curated &amp; reviewed before listing</li>
              <li><span>✓</span> Discover emerging Indian artists</li>
            </ul>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Browse paintings</button>
          </div>
          {/* artists */}
          <div className="glass glass--dark reveal">
            <div className="eyebrow" style={{ color: '#e8915f' }}>For artists</div>
            <h3 className="serif" style={{ marginTop: 16 }}>Sell your paintings to a wider audience</h3>
            <p>
              Create a free artist profile, upload your work, and reach collectors. You stay in
              full control of your portfolio and details.
            </p>
            <div className="steps">
              {['Create profile', 'Upload work', 'Get approved'].map((s, i) => (
                <div className="step" key={i}><b>{i + 1}</b><span>{s}</span></div>
              ))}
            </div>
            <button className="btn" style={{ background: '#f6f2ec', color: '#211c17' }} onClick={() => navigate('/artists')}>
              Join as an artist →
            </button>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="footer">
        <Link to="/" className="nav__brand">
          <BrushMark size={18} />
          <span className="serif footer__name">5 Brushes</span>
        </Link>
        <div className="footer__copy">© {new Date().getFullYear()} 5 Brushes · Made in India 🇮🇳</div>
      </footer>
    </div>
  );
}
