import React, { useEffect, useMemo, useRef, useState } from "react";

// =============================
// 🔧 Quick setup notes
// 1) Drop this file into a Vite React + Tailwind project as src/App.jsx
// 2) Using Tailwind v4? In src/index.css put:  @import "tailwindcss";
//    And in postcss.config.js:  export default { plugins: { "@tailwindcss/postcss": {} } }
// 3) Fill in the LINKS + RESUME constants
// 4) npm run dev
// =============================

// ======= CONFIG: personalize these =======
const RESUME_PDF_URL = "https://drive.google.com/file/d/1vRsuxjurObH3oeU80AiqVgrL37YvBjc9/view?usp=sharing"; // e.g. "/Brandon_Cantrell_Resume.pdf" or a public link
const LINKEDIN_URL = "https://www.linkedin.com/in/canalytics/";
const GITHUB_URL = "https://github.com/BrandonCANalytics ";
const PYGAME_URL = "https://canalytics.itch.io/corp-pygame "; // point to your Pygame profile or game page
const EMAIL = "brandoncantrell2000@gmail.com "; // update me
const CALENDLY_URL = "https://calendly.com/brandoncantrell2000/canalytics-intro-call "; // update me

// Windows XP "Bliss" (archived 600dpi)
const XP_WALLPAPER_URL =
  "https://media.idownloadblog.com/wp-content/uploads/2017/07/OS-X-Leopard-10.5-wallpaper.jpg";

//flags to ensure BOOT animation runs only once
let BOOT_ALREADY_RAN = false;               // survives component remounts

// Showcase projects
const PROJECTS = [
  {
    name: "Math Launch Dallas",
    blurb: "Tutoring microsite with simple analytics pipeline and lead capture.",
    link: "https://mathlaunchdallas.webflow.io/",
    tags: ["Webflow", "Analytics", "Lead gen "],
  },
  {
    name: "Crime & Orders Dashboards",
    blurb: "Governed metrics + thin marts feeding embedded dashboards.",
    link: "work product (Sorry!) ",
    tags: ["Looker", "SQL", "Data Modeling "],
  },
  {
    name: "1 Hard Thing a Day API",
    blurb: "FastAPI + Postgres side project with simple JWT auth.",
    link: "https://one-hard-thing.fly.dev/",
    tags: ["FastAPI", "Postgres", "Auth "],
  },
  {
    name: "CANalytics Portfolio",
    blurb: "Interactive web analytics portfolio built with React and Tailwind.",
    link: "https://brandoncanalytics.github.io/CANalytics/",
    tags: ["React", "Tailwind", "Portfolio"],
  },
  {
    name: "Corp-Pygame",
    blurb: "Retro arcade-style game exploring corporate chaos, built in Python.",
    link: "https://canalytics.itch.io/corp-pygame",
    tags: ["Python", "Pygame", "Game Dev"],
  },
];

// ======= Terminal UI helpers =======
const PROMPT = "brandon@cantrell:~$";
const HELP_LINES = [
  " Available commands:",
  "  can -h            Show help ",
  "  can -resume       Open resume window (click to view fullscreen) ",
  "  can -links        Show LinkedIn, GitHub, Pygame links ",
  "  can -projects     Show featured projects ",
  "  can -contact      Show email and scheduling ",
  "  clear             Clear the terminal "
];

// Put near the top, below constants
const normalizeDrivePdf = (url) => {
  try {
    const u = new URL(url);
    // Match /file/d/<id>/view or /preview
    const m = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (u.hostname.includes('drive.google.com') && m) {
      const id = m[1];
      return {
        embed: `https://drive.google.com/file/d/${id}/preview`,
        full:  `https://drive.google.com/file/d/${id}/view?usp=sharing`,
      };
    }
  } catch {}
  return { embed: url, full: url };
};



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
  setQueue((prev) => [
    ...prev,
    ...lines
      .flat()
      .filter((l) => l !== null && l !== undefined)
      .map((l) => (typeof l === "string" ? l : String(l))),
  ]);
};


  const clear = () => {
    setBuffer("");
    setQueue([]);
    setActive(false);
  };

  return { buffer, typeLines, clear, isTyping: active || queue.length > 0 };
}

