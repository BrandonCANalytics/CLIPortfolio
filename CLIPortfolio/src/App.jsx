import React, { useEffect, useMemo, useRef, useState } from "react";

// =============================
// 🔧 Quick setup notes
// 1) Drop this file into a Vite React + Tailwind project as src/App.jsx
// 2) Put the XP wallpaper into /public/xp.jpg OR use the default URL below
// 3) Fill in the LINKS + RESUME constants
// 4) npm run dev
// =============================

// ======= CONFIG: personalize these =======
const RESUME_PDF_URL = "#"; // e.g. "/Brandon_Cantrell_Resume.pdf" or a public link
const LINKEDIN_URL = "https://www.linkedin.com/in/"; // your exact handle
const GITHUB_URL = "https://github.com/"; // your exact handle
const PYGAME_URL = "https://www.pygame.org/"; // replace with your Pygame page or portfolio project
const XP_WALLPAPER_URL =
  "https://upload.wikimedia.org/wikipedia/commons/5/5f/Bliss_by_charles_o%27rear.jpg"; // Windows XP "Bliss"

// ======= Sample resume text (edit freely) =======
const RESUME_LINES = [
  "Brandon Cantrell — Analytics Engineering / Web Dev",
  "Dallas, TX  •  Senior Business Intelligence Analyst",
  "LinkedIn: " + LINKEDIN_URL,
  "GitHub: " + GITHUB_URL,
  "",
  "SUMMARY",
  "Data-driven builder blending analytics engineering and full‑stack mindset.",
  "Ships clean data models, performant dashboards, and small web tools that stick.",
  "",
  "CORE SKILLS",
  "SQL • Looker/LookML • Data Modeling • ELT • Python • JS/TS • React • APIs • Git",
  "",
  "EXPERIENCE",
  "— Senior BI Analyst · Title Insurance (Dallas, TX)",
  "   • Built KPI layers, governed metrics, and embedded dashboards for clients.",
  "   • Partnered with product/ops to turn questions into measurable outcomes.",
  "",
  "PROJECTS",
  "— Math Launch Dallas (tutoring microsite): Webflow + analytics pipeline",
  "— Crime & Orders dashboards: governed metrics, thin marts, and alerts",
  "",
  "EDUCATION & CERTS",
  "Security+ • Ongoing: JS/TS + React + Node • Full Stack Open",
];

// ======= Terminal UI helpers =======
const PROMPT = "brandon@cantrell:~$";
const HELP_LINES = [
  "Available commands:",
  "  can -h            Show help",
  "  can -resume       Print resume + PDF link",
  "  can -links        Show LinkedIn, GitHub, Pygame links",
  "  clear             Clear the terminal",
];

