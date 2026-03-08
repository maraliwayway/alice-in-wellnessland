"use client";


const STARS = Array.from({ length: 90 }, (_, i) => ({
    id: i,
    left: `${(i * 137.508) % 100}%`,
    top: `${(i * 97.3) % 100}%`,
    size: `${(i % 4) * 0.5 + 0.5}px`,
    dur: `${2 + (i % 5)}s`,
    del: `${(i % 10) * 0.5}s`,
    lo: `${0.05 + (i % 4) * 0.04}`,
    hi: `${0.4 + (i % 3) * 0.2}`,
}));

export default function HomePage() {
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --black:   #080808;
          --hot:     #FF2D6B;
          --pink:    #FF6FA8;
          --violet:  #C84BFF;
          --cyan:    #00E5FF;
          --gold:    #FFD166;
          --lime:    #B5FF5A;
          --white:   #FAFAFA;
          --muted:   rgba(250,250,250,0.55);
        }

        html { scroll-behavior: smooth; }
        body {
          background: var(--black);
          font-family: 'Lora', serif;
          overflow-x: hidden;
          color: var(--white);
        }

        .star {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
          background: white;
          animation: twinkle var(--dur) ease-in-out infinite;
          animation-delay: var(--del);
        }
        @keyframes twinkle {
          0%,100% { opacity: var(--lo); transform: scale(1); }
          50%      { opacity: var(--hi); transform: scale(1.5); }
        }

        .blob {
          position: fixed; border-radius: 50%; pointer-events: none;
          filter: blur(100px); z-index: 0;
          animation: blobDrift var(--bdur) ease-in-out infinite;
          animation-delay: var(--bdel);
        }
        @keyframes blobDrift {
          0%,100% { transform: translate(0,0) scale(1); opacity: var(--bop1); }
          50%      { transform: translate(var(--bx),var(--by)) scale(1.1); opacity: var(--bop2); }
        }

        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 22px 52px;
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(180deg, rgba(8,8,8,0.88) 0%, transparent 100%);
          backdrop-filter: blur(6px);
        }
        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; font-style: italic;
          color: var(--white); letter-spacing: 0.05em;
          display: flex; align-items: center; gap: 10px;
        }
        .logo-pip {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, var(--hot), var(--violet));
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; box-shadow: 0 0 16px rgba(255,45,107,0.5);
        }
        .nav-btns { display: flex; gap: 10px; }
        .btn-ghost {
          font-family: 'Lora', serif; font-size: 0.78rem; font-weight: 500;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: var(--muted); background: transparent;
          border: 1px solid rgba(250,250,250,0.18);
          padding: 8px 22px; border-radius: 100px; cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover { color: var(--white); border-color: rgba(250,250,250,0.5); background: rgba(250,250,250,0.06); }
        .btn-solid {
          font-family: 'Lora', serif; font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: var(--black);
          background: linear-gradient(135deg, var(--hot), var(--violet));
          border: none; padding: 8px 22px; border-radius: 100px;
          cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(255,45,107,0.4);
        }
        .btn-solid:hover { transform: translateY(-1px); box-shadow: 0 0 32px rgba(255,45,107,0.6); }

        @keyframes linePulse {
          0%,100% { opacity: 0.4; } 50% { opacity: 1; }
        }

        .features {
          position: relative; z-index: 1;
          padding: 110px 48px 120px;
          background: linear-gradient(180deg, transparent 0%, rgba(200,75,255,0.04) 30%, rgba(255,45,107,0.04) 70%, transparent 100%);
        }
        .section-label {
          font-family: 'Lora', serif; font-style: italic;
          color: var(--pink); letter-spacing: 0.22em; font-size: 0.88rem;
          text-align: center; margin-bottom: 10px;
          text-shadow: 0 0 16px rgba(255,111,168,0.4);
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem); font-weight: 700;
          color: var(--white); text-align: center;
          line-height: 1.25; margin-bottom: 68px;
        }
        .section-title span { font-style: italic; color: var(--violet); }

        .cards {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 28px; max-width: 1080px; margin: 0 auto;
        }
        @media (max-width: 860px) {
          .cards { grid-template-columns: 1fr; max-width: 380px; }
          .features { padding: 80px 28px 100px; }
          .navbar { padding: 18px 24px; }
        }

        .wcard {
          position: relative; border-radius: 20px;
          overflow: hidden; cursor: pointer; display: block;
          text-decoration: none; aspect-ratio: 2.5/3.5;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
          border: 1px solid var(--c-border);
        }
        .wcard:nth-child(1) { transform: rotate(-1.5deg); }
        .wcard:nth-child(2) { transform: rotate(0.5deg); }
        .wcard:nth-child(3) { transform: rotate(1.3deg); }
        .wcard:hover { transform: rotate(0deg) translateY(-14px) !important; box-shadow: 0 40px 80px var(--c-shadow), 0 0 40px var(--c-glow); }

        .wcard-journal {
          --c-border: rgba(255,45,107,0.25); --c-shadow: rgba(255,45,107,0.25);
          --c-glow: rgba(255,45,107,0.2); --c-suit: #FF2D6B; --c-tag-text: #FF2D6B;
          background: linear-gradient(160deg, #1a0010 0%, #280018 50%, #140008 100%);
          box-shadow: 0 16px 48px rgba(255,45,107,0.15), 0 0 0 1px rgba(255,45,107,0.1);
        }
        .wcard-insights {
          --c-border: rgba(0,229,255,0.2); --c-shadow: rgba(0,229,255,0.2);
          --c-glow: rgba(0,229,255,0.15); --c-suit: #00E5FF; --c-tag-text: #00E5FF;
          background: linear-gradient(160deg, #00101a 0%, #001824 50%, #000d14 100%);
          box-shadow: 0 16px 48px rgba(0,229,255,0.1), 0 0 0 1px rgba(0,229,255,0.08);
        }
        .wcard-goals {
          --c-border: rgba(255,209,102,0.22); --c-shadow: rgba(255,209,102,0.2);
          --c-glow: rgba(255,209,102,0.15); --c-suit: #FFD166; --c-tag-text: #FFD166;
          background: linear-gradient(160deg, #181000 0%, #221800 50%, #100e00 100%);
          box-shadow: 0 16px 48px rgba(255,209,102,0.1), 0 0 0 1px rgba(255,209,102,0.08);
        }

        .card-rim {
          position: absolute; inset: 10px; border-radius: 13px;
          border: 1px solid var(--c-border); pointer-events: none; z-index: 3;
        }
        .card-grid {
          position: absolute; inset: 0; z-index: 0; opacity: 0.04;
          background-image:
            linear-gradient(var(--c-suit) 1px, transparent 1px),
            linear-gradient(90deg, var(--c-suit) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .cpip {
          position: absolute; z-index: 4;
          font-family: 'Playfair Display', serif; font-weight: 700;
          color: var(--c-suit); line-height: 1; font-size: 1.05rem;
          text-shadow: 0 0 12px var(--c-suit);
        }
        .cpip .letter { display: block; font-size: 0.82rem; font-style: italic; }
        .cpip.tl { top: 18px; left: 18px; }
        .cpip.br { bottom: 18px; right: 18px; transform: rotate(180deg); }

        .card-body {
          position: relative; z-index: 2; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end;
          padding: 24px 22px 28px;
        }
        .card-icon {
          flex: 1; display: flex; align-items: center; justify-content: center;
          font-size: 5rem; margin-top: 44px;
          filter: drop-shadow(0 0 18px var(--c-glow));
          animation: iconFloat 5s ease-in-out infinite;
          animation-delay: var(--icon-del,0s);
        }
        @keyframes iconFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem; font-weight: 700; font-style: italic;
          color: var(--white); text-align: center; margin-bottom: 8px;
          text-shadow: 0 0 20px var(--c-glow);
        }
        .card-desc {
          font-size: 0.84rem; font-style: italic;
          color: rgba(250,250,250,0.5); text-align: center;
          line-height: 1.65; max-width: 210px;
        }
        .card-tag {
          margin-top: 16px; padding: 7px 18px; border-radius: 100px;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          font-family: 'Lora', serif; font-weight: 600;
          background: transparent; color: var(--c-tag-text);
          border: 1px solid var(--c-border);
          transition: all 0.3s ease;
          text-shadow: 0 0 10px var(--c-suit);
        }
        .wcard:hover .card-tag {
          background: var(--c-suit); color: #000;
          box-shadow: 0 0 20px var(--c-glow); text-shadow: none;
        }

        .quote-band {
          position: relative; z-index: 1;
          padding: 80px 48px 100px; text-align: center;
          background: linear-gradient(180deg, transparent, rgba(200,75,255,0.06) 40%, rgba(255,45,107,0.06) 100%);
          border-top: 1px solid rgba(250,250,250,0.06);
        }
        .quote-band::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 60% 70% at 50% 50%, rgba(200,75,255,0.08) 0%, transparent 70%);
        }
        .quote-ornament {
          font-family: 'Playfair Display', serif;
          font-size: 4rem; color: var(--hot); opacity: 0.3;
          line-height: 1; margin-bottom: 16px;
          text-shadow: 0 0 30px rgba(255,45,107,0.5);
        }
        .quote-text {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: clamp(1.3rem, 2.6vw, 1.85rem);
          color: rgba(250,250,250,0.8); max-width: 680px;
          margin: 0 auto; line-height: 1.65;
        }
        .quote-text em { color: var(--gold); font-style: normal; }
        .quote-attr {
          margin-top: 20px; font-size: 0.78rem; letter-spacing: 0.16em;
          text-transform: uppercase; color: rgba(250,250,250,0.28);
        }
        .quote-divider {
          display: flex; align-items: center; justify-content: center;
          gap: 16px; margin-top: 48px; opacity: 0.3;
        }
        .qdline { flex: 1; max-width: 180px; height: 1px; background: linear-gradient(90deg,transparent,var(--pink),transparent); }
      `}</style>

            {/* ── STARS (stable values, no Math.random) ── */}
            {STARS.map((s) => (
                <div key={s.id} className="star" style={{
                    left: s.left, top: s.top,
                    width: s.size, height: s.size,
                    ["--dur" as string]: s.dur,
                    ["--del" as string]: s.del,
                    ["--lo" as string]: s.lo,
                    ["--hi" as string]: s.hi,
                }} />
            ))}

            {/* ── AMBIENT BLOBS ── */}
            <div className="blob" style={{ width: 700, height: 700, background: "#FF2D6B", top: "-10%", left: "-15%", ["--bdur" as string]: "10s", ["--bdel" as string]: "0s", ["--bop1" as string]: "0.07", ["--bop2" as string]: "0.13", ["--bx" as string]: "30px", ["--by" as string]: "20px" }} />
            <div className="blob" style={{ width: 600, height: 600, background: "#FF2D6B", top: "20%", right: "-12%", ["--bdur" as string]: "13s", ["--bdel" as string]: "2s", ["--bop1" as string]: "0.07", ["--bop2" as string]: "0.12", ["--bx" as string]: "-20px", ["--by" as string]: "30px" }} />
            <div className="blob" style={{ width: 500, height: 500, background: "#00E5FF", top: "55%", left: "5%", ["--bdur" as string]: "9s", ["--bdel" as string]: "4s", ["--bop1" as string]: "0.04", ["--bop2" as string]: "0.08", ["--bx" as string]: "25px", ["--by" as string]: "-15px" }} />
            <div className="blob" style={{ width: 400, height: 400, background: "#FFD166", bottom: "5%", right: "10%", ["--bdur" as string]: "11s", ["--bdel" as string]: "1s", ["--bop1" as string]: "0.05", ["--bop2" as string]: "0.09", ["--bx" as string]: "-30px", ["--by" as string]: "10px" }} />

            {/* ── NAVBAR ── */}
            <nav className="navbar">
                <div className="nav-logo">
                    <div className="logo-pip">🐱</div>
                    Alice in Wellnessland
                </div>
                <div className="nav-btns">
                    <button className="btn-ghost">Log In</button>
                    <button className="btn-solid">Sign Up</button>
                </div>
            </nav>


            {/* ── CARDS ── */}
            <section className="features">
                <p className="section-label">✦ choose your path ✦</p>
                <h2 className="section-title">Three doors in the <span>rabbit hole</span></h2>
                <div className="cards">
                    <a href="/journal" className="wcard wcard-journal">
                        <div className="card-grid" /><div className="card-rim" />
                        <div className="cpip tl">♥<span className="letter">J</span></div>
                        <div className="cpip br">♥<span className="letter">J</span></div>
                        <div className="card-body">
                            <div className="card-icon" style={{ ["--icon-del" as string]: "0s" }}>📖</div>
                            <p className="card-title">The Journal</p>
                            <p className="card-desc">Pour your thoughts down the rabbit hole — write freely, speak aloud, and let Gemini reflect your mood back like a mirror that actually tells the truth.</p>
                            <div className="card-tag">Open Journal →</div>
                        </div>
                    </a>
                    <a href="/mood-check-in" className="wcard wcard-insights">
                        <div className="card-grid" /><div className="card-rim" />
                        <div className="cpip tl">♠<span className="letter">I</span></div>
                        <div className="cpip br">♠<span className="letter">I</span></div>
                        <div className="card-body">
                            <div className="card-icon" style={{ ["--icon-del" as string]: "0.6s" }}>🔮</div>
                            <p className="card-title">Personal Insights</p>
                            <p className="card-desc">Check in with how you're feeling today. The Caterpillar asks "Who are you?" — your mood is the first honest answer.</p>
                            <div className="card-tag">Explore Insights →</div>
                        </div>
                    </a>
                    <a href="/goals" className="wcard wcard-goals">
                        <div className="card-grid" /><div className="card-rim" />
                        <div className="cpip tl">♦<span className="letter">G</span></div>
                        <div className="cpip br">♦<span className="letter">G</span></div>
                        <div className="card-body">
                            <div className="card-icon" style={{ ["--icon-del" as string]: "1.2s" }}>🐱</div>
                            <p className="card-title">Goal Setting</p>
                            <p className="card-desc">Set goals that are Specific, Measurable, and real. The Cheshire Cat will keep you on track — even when the path disappears beneath your feet.</p>
                            <div className="card-tag">Set Goals →</div>
                        </div>
                    </a>
                </div>
            </section>

            {/* ── QUOTE ── */}
            <div className="quote-band">
                <div className="quote-ornament">"</div>
                <p className="quote-text">
                    "We're all <em>a little mad</em> here — and that's exactly what makes the journey worth taking."
                </p>
                <p className="quote-attr">— The Cheshire Cat, probably</p>
                <div className="quote-divider">
                    <div className="qdline" />
                    <span style={{ fontSize: "1.1rem" }}>🐱</span>
                    <div className="qdline" />
                </div>
            </div>
        </>
    );
}