export default function App() {
  const [lines, setLines] = useState([]); // {kind: 'out'|'in'|'typed', text}
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const { buffer, typeLines, clear: clearTypewriter, isTyping } = useTypewriter();
  const [showResume, setShowResume] = useState(false);
  const hasBooted = useRef(false);
  const scrollRef = useRef(null);


  // Focus the input when clicking anywhere in the terminal
  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handle = () => inputRef.current?.focus();
    el.addEventListener("mousedown", handle);
    return () => el.removeEventListener("mousedown", handle);
  }, []);

// On mount: boot animation + greet (only once)
useEffect(() => {
  if (BOOT_ALREADY_RAN) return;
  BOOT_ALREADY_RAN = true;
  
  const BOOT_LINES = [
    " [BOOT] Initializing environment…",
    " [OK] Loading portfolio modules…",
    " [OK] Mounting UI…",
    " [OK] Ready.",
    "",
    " Welcome to Brandon’s Portfolio CLI.",
    " Pro tip: type 'can -h' to see all commands.",
  ];
  typeLines(BOOT_LINES);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  // smooth scroll to bottom whenever lines update
  scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
}, [lines]);

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


// Freeze any active 'typed' block and clear the typewriter buffer/queue
const finalizeTypedBlock = () => {
  setLines((prev) => {
    const last = prev[prev.length - 1];
    if (last && last.kind === "typed") {
      const next = [...prev];
      next[next.length - 1] = { kind: "out", text: last.text };
      return next;
    }
    return prev;
  });
  clearTypewriter();
};

// Strictly sanitize lines before typing so "undefined" can never appear
const safeTypeLines = (arr, label = "batch") => {
  const cleaned = arr
    .flat()                               // if anything nested sneaks in
    .filter((l) => l !== null && l !== undefined)
    .map((l) => (typeof l === "string" ? l : String(l)));

  // DEBUG: see exactly what's being typed
  // Remove this after you confirm it's clean:
  console.log("typeLines:", label, cleaned);

  typeLines(cleaned);
};


  const pdfURLs = normalizeDrivePdf(RESUME_PDF_URL);

  const runCommand = (raw) => {
  const cmd = raw.trim();

  // Echo the command
  setLines((prev) => [...prev, { kind: "in", text: `${PROMPT} ${cmd}` }]);

  if (cmd === "") return;

  if (cmd === "clear") {
    finalizeTypedBlock();
    setLines([]);
    clearTypewriter();
    setShowResume(false);
    return;
  }

  if (cmd === "can -h" || cmd === "help" || cmd === "?") {
    finalizeTypedBlock();
    safeTypeLines(HELP_LINES);
    return;
  }

  if (cmd === "can -links") {
    finalizeTypedBlock();
    const linkLines = [
      ` LinkedIn  → ${LINKEDIN_URL}`,
      ` GitHub    → ${GITHUB_URL}`,
      ` Pygame    → ${PYGAME_URL}`,
    ];
    safeTypeLines(linkLines);
    return;
  }

  if (cmd === "can -projects") {
    finalizeTypedBlock();
    const out = [" Projects:"];
    PROJECTS.forEach((p, i) => {
      out.push(`  ${i + 1}. ${p.name} — ${p.blurb}`);
      out.push(`     Tags: ${p.tags.join(", ")}`);
      if (p.link) out.push(`     Link: ${p.link}`); // <-- skip blank link
    });
    safeTypeLines(out);
    return;
  }

  if (cmd === "can -contact") {
    finalizeTypedBlock();
    const out = [` Email     → ${EMAIL}`, ` Schedule  → ${CALENDLY_URL}`];
    safeTypeLines(out);
    return;
  }

  if (cmd === "can -resume") {
    finalizeTypedBlock();
    const out = ["Opening resume window…"];
    if (RESUME_PDF_URL && RESUME_PDF_URL !== "#") {
      out.push(`PDF version → ${pdfURLs.full}`);
      setShowResume(true);
    } else {
      out.push("(Set RESUME_PDF_URL to enable the PDF preview and link.)");
    }
    safeTypeLines(out);
    return;
  }

  // Unknown command
  finalizeTypedBlock();
  safeTypeLines([` Unknown command: ${cmd}`, " Type 'can -h' to see available commands."]);
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
      className="min-h-dvh w-[100dvw] bg-cover bg-center bg-fixed overflow-x-hidden"
      style={{ backgroundImage: `url(${XP_WALLPAPER_URL})` }}
     >
      <div className="min-h-dvh w-full overflow-x-hidden backdrop-blur-[2px] bg-black/35 flex items-center justify-center p-6">
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
          <div
            className="h-[75dvh] overflow-y-auto p-4 space-y-1"
            onClick={() => inputRef.current?.focus()}
          >
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
                  <span className="absolute left-1 top-0 text-white/30 pointer-events-none select-none">
                    {hint}
                  </span>
                )}
              </div>
            </form>
            <div ref={scrollRef} />
          </div>
        </div>
      </div>

      {/* Resume Modal */}
      {showResume && (
        <ResumeModal
  pdfUrl={pdfURLs.embed}
  fullUrl={pdfURLs.full}
  onClose={() => setShowResume(false)}
/>

      )}
    </div>
  );
}

