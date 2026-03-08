import { WonderlandInsight } from "@/components/WonderlandInsight";

export default function Home() {
    return (
        <main className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#d4a0b0" }}>
            {/* Image – vertically centred on the left */}
            <img
                src="/dashboardbg.svg"
                alt=""
                aria-hidden
                className="pointer-events-none select-none"
                style={{
                    position: "fixed",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: "85vh",
                    width: "auto",
                    objectFit: "contain",
                    opacity: 1,
                    filter: "brightness(1.15) saturate(1.1)",
                    zIndex: 0,
                }}
            />

            {/* Content – pushed to the right */}
            <div className="relative z-10 min-h-screen flex items-start justify-end p-6 sm:p-10">
                <div className="w-full max-w-xl">
                    <h1
                        className="font-bold mb-8"
                        style={{
                            fontFamily: "var(--font-alice), serif",
                            marginTop: "10rem",
                            fontSize: "3.5rem",
                            color: "#f0f5ec",
                            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}
                    >
                        The Looking Glass
                    </h1>

                    <div className="flex flex-col gap-10">
                        <WonderlandInsight />
                    </div>
                </div>
            </div>
        </main>
    );
}