function useTypewriter() {
  const [buffer, setBuffer] = useState("");
  const [queue, setQueue] = useState([]); // strings to type out, in order
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active && queue.length > 0) setActive(true);
  }, [queue, active]);

  useEffect(() => {
    if (!active) return;
    let i = 0;
    const text = queue[0] ?? "";

    const id = setInterval(() => {
      if (i < text.length) {
        setBuffer((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(id);
        // Finish line with newline
        setBuffer((prev) => prev + "\n");
        setQueue((prev) => prev.slice(1));
        setActive(false);
      }
    }, 10);

    return () => clearInterval(id);
  }, [active, queue]);

  const typeLines = (lines) => {
    setQueue((prev) => [...prev, ...lines.map((l) => l + "")]);
  };

  const clear = () => {
    setBuffer("");
    setQueue([]);
    setActive(false);
  };

  return { buffer, typeLines, clear, isTyping: active || queue.length > 0 };
}

export default function App() {
  const [lines, setLines] = useState([]); // {kind: 'out'|'in'|'link', text}
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const { buffer, typeLines, clear: clearTypewriter, isTyping } = useTypewriter();

  // Focus the hidden input when clicking anywhere in the terminal
  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handle = () => inputRef.current?.focus();
    el.addEventListener("mousedown", handle);
    return () => el.removeEventListener("mousedown", handle);
  }, []);

  // On mount: greet & hint
  useEffect(() => {
    setLines([
      { kind: "out", text: "Welcome to Brandon’s Portfolio CLI." },
      { kind: "out", text: "Pro tip: type 'can -h' to see all commands." },
    ]);
  }, []);

  // Append typewriter buffer as it grows
  useEffect(() => {
    if (!buffer) return;
    setLines((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.kind === "typed") {
        const next = [...prev];
        next[next.length - 1] = { kind: "typed", text: buffer };
        return next;
      }
      return [...prev, { kind: "typed", text: buffer }];
    });
  }, [buffer]);

  const runCommand = (raw) => {
    const cmd = raw.trim();

    // Show what the user typed
    setLines((prev) => [...prev, { kind: "in", text: `${PROMPT} ${cmd}` }]);

    if (cmd === "" ) return;

    if (cmd === "clear") {
      setLines([]);
      clearTypewriter();
      return;
    }

    if (cmd === "can -h" || cmd === "help" || cmd === "?" ) {
      typeLines(HELP_LINES);
      return;
    }

    if (cmd === "can -links") {
      const linkLines = [
        `LinkedIn  → ${LINKEDIN_URL}`,
        `GitHub    → ${GITHUB_URL}`,
        `Pygame    → ${PYGAME_URL}`,
      ];
      typeLines(linkLines);
      return;
    }

    if (cmd === "can -resume") {
      const out = [...RESUME_LINES];
      if (RESUME_PDF_URL && RESUME_PDF_URL !== "#") {
        out.push("");
        out.push(`PDF version → ${RESUME_PDF_URL}`);
      } else {
        out.push("");
        out.push("(Set RESUME_PDF_URL to enable the PDF link.)");
      }
      typeLines(out);
      return;
    }

    // Unknown command
    typeLines([
      `Unknown command: ${cmd}`,
      "Type 'can -h' to see available commands.",
    ]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (isTyping) return; // ignore input while typing output
    const val = input;
    setInput("");
    runCommand(val);
  };

  const hint = useMemo(() => {
    return input.length === 0 ? "type 'can -h' to see all commands" : "";
  }, [input]);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(${XP_WALLPAPER_URL})`,
      }}
    >
      <div className="min-h-screen w-full backdrop-blur-[2px] bg-black/35 flex items-center justify-center p-4">
        <div
          ref={containerRef}
          className="w-full max-w-4xl rounded-2xl shadow-2xl border border-white/15 bg-black/70 text-green-200 font-mono text-sm md:text-base"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/90" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/90" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
              <span className="ml-3 text-white/80">Portfolio — Terminal</span>
            </div>
            <span className="text-white/50">ESC to focus</span>
          </div>

          {/* Terminal scroll area */}
          <div className="h-[65vh] overflow-y-auto p-4 space-y-1" onClick={() => inputRef.current?.focus()}>
            {lines.map((ln, idx) => (
              <Line key={idx} kind={ln.kind} text={ln.text} />
            ))}

            {/* Active prompt */}
            <form onSubmit={onSubmit} className="flex items-start gap-2 pt-2">
              <span className="text-emerald-300 select-none">{PROMPT}</span>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-transparent outline-none caret-emerald-300 text-green-100"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      inputRef.current?.focus();
                    }
                  }}
                />
                {hint && (
                  <span className="absolute left-0 top-0 text-white/30 pointer-events-none select-none">
                    {hint}
                  </span>
                )}
                {/* Blinking cursor (visual aid). The real caret is in the input; this is decorative. */}
                <span className="inline-block w-2 h-5 ml-1 align-middle bg-emerald-300 animate-pulse" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Line({ kind, text }) {
  const base = "whitespace-pre-wrap break-words";
  if (kind === "in") {
    return <div className={`${base} text-emerald-300`}>{text}</div>;
  }
  if (kind === "typed") {
    return <pre className={`${base} text-green-100`}>{text}</pre>;
  }
  // default output line
  return <div className={`${base} text-green-100`}>{text}</div>;
}
