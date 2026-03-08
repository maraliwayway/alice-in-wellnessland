import Image from "next/image";
import { IM_Fell_English } from "next/font/google";

const imFell = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-im-fell",
});

// Precomputed so Tailwind/CSS has no runtime calc issues
const particles = [
  { left: "8%",  top: "-6%",  size: "1.4rem", dur: "18s", delay: "0s"    },
  { left: "22%", top: "-4%",  size: "0.9rem", dur: "24s", delay: "3.5s"  },
  { left: "38%", top: "-8%",  size: "1.1rem", dur: "20s", delay: "7s"    },
  { left: "55%", top: "-5%",  size: "0.8rem", dur: "27s", delay: "1.2s"  },
  { left: "70%", top: "-7%",  size: "1.3rem", dur: "22s", delay: "5.8s"  },
  { left: "84%", top: "-4%",  size: "1.0rem", dur: "19s", delay: "10s"   },
  { left: "93%", top: "-6%",  size: "0.85rem",dur: "25s", delay: "4.4s"  },
  { left: "14%", top: "-3%",  size: "0.75rem",dur: "30s", delay: "8.7s"  },
];

// Alternating leaf and butterfly glyphs
const glyphs = ["✦", "❧", "✿", "✦", "❋", "❧", "✿", "✦"];

export default function LoginPage() {
  return (
    <main className={`${imFell.variable} login-root`} style={{ fontFamily: "var(--font-im-fell), 'IM Fell English', serif" }}>
      {/* ── Full-bleed keyhole background ──────────────────── */}
      <div className="login-bg" aria-hidden>
        <Image
          src="/Untitled_design-4.png"
          alt=""
          width={2360}
          height={1640}
          className="login-bg-img"
          priority
          sizes="200vw"
        />
        {/* Dark forest-night overlay */}
        <div className="login-overlay" />
        {/* Subtle green keyhole glow echoing the illustration */}
        <div className="login-glow" />
      </div>

      {/* ── Drifting particles ─────────────────────────────── */}
      <div className="login-particles" aria-hidden>
        {particles.map((p, i) => (
          <span
            key={i}
            className="login-particle"
            style={{
              left: p.left,
              top: p.top,
              fontSize: p.size,
              animationDuration: p.dur,
              animationDelay: p.delay,
            }}
          >
            {glyphs[i]}
          </span>
        ))}
      </div>

      {/* ── Frosted glass card ─────────────────────────────── */}
      <div className="login-card">
        <p className="login-eyebrow">the door to wonderland</p>

        <h1 className="login-title">
          Alice in<br />
          <em>Wellnessland</em>
        </h1>

        <p className="login-subtitle">Step through the keyhole.</p>

        <div className="login-divider" />
      </div>
    </main>
  );
}
