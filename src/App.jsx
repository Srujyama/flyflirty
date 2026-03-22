import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useInView(opts = {}) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(e.target); } },
      { threshold: 0.12, ...opts }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function useMouseGlow(containerRef) {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      const r = el.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, [containerRef]);
  return pos;
}

function useTypewriter(text, speed = 30, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);
  useEffect(() => {
    if (!started) return;
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, started]);
  return displayed;
}

function useCountUp(target, duration = 2000, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED FLY CANVAS (hero background)
// ─────────────────────────────────────────────────────────────────────────────

function FlySimulation() {
  const canvasRef = useRef(null);
  const fliesRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize flies
    if (fliesRef.current.length === 0) {
      for (let i = 0; i < 24; i++) {
        const isMating = i < 6;
        const pair = isMating ? Math.floor(i / 2) : -1;
        fliesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          size: 2 + Math.random() * 2.5,
          isMating,
          pair,
          trail: [],
          hue: isMating ? 230 + Math.random() * 30 : 220 + Math.random() * 40,
          alpha: 0.3 + Math.random() * 0.4,
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameRef.current++;

      for (const fly of fliesRef.current) {
        // Wander
        fly.vx += (Math.random() - 0.5) * 0.15;
        fly.vy += (Math.random() - 0.5) * 0.15;
        fly.vx *= 0.98;
        fly.vy *= 0.98;

        // Mating pairs attract
        if (fly.isMating) {
          const partner = fliesRef.current.find(
            (f) => f !== fly && f.pair === fly.pair
          );
          if (partner) {
            const dx = partner.x - fly.x;
            const dy = partner.y - fly.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 8) {
              fly.vx += (dx / dist) * 0.03;
              fly.vy += (dy / dist) * 0.03;
            }
          }
        }

        fly.x += fly.vx;
        fly.y += fly.vy;

        // Bounce
        if (fly.x < 0 || fly.x > canvas.width) fly.vx *= -1;
        if (fly.y < 0 || fly.y > canvas.height) fly.vy *= -1;
        fly.x = Math.max(0, Math.min(canvas.width, fly.x));
        fly.y = Math.max(0, Math.min(canvas.height, fly.y));

        // Trail
        fly.trail.push({ x: fly.x, y: fly.y });
        if (fly.trail.length > 30) fly.trail.shift();

        // Draw trail
        if (fly.trail.length > 1) {
          for (let j = 1; j < fly.trail.length; j++) {
            const a = (j / fly.trail.length) * fly.alpha * 0.3;
            ctx.beginPath();
            ctx.moveTo(fly.trail[j - 1].x, fly.trail[j - 1].y);
            ctx.lineTo(fly.trail[j].x, fly.trail[j].y);
            ctx.strokeStyle = `hsla(${fly.hue}, 50%, 65%, ${a})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw fly
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size, 0, Math.PI * 2);
        const glow = fly.isMating
          ? `hsla(${fly.hue}, 70%, 72%, ${fly.alpha})`
          : `hsla(${fly.hue}, 20%, 55%, ${fly.alpha * 0.5})`;
        ctx.fillStyle = glow;
        ctx.fill();

        // Glow
        if (fly.isMating) {
          ctx.beginPath();
          ctx.arc(fly.x, fly.y, fly.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${fly.hue}, 60%, 60%, 0.03)`;
          ctx.fill();
        }
      }

      // Draw ROI circles
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      for (let ring = 1; ring <= 3; ring++) {
        const r = ring * Math.min(canvas.width, canvas.height) * 0.12;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(129, 140, 248, ${0.025 / ring})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fly-canvas" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTIVE PIPELINE VISUALIZER
// ─────────────────────────────────────────────────────────────────────────────

const pipelineSteps = [
  {
    id: "preprocess",
    title: "Frame Preprocessing",
    icon: "eye",
    color: "emerald",
    duration: "~2ms",
    code: `gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(
    thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
)`,
    detail: "Each video frame is padded (50px borders), converted to grayscale, and binary-thresholded at 127. Contours are extracted and sorted by a custom grid-aware comparator (y-tolerance of 200px) to ensure consistent ROI ordering across frames.",
    inputLabel: "Raw BGR Frame",
    outputLabel: "Binary Contours",
  },
  {
    id: "calibrate",
    title: "ROI Calibration",
    icon: "target",
    color: "blue",
    duration: "500 frames",
    code: `if processed_frame_count < 500:
    candidate = []
    for contour in contours_list:
        area = cv2.contourArea(contour)
        if area > 500:  # Filter noise
            candidate.append({
                "contour": contour,
                "edge_duration": 0
            })
    if len(candidate) >= len(initial_contours):
        initial_contours = candidate`,
    detail: "During the first 500 processed frames, the system builds a stable set of arena regions. Only contours with area > 500px qualify. The candidate list is only committed if it has at least as many ROIs as the previous best. Mode radius is computed across all ROIs using scipy.stats.mode for uniform circle sizes.",
    inputLabel: "Raw Contours",
    outputLabel: "Stable ROI Map",
  },
  {
    id: "detect",
    title: "Blob Detection",
    icon: "scan",
    color: "violet",
    duration: "~5ms",
    code: `params = cv2.SimpleBlobDetector_Params()
params.filterByArea = True
params.minArea = 1
params.filterByCircularity = False
detector = cv2.SimpleBlobDetector_create(params)

# Per-ROI masked detection
for mask in masks:
    masked = cv2.bitwise_and(frame, frame, mask=mask)
    gray = cv2.cvtColor(masked, cv2.COLOR_BGR2GRAY)
    gray = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
    gray = cv2.morphologyEx(gray, cv2.MORPH_DILATE, kernel)
    keypoints = detector.detect(gray)`,
    detail: "Each ROI is isolated with a circular mask, then morphological operations (close, dilate, erode with 6x6 kernel) clean up noise. SimpleBlobDetector finds fly-sized blobs with minArea=1. The number of keypoints per ROI determines behavioral state: 2 = separated, 1 = mating, 0 = void candidate.",
    inputLabel: "Masked ROI",
    outputLabel: "Fly Keypoints",
  },
  {
    id: "mate",
    title: "Mating Detection",
    icon: "heart",
    color: "rose",
    duration: "Real-time",
    code: `if len(keypoints) == 1:  # Two flies merged
    mating_duration = (frame_count - start) / fps
    
    if mating_duration < 360:  # < 6 minutes
        cv2.circle(frame, (x,y), r, YELLOW, -1)
    else:  # Verified mating (>= 6 min)
        cv2.circle(frame, (x,y), r, BLUE, -1)
        mating_start_times[roi] = start / fps
        
    # 10-second grace period for brief separations
    grace_threshold = int(fps * 10 / frame_skips)`,
    detail: "When two flies merge into a single blob, a mating event begins. A 10-second grace period (scaled by frame skip rate) handles momentary separations. Yellow dots mark unverified mating; blue dots confirm events lasting over 6 minutes. Verified mating start times are emitted via PyQt signals for real-time UI updates.",
    inputLabel: "Keypoint Count",
    outputLabel: "Mating Events",
  },
  {
    id: "gender",
    title: "Gender Identification",
    icon: "dna",
    color: "amber",
    duration: "Per frame",
    code: `# Temporal slot tracking with position continuity
prev_slots = position_history[roi].get("_slots")
if prev_slots and len(prev_slots) == 2:
    # Hungarian-style nearest-neighbor assignment
    d00 = norm(kp[0] - prev[0])
    d01 = norm(kp[0] - prev[1])
    if d00 + d11 <= d01 + d10:
        slot0, slot1 = kp[0], kp[1]
    else:
        slot0, slot1 = kp[1], kp[0]

# Size history (30-frame rolling average)
avg0 = mean(size_history["slot0"])
avg1 = mean(size_history["slot1"])
female = slot0 if avg0 >= avg1 else slot1`,
    detail: "Identity is maintained across frames using nearest-neighbor position matching (Hungarian-style). A 30-frame rolling size average determines gender: females are typically larger in Drosophila melanogaster. Female trails are drawn in blue, positions tracked for center-occupancy analysis. Red dots = female, cyan dots = male.",
    inputLabel: "2 Keypoints",
    outputLabel: "Gendered Flies",
  },
  {
    id: "spatial",
    title: "Spatial Analysis",
    icon: "chart",
    color: "cyan",
    duration: "Continuous",
    code: `center_threshold = 32  # pixels from ROI center

distance = sqrt(
    (fly_x - roi_center[0])**2 + 
    (fly_y - roi_center[1])**2
)
in_center = distance <= center_threshold

# Track per-gender, pre/post-mating center time
if not mating_ongoing and in_center:
    if mating_duration < 360:
        pre_mating_center[gender] += 1/fps
if in_center:
    center_gender_duration[gender] += 1/fps`,
    detail: "A 32-pixel threshold defines the arena center zone. The system independently tracks: center mating duration, per-gender center occupancy, pre-mating vs post-mating center time. This data quantifies centrophobism and thigmotaxis -- anxiety-like spatial behaviors in Drosophila that change dramatically with mating status.",
    inputLabel: "Fly Positions",
    outputLabel: "Behavioral Metrics",
  },
];

function PipelineVisualizer() {
  const [activeStep, setActiveStep] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const step = pipelineSteps[activeStep];

  return (
    <div className="pipeline-viz">
      {/* Step selector rail */}
      <div className="pipeline-rail">
        {pipelineSteps.map((s, i) => (
          <button
            key={s.id}
            className={`pipeline-rail__btn ${i === activeStep ? "pipeline-rail__btn--active" : ""} pipeline-rail__btn--${s.color}`}
            onClick={() => { setActiveStep(i); setShowCode(false); }}
          >
            <span className="pipeline-rail__num">{i + 1}</span>
            <span className="pipeline-rail__label">{s.title}</span>
            {i < pipelineSteps.length - 1 && <span className="pipeline-rail__arrow" />}
          </button>
        ))}
      </div>

      {/* Active step detail */}
      <div className={`pipeline-detail pipeline-detail--${step.color}`}>
        <div className="pipeline-detail__head">
          <div className="pipeline-detail__badge">
            <span className="pipeline-detail__step">Step {activeStep + 1}</span>
            <span className="pipeline-detail__time">{step.duration}</span>
          </div>
          <h3 className="pipeline-detail__title">{step.title}</h3>
          <div className="pipeline-detail__flow">
            <span className="pipeline-detail__io pipeline-detail__io--in">{step.inputLabel}</span>
            <span className="pipeline-detail__io-arrow">
              <svg width="24" height="12" viewBox="0 0 24 12"><path d="M0 6h20m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
            </span>
            <span className="pipeline-detail__io pipeline-detail__io--out">{step.outputLabel}</span>
          </div>
        </div>

        <p className="pipeline-detail__desc">{step.detail}</p>

        <button className="pipeline-detail__toggle" onClick={() => setShowCode(!showCode)}>
          {showCode ? "Hide source code" : "View source code"}
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ transform: showCode ? "rotate(180deg)" : "none" }}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>

        <div className={`pipeline-detail__code ${showCode ? "pipeline-detail__code--open" : ""}`}>
          <div className="code-chrome">
            <span className="code-chrome__dots">
              <i/><i/><i/>
            </span>
            <span className="code-chrome__file">{step.id}.py</span>
          </div>
          <pre><code>{step.code}</code></pre>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS COUNTER
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ value, suffix, label, detail, color = "emerald" }) {
  const [ref, vis] = useInView();
  const num = useCountUp(value, 2200, vis);
  return (
    <div ref={ref} className={`stat-card stat-card--${color}`}>
      <div className="stat-card__value">
        {num}<span className="stat-card__suffix">{suffix}</span>
      </div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__detail">{detail}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTIVE ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────

const archData = [
  {
    name: "VideoProcessingThread",
    tag: "QThread",
    color: "emerald",
    desc: "Background video processing engine. Runs the full detection pipeline on every frame without blocking the GUI.",
    signals: [
      { name: "frame_processed", type: "(str, ndarray, dict)", desc: "Emits annotated frame + mating durations" },
      { name: "verified_mating_start_times", type: "(str, dict)", desc: "Confirmed mating events (>6 min)" },
      { name: "center_mating_duration_signal", type: "(int, float)", desc: "Per-ROI center zone mating time" },
      { name: "center_gender_duration_signal", type: "(int, float, float)", desc: "Male/female center occupancy" },
      { name: "void_roi_signal", type: "(str, int)", desc: "Marks invalid ROIs (too many/few flies)" },
      { name: "flies_count_signal", type: "(str, int, int)", desc: "Per-ROI fly count updates" },
    ],
    methods: ["run()", "process_frame()", "detect_flies()", "export_roi_locations()", "export_combined_mating_times()"],
    stateVars: ["mating_durations{}", "mating_start_times{}", "void_rois{}", "fly_trail_history{}", "center_gender_duration{}", "fly_size_history{}"],
  },
  {
    name: "MainWindow",
    tag: "QMainWindow",
    color: "blue",
    desc: "Primary GUI with video display, batch processing queue, real-time mating dashboards, and CSV export.",
    slots: [
      "update_video_frame()", "update_frame_info()", "update_verified_mating_times()",
      "update_center_mating_duration()", "update_center_gender_duration()", "void_roi_handler()",
    ],
    panels: ["Video Display (860x440)", "Video Controls + FPS", "Mating Durations", "Verified Mating Times", "Center Duration Panels", "Video Queue", "Manual ROI Void"],
  },
];

function ArchExplorer() {
  const [active, setActive] = useState(0);
  const cls = archData[active];

  return (
    <div className="arch-explorer">
      <div className="arch-explorer__tabs">
        {archData.map((c, i) => (
          <button
            key={c.name}
            className={`arch-tab ${i === active ? "arch-tab--active" : ""} arch-tab--${c.color}`}
            onClick={() => setActive(i)}
          >
            <code className="arch-tab__name">{c.name}</code>
            <span className="arch-tab__tag">{c.tag}</span>
          </button>
        ))}
      </div>

      <div className={`arch-panel arch-panel--${cls.color}`}>
        <p className="arch-panel__desc">{cls.desc}</p>

        {cls.signals && (
          <div className="arch-section">
            <h4 className="arch-section__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              PyQt Signals ({cls.signals.length})
            </h4>
            <div className="signal-table">
              {cls.signals.map((s) => (
                <div key={s.name} className="signal-row">
                  <code className="signal-row__name">{s.name}</code>
                  <code className="signal-row__type">{s.type}</code>
                  <span className="signal-row__desc">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cls.methods && (
          <div className="arch-section">
            <h4 className="arch-section__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              Key Methods
            </h4>
            <div className="chip-list">
              {cls.methods.map((m) => <code key={m} className="method-chip">{m}</code>)}
            </div>
          </div>
        )}

        {cls.stateVars && (
          <div className="arch-section">
            <h4 className="arch-section__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              State Dictionaries
            </h4>
            <div className="chip-list">
              {cls.stateVars.map((v) => <code key={v} className="state-chip">{v}</code>)}
            </div>
          </div>
        )}

        {cls.slots && (
          <div className="arch-section">
            <h4 className="arch-section__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Connected Slots
            </h4>
            <div className="chip-list">
              {cls.slots.map((s) => <code key={s} className="method-chip">{s}</code>)}
            </div>
          </div>
        )}

        {cls.panels && (
          <div className="arch-section">
            <h4 className="arch-section__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              UI Panels
            </h4>
            <div className="chip-list">
              {cls.panels.map((p) => <span key={p} className="panel-chip">{p}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA FLOW ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

const flowSteps = [
  { action: "Load video(s)", code: "MainWindow.select_video()", icon: "upload" },
  { action: "Auto-detect FPS", code: "cv2.CAP_PROP_FPS → fps_input", icon: "gauge" },
  { action: "Spawn processing thread", code: "VideoProcessingThread(path, [], fps)", icon: "cpu" },
  { action: "Calibrate ROIs (500 frames)", code: "process_frame() → initial_contours", icon: "target" },
  { action: "Detect & track flies", code: "detect_flies() per ROI per frame", icon: "scan" },
  { action: "Emit real-time signals", code: "frame_processed → update_video_frame()", icon: "signal" },
  { action: "Accumulate mating data", code: "mating_durations{} + center_gender{}", icon: "database" },
  { action: "Export CSV", code: "pd.DataFrame(data).to_csv()", icon: "download" },
];

function DataFlowViz() {
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <div className="dataflow">
      {flowSteps.map((step, i) => (
        <div
          key={i}
          className={`dataflow__node ${hoveredStep === i ? "dataflow__node--active" : ""}`}
          onMouseEnter={() => setHoveredStep(i)}
          onMouseLeave={() => setHoveredStep(null)}
        >
          <div className="dataflow__index">{i + 1}</div>
          <div className="dataflow__body">
            <span className="dataflow__action">{step.action}</span>
            <code className="dataflow__code">{step.code}</code>
          </div>
          {i < flowSteps.length - 1 && (
            <div className={`dataflow__connector ${hoveredStep === i ? "dataflow__connector--pulse" : ""}`}>
              <svg width="20" height="24" viewBox="0 0 20 24"><path d="M10 0v20m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESEARCH PAGE
// ─────────────────────────────────────────────────────────────────────────────

const researchData = {
  title: "Spatial Behavior Analysis in Drosophila melanogaster",
  abstract:
    "This research investigates centrophobism and thigmotaxis in Drosophila during mating, demonstrating that mating status, genotype (Canton-S vs Corazonin), and hormonal factors significantly modulate anxiety-like spatial behaviors. Mating pairs show dramatically reduced center occupancy (0.15%) compared to unmated individuals, with implications for understanding the survival-reproduction tradeoff.",
  methods: [
    { label: "Recording", value: "10 fps video capture in 6mm arena height", icon: "R" },
    { label: "Strains", value: "Canton-S (n=170) and Corazonin (n=187)", icon: "S" },
    { label: "Analysis", value: "Mann-Whitney U tests, Pearson correlation, Python-based tracking", icon: "A" },
  ],
  findings: [
    { metric: "Center Time During Mating", value: "0.15", unit: "%", comparison: "vs 11.16% non-mating average", significance: "p < 0.001" },
    { metric: "CRZ vs CS Center Time", value: "3.05", unit: "% vs 0.15%", comparison: "Corazonin shows elevated center occupancy", significance: "U=5,758, p=5.32e-15" },
    { metric: "Movement (CRZ vs CS)", value: "345.8", unit: " vs 171.7", comparison: "Corazonin exhibits 2x movement", significance: "U=37.5, p=0.002" },
    { metric: "Post-mating Female Change", value: "9.87", unit: "% → 0.96%", comparison: "Canton-S females pre vs post", significance: "U=10,174, p=2.38e-6" },
  ],
  conclusions: [
    "Sexual reward decreases anxiety-like avoidance behaviors",
    "Corazonin genotype modulates risk-taking during mating",
    "Sex peptide and seminal fluid influence post-mating centrophobism",
    "Sexual dimorphism: males show higher baseline anxiety than females",
    "Mating latency weakly correlates with increased anxiety (r=-0.191)",
  ],
  references: [
    "Mohammad et al. (2016) Current Biology 26(7):981-986",
    "Bath et al. (2020) Animal Behaviour 166:1-7",
    "Gunaratne et al. (2012) Brain and Behavior 2(2):97-108",
    "Finn et al. (2003) Neurogenetics 4(3):109-135",
  ],
};

function ResearchPage() {
  return (
    <div className="research">
      {/* Hero */}
      <section className="research-hero">
        <div className="research-hero__bg">
          <div className="research-hero__orb research-hero__orb--1" />
          <div className="research-hero__orb research-hero__orb--2" />
        </div>
        <div className="research-hero__content">
          <Reveal>
            <span className="badge badge--purple">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6m-5 0v6.5L4 18a1 1 0 001 1h14a1 1 0 001-1l-6-8.5V3"/></svg>
              Peer-Reviewed Research
            </span>
          </Reveal>
          <Reveal delay={100}><h1 className="research-hero__title">{researchData.title}</h1></Reveal>
          <Reveal delay={200}><p className="research-hero__abstract">{researchData.abstract}</p></Reveal>
        </div>
      </section>

      <div className="research-body">
        {/* Methods */}
        <section className="rsection">
          <Reveal><SectionHead label="Experimental Design" title="Methodology" color="purple" /></Reveal>
          <div className="methods-grid">
            {researchData.methods.map((m, i) => (
              <Reveal key={m.label} delay={i * 100}>
                <div className="method-card">
                  <span className="method-card__icon">{m.icon}</span>
                  <span className="method-card__label">{m.label}</span>
                  <span className="method-card__value">{m.value}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Findings */}
        <section className="rsection">
          <Reveal><SectionHead label="Statistical Results" title="Key Findings" color="purple" /></Reveal>
          <div className="findings-grid">
            {researchData.findings.map((f, i) => (
              <Reveal key={f.metric} delay={i * 80}>
                <FindingCard {...f} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Conclusions */}
        <section className="rsection">
          <Reveal><SectionHead label="Summary" title="Conclusions" color="purple" /></Reveal>
          <div className="conclusions-list">
            {researchData.conclusions.map((c, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="conclusion-item">
                  <span className="conclusion-item__num">{i + 1}</span>
                  <p>{c}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* References */}
        <section className="rsection">
          <Reveal><SectionHead label="Citations" title="References" color="purple" /></Reveal>
          <div className="references-list">
            {researchData.references.map((r, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="reference-row">
                  <span className="reference-row__num">[{i + 1}]</span>
                  <span>{r}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function FindingCard({ metric, value, unit, comparison, significance }) {
  const [ref, vis] = useInView();
  const numVal = parseFloat(value);
  const animVal = useCountUp(numVal * 100, 1800, vis);

  return (
    <div ref={ref} className="finding-card">
      <span className="finding-card__metric">{metric}</span>
      <div className="finding-card__value">
        {(animVal / 100).toFixed(2)}<span className="finding-card__unit">{unit}</span>
      </div>
      <p className="finding-card__comp">{comparison}</p>
      <code className="finding-card__sig">{significance}</code>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} className={`reveal ${vis ? "reveal--visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function SectionHead({ label, title, color = "emerald" }) {
  return (
    <div className="section-head">
      <div className={`section-head__label section-head__label--${color}`}>
        <span className="section-head__line" />
        {label}
      </div>
      <h2 className="section-head__title">{title}</h2>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DOCUMENTATION PAGE
// ─────────────────────────────────────────────────────────────────────────────

function DocsPage() {
  const heroRef = useRef(null);
  const glowPos = useMouseGlow(heroRef);
  const subtitle = useTypewriter(
    "Real-time Drosophila mating behavior detection, tracking, and spatial analysis powered by computer vision.",
    25,
    600
  );

  return (
    <div className="docs">
      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <FlySimulation />
        <div className="hero__glow" style={{ left: glowPos.x, top: glowPos.y }} />
        <div className="hero__content">
          <Reveal>
            <span className="badge badge--green">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              Open Source Desktop Application
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="hero__title">
              Fly<span className="hero__title-accent">Tracker</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="hero__subtitle">{subtitle}<span className="cursor">|</span></p>
          </Reveal>
          <Reveal delay={400}>
            <div className="hero__chips">
              {["Python 3", "PyQt6", "OpenCV", "NumPy", "Pandas", "SciPy"].map((t) => (
                <span key={t} className="tech-chip">{t}</span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={500}>
            <div className="hero__stats">
              <StatCard value={6} suffix="+" label="PyQt Signals" detail="Real-time inter-thread communication" color="emerald" />
              <StatCard value={500} suffix="" label="Calibration Frames" detail="Automatic ROI detection window" color="blue" />
              <StatCard value={360} suffix="s" label="Mating Threshold" detail="6-minute verification window" color="rose" />
              <StatCard value={32} suffix="px" label="Center Threshold" detail="Spatial analysis zone radius" color="violet" />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="docs-body">
        {/* ── ARCHITECTURE ── */}
        <section className="dsection">
          <Reveal><SectionHead label="System Design" title="Architecture" /></Reveal>
          <Reveal delay={100}>
            <ArchExplorer />
          </Reveal>
        </section>

        {/* ── PIPELINE ── */}
        <section className="dsection">
          <Reveal><SectionHead label="Computer Vision" title="Processing Pipeline" /></Reveal>
          <Reveal delay={100}>
            <PipelineVisualizer />
          </Reveal>
        </section>

        {/* ── DATA FLOW ── */}
        <section className="dsection">
          <Reveal><SectionHead label="End to End" title="Data Flow" /></Reveal>
          <Reveal delay={100}>
            <DataFlowViz />
          </Reveal>

          {/* Output format */}
          <Reveal delay={200}>
            <div className="output-card">
              <h3 className="output-card__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                CSV Export Schema
              </h3>
              <p className="output-card__desc">Each video produces a comprehensive analysis file with the following columns:</p>
              <div className="output-grid">
                {[
                  { field: "ROI", desc: "Region of Interest index (0-based)" },
                  { field: "Mating Start Time (s)", desc: "Verified mating event start timestamp" },
                  { field: "Longest Duration (s)", desc: "Duration of confirmed mating (>= 360s)" },
                  { field: "Mating Status", desc: "Boolean: duration >= 360 seconds" },
                  { field: "Center-Mating Duration (s)", desc: "Time spent mating in arena center zone" },
                  { field: "Male Time in Center (s)", desc: "Total male center occupancy" },
                  { field: "Female Time in Center (s)", desc: "Total female center occupancy" },
                  { field: "Pre-mating Male Center (s)", desc: "Male center time before mating" },
                  { field: "Post-mating Male Center (s)", desc: "Male center time after mating" },
                  { field: "Pre-mating Female Center (s)", desc: "Female center time before mating" },
                  { field: "Post-mating Female Center (s)", desc: "Female center time after mating" },
                ].map((f) => (
                  <div key={f.field} className="output-row">
                    <code className="output-row__field">{f.field}</code>
                    <span className="output-row__desc">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── FEATURES ── */}
        <section className="dsection">
          <Reveal><SectionHead label="Capabilities" title="Key Features" /></Reveal>
          <div className="features-grid">
            {[
              { title: "Batch Processing", desc: "Queue entire directories of .mp4 files. Each video is processed sequentially with automatic CSV export on completion.", color: "emerald" },
              { title: "Void ROI Detection", desc: "Automatically identifies invalid chambers (>75% frames with wrong fly count). Manual void override supports ranges like '0,2,4-7'.", color: "rose" },
              { title: "Grace Period Logic", desc: "10-second grace window (scaled by frame skip rate) prevents brief fly separations from breaking mating event continuity.", color: "amber" },
              { title: "Frame Skipping", desc: "Configurable Nth-frame processing for performance. All timing calculations properly account for the skip rate.", color: "blue" },
              { title: "Trail Visualization", desc: "Mating pair movement trails drawn in green (only after 6-min confirmation). Female individual trails in blue during separation.", color: "violet" },
              { title: "JSON ROI Export", desc: "Export full arena geometry, ROI centers/radii, void status, and trail coordinates for downstream analysis.", color: "cyan" },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className={`feature-card feature-card--${f.color}`}>
                  <h4 className="feature-card__title">{f.title}</h4>
                  <p className="feature-card__desc">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("docs");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="app">
      <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
        <div className="nav__inner">
          <div className="nav__brand">
            <div className="nav__logo">
              <svg viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                <circle cx="12" cy="14" r="3" fill="currentColor" opacity="0.8"/>
                <circle cx="20" cy="18" r="2.5" fill="currentColor" opacity="0.6"/>
                <path d="M12 14 Q16 12 20 18" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none"/>
              </svg>
            </div>
            <span className="nav__name">FlyTracker</span>
          </div>
          <nav className="nav__links">
            <button
              className={`nav__link ${page === "docs" ? "nav__link--active" : ""}`}
              onClick={() => setPage("docs")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <span>Documentation</span>
            </button>
            <button
              className={`nav__link ${page === "research" ? "nav__link--active" : ""}`}
              onClick={() => setPage("research")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6m-5 0v6.5L4 18a1 1 0 001 1h14a1 1 0 001-1l-6-8.5V3"/></svg>
              <span>Research</span>
            </button>
          </nav>
        </div>
      </header>

      <main>{page === "docs" ? <DocsPage /> : <ResearchPage />}</main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="footer__logo-dot" />
            FlyTracker
          </div>
          <span className="footer__sep" />
          <span>Drosophila Mating Behavior Analysis</span>
          <span className="footer__sep" />
          <code className="footer__tech">PyQt6 + OpenCV + Pandas</code>
        </div>
      </footer>
    </div>
  );
}
