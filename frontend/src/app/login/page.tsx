import Image from "next/image";
import { IM_Fell_English } from "next/font/google";
import PassageAuth from "@/components/PassageAuth";

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
      {/* Force-strip Clerk's white card — bypasses Tailwind processing */}
      <style>{`
        .login-card .cl-rootBox,
        .login-card .cl-card,
        .login-card .cl-cardBox,
        .login-card .cl-main { background: transparent !important; box-shadow: none !important; border: none !important; width: 100% !important; }
        .login-card .cl-header { display: none !important; }
        .login-card .cl-footer { background: transparent !important; border-top: 1px solid rgba(162,190,52,0.15) !important; margin-top: 0.5rem !important; }
        .login-card .cl-footerAction { color: rgba(162,190,52,0.6) !important; }
        .login-card .cl-footerActionLink { color: #a8c23a !important; font-weight: 600 !important; }
        .login-card .cl-socialButtonsBlockButton {
          border-radius: 2px !important; border: 1px solid rgba(162,190,52,0.3) !important;
          background: rgba(255,255,255,0.06) !important; color: #d4cfa8 !important;
        }
        .login-card .cl-socialButtonsBlockButtonText { color: #d4cfa8 !important; }
        .login-card .cl-dividerLine { background: rgba(162,190,52,0.2) !important; }
        .login-card .cl-dividerText { color: rgba(162,190,52,0.5) !important; font-size: 0.75rem !important; }
        .login-card .cl-formFieldLabel { color: #9a9278 !important; font-size: 0.78rem !important; letter-spacing: 0.05em !important; }
        .login-card .cl-formFieldInput {
          border-radius: 2px !important;
          background: rgba(10,14,10,0.65) !important;
          border: 1px solid rgba(162,190,52,0.28) !important;
          color: #f0ebe0 !important;
        }
        .login-card .cl-formFieldInput:focus {
          border-color: rgba(162,190,52,0.65) !important;
          box-shadow: 0 0 0 2px rgba(162,190,52,0.14) !important;
          outline: none !important;
        }
        .login-card .cl-formButtonPrimary {
          border-radius: 2px !important;
          background: linear-gradient(135deg, #5a7a1a, #7ea82a) !important;
          box-shadow: 0 0 20px rgba(108,140,28,0.4) !important;
          color: #f5f0e0 !important; font-weight: 600 !important;
        }
        .login-card .cl-formButtonPrimary:hover { opacity: 0.88 !important; }
        .login-card .cl-identityPreviewText { color: #d4cfa8 !important; }
        .login-card .cl-identityPreviewEditButton { color: #a8c23a !important; }
      `}</style>

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

        <PassageAuth />
      </div>
    </main>
  );
}
