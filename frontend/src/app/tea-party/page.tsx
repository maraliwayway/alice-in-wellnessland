import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import JournalEntry from "@/components/JournalEntry";
import JournalCard from "@/components/JournalCard";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

interface JournalEntryDoc {
  _id: string;
  content: string;
  mood: string;
  moodScore: number;
  validation: string;
  affirmation: string;
  moodRating: number | null;
  createdAt: string;
}

async function getEntries(): Promise<JournalEntryDoc[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/journal?userId=demo-user`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { entries: JournalEntryDoc[] };
    return data.entries ?? [];
  } catch {
    return [];
  }
}

// ── Precomputed art positions ─────────────────────────────────────────────────

const spirals = [
  { x: 240,  y: 280, rings: 5, maxR: 112 },
  { x: 960,  y: 470, rings: 6, maxR: 148 },
  { x: 1228, y: 198, rings: 4, maxR:  92 },
  { x: 592,  y: 818, rings: 3, maxR:  66 },
];

const lilyPads = [
  { x: 210, y: 580, r: 52, rot: 15,  drift: "pad-drift-a", rotAnim: "pad-rot-cw",  dur: "22s", delay: "0s"   },
  { x: 295, y: 630, r: 38, rot: -30, drift: "pad-drift-b", rotAnim: "pad-rot-ccw", dur: "28s", delay: "3s"   },
  { x: 155, y: 660, r: 30, rot: 5,   drift: "pad-drift-c", rotAnim: "pad-rot-cw",  dur: "35s", delay: "1.5s" },
  { x: 890, y: 420, r: 58, rot: -10, drift: "pad-drift-b", rotAnim: "pad-rot-ccw", dur: "24s", delay: "2s"   },
  { x: 980, y: 480, r: 44, rot: 25,  drift: "pad-drift-a", rotAnim: "pad-rot-cw",  dur: "30s", delay: "0.8s" },
  { x: 830, y: 460, r: 28, rot: -5,  drift: "pad-drift-c", rotAnim: "pad-rot-ccw", dur: "40s", delay: "4s"   },
  { x: 1180, y: 300, r: 48, rot: 20, drift: "pad-drift-a", rotAnim: "pad-rot-cw",  dur: "26s", delay: "1s"   },
  { x: 540,  y: 720, r: 36, rot: -15, drift: "pad-drift-b", rotAnim: "pad-rot-cw", dur: "32s", delay: "2.5s" },
];

const lotusOnPads = [0, 3, 6];

const daisies = [
  { x:  52, y: 840, s: 1.5,  r:  15, delay: "0s"    },
  { x: 118, y: 804, s: 1.0,  r: -10, delay: "0.5s"  },
  { x: 192, y: 850, s: 1.72, r:   5, delay: "1.1s"  },
  { x: 272, y: 817, s: 0.9,  r:  22, delay: "0.3s"  },
  { x: 158, y: 874, s: 1.2,  r:  -5, delay: "0.8s"  },
  { x: 350, y: 844, s: 1.12, r:  30, delay: "1.5s"  },
  { x: 445, y: 867, s: 0.82, r: -15, delay: "0.6s"  },
  { x: 516, y: 876, s: 0.65, r:  18, delay: "1.2s"  },
  { x: 695, y: 884, s: 0.75, r:  12, delay: "0.9s"  },
  { x: 782, y: 872, s: 1.05, r:  -8, delay: "0.2s"  },
  { x: 878, y: 890, s: 0.82, r:  20, delay: "1.4s"  },
  { x:1055, y: 867, s: 0.9,  r:  -5, delay: "0.7s"  },
  { x:1112, y: 830, s: 1.3,  r:  10, delay: "0.4s"  },
  { x:1202, y: 847, s: 1.0,  r: -20, delay: "1.0s"  },
  { x:1298, y: 834, s: 1.5,  r:   5, delay: "1.6s"  },
  { x:1385, y: 864, s: 1.2,  r:  25, delay: "0.1s"  },
  { x:  30, y: 700, s: 0.9,  r:  30, delay: "1.3s"  },
  { x:1418, y: 714, s: 1.1,  r: -18, delay: "0.4s"  },
  { x: 598, y: 814, s: 0.72, r:   8, delay: "1.7s"  },
  { x: 432, y: 810, s: 0.78, r: -12, delay: "0.95s" },
];

const tulips = [
  { x: 378, y: 820 }, { x: 762, y: 858 },
  { x: 1160, y: 842 }, { x: 102, y: 858 }, { x: 1322, y: 858 },
];

const sparkles = [
  { x:  402, y: 118, s: 1.2,  delay: "0s"     },
  { x:  698, y:  78, s: 0.9,  delay: "0.37s"  },
  { x: 1048, y: 132, s: 1.1,  delay: "0.74s"  },
  { x: 1348, y: 298, s: 0.8,  delay: "1.11s"  },
  { x:   82, y: 202, s: 1.0,  delay: "1.48s"  },
  { x:  552, y: 348, s: 0.7,  delay: "1.85s"  },
  { x: 1152, y: 402, s: 1.3,  delay: "0.22s"  },
  { x:  302, y: 498, s: 0.85, delay: "0.59s"  },
  { x:  752, y: 258, s: 0.95, delay: "0.96s"  },
  { x: 1402, y: 498, s: 0.75, delay: "1.33s"  },
  { x:  228, y: 648, s: 0.9,  delay: "1.70s"  },
  { x: 1102, y: 648, s: 1.0,  delay: "0.11s"  },
  { x:  648, y: 598, s: 0.8,  delay: "0.48s"  },
  { x:  452, y: 698, s: 0.7,  delay: "0.85s"  },
  { x: 1302, y: 698, s: 1.1,  delay: "1.22s"  },
  { x:  818, y: 718, s: 0.85, delay: "1.59s"  },
];

// ── SVG art helpers ───────────────────────────────────────────────────────────

function Daisy({ x, y, s, r }: { x: number; y: number; s: number; r: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(${r})`}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse key={a} cx="0" cy="-11" rx="3.5" ry="8.5"
          fill="#f5f3ea" opacity="0.92" transform={`rotate(${a})`} />
      ))}
      <circle cx="0" cy="0" r="5.5" fill="#f0c830" />
      <circle cx="0" cy="0" r="3.5" fill="#d4a025" />
    </g>
  );
}