function ResumeModal({ pdfUrl, fullUrl, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-[95vw] md:w-[80vw] h-[85vh] max-w-5xl rounded-2xl overflow-hidden border border-white/15 bg-black/85 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-white/80">
            <span className="w-3 h-3 rounded-full bg-red-500/90" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/90" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
            <span className="ml-3">Resume.pdf</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-300 hover:text-emerald-200 underline decoration-emerald-400/60"
              aria-label="Open resume fullscreen"
            >
              Open Fullscreen ↗
            </a>
            <button
              onClick={onClose}
              className="text-black/70 hover:text-red-400"
              aria-label="Close resume"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable PDF area */}
        <div className="flex-1 overflow-auto">
          {/* Use iframe for better cross-browser scrolling, esp. with Google Drive /preview */}
          <iframe
            src={pdfUrl}
            title="Resume PDF preview"
            className="w-full h-full"
          />

          {/* If you prefer <object>, it also works; keep pointer events enabled: */}
          {/* 
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            aria-label="Resume PDF preview"
          >
            <div className="w-full h-full flex items-center justify-center text-white/70 p-6 text-center">
              PDF preview not supported here. Use “Open Fullscreen”.
            </div>
          </object>
          */}
        </div>
      </div>
    </div>
  );
}



function Line({ kind, text }) {
  const base = "min-w-0 max-w-full leading-relaxed break-words font-mono";
  const color = kind === "in" ? "text-emerald-300" : "text-green-100";

  const safe = String(text ?? "").replace(/\bundefined\b/g, "");
  const parts = safe.replace(/\r\n/g, "\n").split("\n");

  // Turn URLs/emails into <a>…</a> (target=_blank)
  const linkify = (s) => {
    const re =
      /(https?:\/\/[^\s)]+)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
    const out = [];
    let last = 0, m;

    while ((m = re.exec(s)) !== null) {
      if (m.index > last) out.push(s.slice(last, m.index));
      const [hit, url, email] = m;
      if (url) {
        out.push(
          <a
            key={out.length}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-emerald-400/60 hover:decoration-emerald-400"
          >
            {url}
          </a>
        );
      } else if (email) {
        out.push(
          <a
            key={out.length}
            href={`mailto:${email}`}
            className="underline decoration-emerald-400/60 hover:decoration-emerald-400"
          >
            {email}
          </a>
        );
      }
      last = re.lastIndex;
    }
    if (last < s.length) out.push(s.slice(last));
    return out.length ? out : [s];
  };

  return (
    <div className={`${base} ${color}`}>
      {parts.map((ln, i) => (
        <div
          key={i}
          className="pl-1"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {"\u200B"}
          {ln.length ? linkify(ln) : "\u00A0"}
        </div>
      ))}
    </div>
  );
}



