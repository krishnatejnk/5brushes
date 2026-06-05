import './About.css'

export default function About() {
  return (
    <main className="page about-page">
      <div className="container">

        <div className="about-layout">
          <div className="about-text">
            <h1>About 3 Brushes</h1>
            <div className="about-divider" />
            <p>
              3 Brushes is a curated online art marketplace dedicated to connecting collectors with
              original artworks from talented artists around the world. We believe that art should be
              accessible, personal, and authentic.
            </p>
            <p>
              Our gallery represents artists who are exceptionally talented, capturing moments,
              emotions, and perspectives that most people never get to see. From contemporary abstracts
              to traditional landscapes, our collection spans every medium and style.
            </p>
            <p>
              For every artist on 3 Brushes, we carefully vet each submission to ensure you are
              discovering genuine, one-of-a-kind artworks. Each transaction directly supports an
              independent artist — that is the heart of everything we do.
            </p>
            <p>
              Our mission is to be the destination for anyone who appreciates art, whether you're a
              first-time buyer or a seasoned collector. Every artwork tells a story. We help you find yours.
            </p>
          </div>

          <div className="about-visual">
            <div className="about-visual-card">
              <img src="/logo.png" alt="3 Brushes" className="about-logo" />
              <h2>3 Brushes</h2>
              <p>Art Gallery & Marketplace</p>
              <div className="about-stats">
                <div className="about-stat">
                  <strong>100%</strong>
                  <span>Original Works</span>
                </div>
                <div className="about-stat">
                  <strong>Direct</strong>
                  <span>Artist Connection</span>
                </div>
                <div className="about-stat">
                  <strong>Global</strong>
                  <span>Artist Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-section">
          <h2>Contact Us</h2>
          <p className="contact-sub">Have a question? We'd love to hear from you.</p>
          <div className="about-divider" />
          <div className="contact-grid">
            <div className="field">
              <label>Name</label>
              <input placeholder="Your name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" />
            </div>
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Message</label>
            <textarea placeholder="How can we help you?" style={{ minHeight: 120 }} />
          </div>
          <button className="btn btn-primary" style={{ marginTop: 20 }}>Submit</button>
        </div>

      </div>
    </main>
  )
}