function Tulip({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="0" x2="0" y2="-22" stroke="#4a7a3a" strokeWidth="1.2" opacity="0.65" />
      <ellipse cx="-7" cy="-27" rx="4.5" ry="9" fill="#c87850" opacity="0.72" transform="rotate(-22, -7, -27)" />
      <ellipse cx="7" cy="-27" rx="4.5" ry="9" fill="#d48860" opacity="0.72" transform="rotate(22, 7, -27)" />
      <path d="M 0 -22 Q -5 -30 -3 -39 Q 0 -44 3 -39 Q 5 -30 0 -22"
        fill="#c87850" opacity="0.88" />
    </g>
  );
}

function Sparkle({ x, y, s, delay }: { x: number; y: number; s: number; delay: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}
      className="sparkle"
      style={{ animationDelay: delay }}>
      <path d="M 0 -9 L 1.6 -1.6 L 9 0 L 1.6 1.6 L 0 9 L -1.6 1.6 L -9 0 L -1.6 -1.6 Z"
        fill="white" opacity="0.9" />
    </g>
  );
}

function LilyPad({ x, y, r, rot, drift, rotAnim, dur, delay }: {
  x: number; y: number; r: number; rot: number;
  drift: string; rotAnim: string; dur: string; delay: string;
}) {
  const a1 = -Math.PI / 2 + Math.PI / 5;
  const a2 = -Math.PI / 2 - Math.PI / 5;
  const x1 = (x + r * Math.cos(a1)).toFixed(2);
  const y1 = (y + r * Math.sin(a1)).toFixed(2);
  const x2 = (x + r * Math.cos(a2)).toFixed(2);
  const y2 = (y + r * Math.sin(a2)).toFixed(2);
  const d = `M ${x} ${y} L ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2} Z`;
  return (
    <g className={drift} style={{ animationDuration: dur, animationDelay: delay }}>
      <g transform={`rotate(${rot}, ${x}, ${y})`} className={rotAnim} style={{ transformOrigin: `${x}px ${y}px`, animationDuration: `${parseInt(dur) * 1.6}s`, animationDelay: delay }}>
        <path d={d} fill="#2d6b3a" opacity="0.88" />
        <path d={d} fill="none" stroke="#5a9a5a" strokeWidth="0.9" opacity="0.45" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line key={a}
            x1={x} y1={y}
            x2={x + r * 0.9 * Math.cos((a - 90) * Math.PI / 180)}
            y2={y + r * 0.9 * Math.sin((a - 90) * Math.PI / 180)}
            stroke="#5a9a5a" strokeWidth="0.6" opacity="0.3" />
        ))}
      </g>
    </g>
  );
}

