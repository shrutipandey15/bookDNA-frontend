import { Link } from "react-router-dom";
import { BookOpen, Activity, BarChart2, Share2, X, Check } from "lucide-react";
import "./LandingPage.css";

// Personality type samples for the showcase
const PERSONALITIES = [
  { name: "The Grief Romantic", color: "#8B5E83", glyph: "◈", desc: "You return to loss like a favorite song. Sadness isn't something you avoid — it's something you curate." },
  { name: "The Chaos Cartographer", color: "#C4553A", glyph: "✦", desc: "You read to feel everything at once. Your shelf is a controlled demolition of emotions." },
  { name: "The Soft Masochist", color: "#B8964E", glyph: "◇", desc: "You keep picking up books that destroy you — and you wouldn't have it any other way." },
];

const FEATURES = [
  { Icon: BookOpen,  title: "Log What Books Did to You",       desc: "Not ratings. Not reviews. The raw emotional truth — which feelings a book triggered, how intensely, and the one line you can't forget." },
  { Icon: Activity,  title: "Generate Your Reading DNA",        desc: "Our engine maps your emotional patterns across every book into a unique personality profile. Discover who you are as a reader." },
  { Icon: BarChart2, title: "See Your Emotional Fingerprint",   desc: "Heatmaps. Emotion frequency bars. Blind spots you never noticed. Your reading life, visualized like never before." },
  { Icon: Share2,    title: "Share Your Card",                  desc: "A beautiful, shareable DNA card that captures your reading personality in one glance. Post it. Prove it." },
];

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">BOOK <span>DNA</span></div>
          <button className="landing-cta-sm" onClick={onGetStarted}>Sign In</button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-bg" aria-hidden="true" />
        <div className="landing-hero-content">
          <h1 className="landing-h1">
            The emotional fingerprint<br />of your reading life
          </h1>
          <p className="landing-sub">
            Every book you've ever loved changed you in ways you can't articulate. 
            Book DNA maps those changes- tracking the emotions your books triggered, 
            the patterns you didn't know you had, and the reader you've become.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-cta" onClick={onGetStarted}>
              Discover Your DNA
            </button>
            <a href="#how-it-works" className="landing-cta-ghost">See How It Works ↓</a>
          </div>

          <p className="landing-hero-note">Free forever. No ads. No tracking. Just books and feelings.</p>
        </div>
      </section>

      <section className="landing-showcase" aria-label="Example reading personalities">
        <div className="landing-section-inner">
          <h2 className="landing-h2">What kind of reader are you?</h2>
          <p className="landing-section-sub">
            Are you a Grief Romantic who keeps returning to loss? A Chaos Cartographer who reads to feel everything at once?
            Book DNA analyzes your emotional patterns and tells you who you really are as a reader.
          </p>

          <div className="landing-cards">
            {PERSONALITIES.map((p) => (
              <article key={p.name} className="landing-card" style={{ "--lc": p.color }}>
                <div className="landing-card-glow" aria-hidden="true" />
                <div className="landing-card-glyph">{p.glyph}</div>
                <h3 className="landing-card-name">{p.name}</h3>
                <p className="landing-card-desc">{p.desc}</p>
                <div className="landing-card-bars">
                  {[85, 60, 45].map((w, i) => (
                    <div key={i} className="landing-bar-track">
                      <div className="landing-bar-fill" style={{ width: `${w}%`, background: p.color }} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-features" id="how-it-works">
        <div className="landing-section-inner">
          <h2 className="landing-h2">How Book DNA works</h2>
          <p className="landing-section-sub">
            Three books. That's all it takes. Log what they made you feel, 
            and our engine maps your emotional landscape into something you can see.
          </p>

          <div className="landing-steps">
            {FEATURES.map((f, i) => (
              <article key={i} className="landing-step">
                <div className="landing-step-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="landing-step-icon"><f.Icon size={28} /></div>
                <h3 className="landing-step-title">{f.title}</h3>
                <p className="landing-step-desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-emotions">
        <div className="landing-section-inner">
          <h2 className="landing-h2">12 emotions (more to come). Infinite combinations.</h2>
          <p className="landing-section-sub">
            We don't do "liked it" or "didn't like it." Book DNA tracks the real spectrum -
            from devastation to tenderness, from existential dread to quiet wonder. 
            Every reader's fingerprint is unique because every emotional response is unique.
          </p>

          <div className="landing-emo-cloud">
            {["Devastation", "Tenderness", "Rage", "Longing", "Wonder", "Grief", "Euphoria", "Nostalgia", 
              "Dread", "Catharsis", "Melancholy", "Discomfort", "Serenity", "Obsession", "Heartbreak",
              "Awe", "Defiance", "Vulnerability", "Restlessness", "Hope"].map((e, i) => (
              <span key={e} className="landing-emo-tag" style={{ animationDelay: `${i * 0.05}s` }}>{e}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-not">
        <div className="landing-section-inner">
          <h2 className="landing-h2">What Book DNA is <em>not</em></h2>
          <div className="landing-not-grid">
            <div className="landing-not-item">
              <div className="landing-not-x"><X size={16} /></div>
              <p>Not Goodreads. We don't do star ratings or popularity contests.</p>
            </div>
            <div className="landing-not-item">
              <div className="landing-not-x"><X size={16} /></div>
              <p>Not a book tracker. We don't count pages or set reading goals.</p>
            </div>
            <div className="landing-not-item">
              <div className="landing-not-x"><X size={16} /></div>
              <p>Not social media. No feeds, no followers, no noise.</p>
            </div>
            <div className="landing-not-item yes">
              <div className="landing-not-check"><Check size={16} /></div>
              <p>A mirror. A map of how books have shaped your inner emotional life.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-final">
        <div className="landing-section-inner">
          <div className="landing-final-glyph">◈</div>
          <h2 className="landing-final-h2">Your books already changed you.<br />Now see how.</h2>
          <p className="landing-final-sub">
            Add three books. Tag the emotions. Get your DNA.<br />
            It takes two minutes. It changes how you see yourself as a reader.
          </p>
          <button className="landing-cta" onClick={onGetStarted}>
            Start Your Reading DNA
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">BOOK <span>DNA</span></div>
          <p className="landing-footer-copy">
            Built for readers who feel too much. 
            No ads. No data selling. Just the emotional truth of your reading life.
          </p>
          <div className="landing-footer-links">
            <Link to="/reset-password">Reset Password</Link>
            <span className="landing-footer-sep">·</span>
            <a href="https://github.com/topic/bookdna" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <p className="landing-footer-copy-sm">© {new Date().getFullYear()} Book DNA. Made with emotional damage and good taste.</p>
        </div>
      </footer>
    </div>
  );
}