function Lotus({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {[0, 51.4, 102.8, 154.2, 205.7, 257.1, 308.5].map((a) => (
        <ellipse key={a}
          cx={0} cy={-(r * 1.15)}
          rx={r * 0.38} ry={r * 0.88}
          fill="#e890b0" opacity="0.82"
          transform={`rotate(${a})`} />
      ))}
      {[25.7, 77.1, 128.5, 180, 231.4, 282.8, 334.2].map((a) => (
        <ellipse key={a}
          cx={0} cy={-(r * 0.85)}
          rx={r * 0.28} ry={r * 0.65}
          fill="#f0b8cc" opacity="0.9"
          transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={0} r={r * 0.3} fill="#f5d0e0" opacity="0.95" />
      <circle cx={0} cy={0} r={r * 0.15} fill="#f8e8f0" opacity="1" />
    </g>
  );
}

const rippleOrigins = [
  { x: 480,  y: 340, delay: "0s"   },
  { x: 1050, y: 520, delay: "1.8s" },
  { x: 240,  y: 680, delay: "3.2s" },
];
const RIPPLE_COUNT = 4;

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TeaPartyPage() {
  const entries = await getEntries();

  return (
    <>
      <style>{`
        .pond-page { min-height: 100vh; background: #071a12; position: relative; }
        .pond-bg {
          position: fixed; inset: 0; z-index: 0;
          overflow: hidden; pointer-events: none;
        }
        .pond-art { width: 100%; height: 100%; position: absolute; inset: 0; }
        .pond-content {
          position: relative; z-index: 10;
          max-width: 680px; margin: 0 auto;
          padding: 2rem 1.5rem 5rem;
        }
        @keyframes water-shimmer {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.9; }
        }
        .water-shimmer { animation: water-shimmer 5s ease-in-out infinite; }
        @keyframes pad-drift-a {
          0%   { transform: translate(0px,  0px); }
          25%  { transform: translate(6px,  -4px); }
          50%  { transform: translate(10px,  2px); }
          75%  { transform: translate(4px,   6px); }
          100% { transform: translate(0px,  0px); }
        }
        @keyframes pad-drift-b {
          0%   { transform: translate(0px,  0px); }
          33%  { transform: translate(-8px,  5px); }
          66%  { transform: translate(4px,  -6px); }
          100% { transform: translate(0px,  0px); }
        }
        @keyframes pad-drift-c {
          0%   { transform: translate(0px,  0px); }
          20%  { transform: translate(5px,   3px); }
          60%  { transform: translate(-6px, -4px); }
          100% { transform: translate(0px,  0px); }
        }
        @keyframes pad-rot-cw  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes pad-rot-ccw { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
        .pad-drift-a { animation: pad-drift-a ease-in-out infinite; }
        .pad-drift-b { animation: pad-drift-b ease-in-out infinite; }
        .pad-drift-c { animation: pad-drift-c ease-in-out infinite; }
        .pad-rot-cw  { animation: pad-rot-cw  linear infinite; }
        .pad-rot-ccw { animation: pad-rot-ccw linear infinite; }
        .sparkle { animation: sparkle-twinkle 3.2s ease-in-out infinite; }
        @keyframes ripple-expand {
          0%   { r: 4;  opacity: 0.55; }
          100% { r: 80; opacity: 0;    }
        }
        .ripple-ring { animation: ripple-expand 4s ease-out infinite; }
      `}</style>

      <div className={`${cormorant.className} pond-page`}>

        {/* Fixed pond background */}
        <div className="pond-bg" aria-hidden>
          <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="pond-art">
            <defs>
              {/* Water depth */}
              <radialGradient id="wDeep" cx="50%" cy="48%" r="55%">
                <stop offset="0%"   stopColor="#071a12" />
                <stop offset="60%"  stopColor="#0a2a1a" />
                <stop offset="100%" stopColor="#0d3520" />
              </radialGradient>
              {/* Edge darkening */}
              <radialGradient id="wEdge" cx="50%" cy="50%" r="50%">
                <stop offset="60%"  stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#020d08" stopOpacity="0.72" />
              </radialGradient>
              {/* Shimmer streak */}
              <linearGradient id="wShimmer" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#1a4a30" stopOpacity="0" />
                <stop offset="50%"  stopColor="#1a4a30" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1a4a30" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Base water */}
            <rect width="1440" height="900" fill="url(#wDeep)" />
            <rect width="1440" height="900" fill="url(#wEdge)" />

            {/* Shimmer streaks */}
            {[
              { x: 180, y: 120, w: 420, h: 180, rot: -18, delay: "0s"   },
              { x: 680, y: 280, w: 380, h: 140, rot:  12, delay: "2.1s" },
              { x: 980, y: 160, w: 320, h: 160, rot:  -8, delay: "1.3s" },
              { x: 320, y: 520, w: 440, h: 120, rot:  20, delay: "3.4s" },
              { x: 800, y: 580, w: 360, h: 100, rot: -14, delay: "0.7s" },
            ].map((s, i) => (
              <ellipse key={i}
                cx={s.x + s.w / 2} cy={s.y + s.h / 2}
                rx={s.w / 2} ry={s.h / 2}
                fill="url(#wShimmer)"
                transform={`rotate(${s.rot}, ${s.x + s.w / 2}, ${s.y + s.h / 2})`}
                className="water-shimmer"
                style={{ animationDelay: s.delay }} />
            ))}

            {lilyPads.map((lp, i) => <LilyPad key={i} {...lp} />)}
            {lotusOnPads.map((i) => (
              <Lotus key={i} x={lilyPads[i].x} y={lilyPads[i].y} r={lilyPads[i].r * 0.42} />
            ))}
            {rippleOrigins.map((origin, oi) =>
              Array.from({ length: RIPPLE_COUNT }, (_, ri) => (
                <circle key={`${oi}-${ri}`}
                  cx={origin.x} cy={origin.y}
                  r={4}
                  fill="none"
                  stroke="#4a9a78"
                  strokeWidth="0.9"
                  opacity="0.55"
                  className="ripple-ring"
                  style={{
                    animationDelay: `calc(${origin.delay} + ${ri * 1.0}s)`,
                    animationDuration: "4s",
                  }} />
              ))
            )}
          </svg>
        </div>

        {/* Scrollable content */}
        <div className="pond-content">

          {/* Nav */}
          <nav className="flex items-center gap-3 mb-10">
            <Link href="/wonderland"
              className="text-[0.68rem] tracking-[0.22em] uppercase text-teal-400/55 hover:text-teal-300/85 transition-colors">
              ← Wonderland
            </Link>
            <span className="text-teal-800/35">◈</span>
            <span className="text-[0.68rem] tracking-[0.22em] uppercase text-teal-400/35">The Garden</span>
          </nav>

          {/* Header */}
          <header className="mb-10 text-center">
            <p className="text-[0.68rem] tracking-[0.32em] uppercase text-[#5ab8a0] mb-4">
              mad hatter&apos;s tea party
            </p>
            <h1 className="text-[clamp(2.3rem,6vw,3.7rem)] font-light text-[#e8e4d8] leading-[1.08] mb-4">
              The Enchanted<br />
              <em className="font-semibold text-[#f0c830]">Garden Journal</em>
            </h1>
            <p className="text-[#5a9888] text-[1.05rem] font-light leading-relaxed max-w-[38ch] mx-auto">
              Let your thoughts ripple outward.<br />
              The Cheshire Cat is listening.
            </p>
          </header>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-[linear-gradient(to_right,transparent,rgba(74,152,128,0.32),transparent)]" />
            <span className="text-lg">🍵</span>
            <div className="flex-1 h-px bg-[linear-gradient(to_right,transparent,rgba(74,152,128,0.32),transparent)]" />
          </div>

          {/* Journal form card */}
          <div className="rounded-3xl border border-[rgba(80,160,100,0.18)] p-6 md:p-8 bg-[rgba(6,18,14,0.72)] backdrop-blur-2xl">
            <JournalEntry userId="demo-user" />
          </div>

          {/* Past entries */}
          <section className="mt-12">
            <h2 className="text-xl font-light text-[#7ab8a8] mb-5">
              Your Story So Far
            </h2>
            {entries.length === 0 ? (
              <p className="text-center text-[#36685a] text-sm py-10">
                Your story is just beginning... ☕
              </p>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <JournalCard key={entry._id} entry={entry} />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
