import { useState, useEffect, useRef } from "react";
import "./App.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const codeOverview = {
  title: "Fly Behavior Analysis Tool",
  description:
    "A PyQt6-based desktop application for automated detection and analysis of Drosophila mating behaviors through real-time video processing.",
  tech: ["Python 3", "PyQt6", "OpenCV", "NumPy", "Pandas"],
};

const coreClasses = [
  {
    name: "VideoProcessingThread",
    icon: "thread",
    purpose:
      "Handles video processing in a separate thread to keep the UI responsive",
    keyFeatures: [
      "Processes video frames in real-time at configurable FPS",
      "Detects and tracks flies using blob detection algorithms",
      "Identifies mating events when two flies merge into one blob",
      "Tracks mating duration with visual feedback",
      "Emits signals for frame updates, mating times, and processing status",
    ],
    signals: [
      { name: "finished", desc: "Emitted when video processing completes" },
      { name: "frame_processed", desc: "Sends processed frame with annotations" },
      { name: "frame_info", desc: "Reports current frame number and timestamp" },
      {
        name: "verified_mating_start_times",
        desc: "Confirms mating events exceeding 6 minutes",
      },
    ],
  },
  {
    name: "MainWindow",
    icon: "window",
    purpose: "The primary GUI interface for user interaction and display",
    keyFeatures: [
      "Multi-video batch processing support",
      "Real-time video display with ROI annotations",
      "Mating duration tracking per region of interest",
      "Navigation between multiple loaded videos",
      "CSV export of mating data with adjusted timestamps",
    ],
    uiComponents: [
      { name: "Video Display", desc: "Processed video with fly tracking overlays" },
      { name: "Video Controls", desc: "FPS input, select/start/stop processing" },
      { name: "Video List", desc: "Queue of loaded videos for batch processing" },
      { name: "Mating Info Panel", desc: "Real-time durations and verified mating times" },
      { name: "Navigation", desc: "Previous/Next buttons for multi-video review" },
      { name: "Export", desc: "Save mating data to CSV files" },
    ],
  },
  {
    name: "FlyInfoWindow",
    icon: "info",
    purpose: "Secondary window displaying detailed fly metrics",
    keyFeatures: [
      "Shows male and female fly sizes per ROI",
      "Updates in real-time during video processing",
      "Helps verify gender identification accuracy",
    ],
  },
];

const algorithmSteps = [
  {
    title: "Frame Preprocessing",
    code: `gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, 
                               cv2.CHAIN_APPROX_SIMPLE)`,
    explanation:
      "Converts each frame to grayscale, applies binary thresholding to isolate arena regions, and detects contours representing individual experimental chambers.",
  },
  {
    title: "ROI Calibration",
    code: `if frame_count <= 500:
    initial_contours.clear()
    for i, contour in enumerate(contours_list):
        area = cv2.contourArea(contour)
        if area > 100:  # Filter noise
            initial_contours.append({
                "contour": contour, 
                "edge_duration": 0
            })`,
    explanation:
      "During the first 500 frames, the system calibrates by identifying stable arena regions. Contours with area > 100 pixels are tracked as valid ROIs.",
  },
  {
    title: "Blob Detection",
    code: `params = cv2.SimpleBlobDetector_Params()
params.filterByArea = True
params.minArea = 10
detector = cv2.SimpleBlobDetector_create(params)
keypoints = detector.detect(gray)`,
    explanation:
      "Uses OpenCV's SimpleBlobDetector to identify flies within each masked ROI. Minimum area threshold filters out noise while detecting fly-sized objects.",
  },
  {
    title: "Mating Detection Logic",
    code: `if len(keypoints) == 1:  # Mating occurring
    mating_duration = (frame_count - 
                       self.mating_start_frames[i]) / self.fps
    if mating_duration < 360:
        cv2.circle(frame, (x,y), radius, (0,255,255), -1)  # Yellow
    else:
        cv2.circle(frame, (x,y), radius, (255,0,0), -1)    # Blue
        # Verify mating event`,
    explanation:
      "When two flies merge into a single blob, a mating event begins. Yellow indicates early mating; blue confirms events lasting > 6 minutes (verified mating).",
  },
  {
    title: "Gender Identification",
    code: `sizes = [keypoint.size for keypoint in keypoints]
if len(sizes) == 2:
    male_index = sizes.index(min(sizes))    # Smaller
    female_index = sizes.index(max(sizes))  # Larger
    self.roi_fly_data[i] = {
        "male": sizes[male_index],
        "female": sizes[female_index]
    }`,
    explanation:
      "When flies separate, size-based heuristics identify gender — females are typically larger than males in Drosophila melanogaster.",
  },
];

const dataFlow = [
  { step: 1, action: "User loads video(s)", component: "MainWindow.select_video()" },
  { step: 2, action: "Processing starts in background", component: "VideoProcessingThread.run()" },
  { step: 3, action: "Each frame is analyzed", component: "process_frame() + detect_flies()" },
  { step: 4, action: "Signals update UI in real-time", component: "PyQt signals → MainWindow slots" },
  { step: 5, action: "Mating data accumulated", component: "mating_durations{} + mating_start_times{}" },
  { step: 6, action: "Export to CSV", component: "export_dataframe() → pandas DataFrame" },
];

const researchData = {
  title: "Spatial Behavior Analysis in Drosophila melanogaster",
  abstract:
    "This research investigates centrophobism and thigmotaxis in Drosophila during mating, demonstrating that mating status, genotype (Canton-S vs Corazonin), and hormonal factors significantly modulate anxiety-like spatial behaviors. Mating pairs show dramatically reduced center occupancy (0.15%) compared to unmated individuals, with implications for understanding the survival-reproduction tradeoff.",
  methods: {
    recording: "10 fps video capture in 6mm arena height",
    strains: "Canton-S (n=170) and Corazonin (n=187)",
    analysis: "Mann-Whitney U tests, Pearson correlation, Python-based tracking",
  },
  keyFindings: [
    {
      metric: "Center Time During Mating",
      value: "0.15%",
      comparison: "vs 11.16% non-mating average",
      significance: "p < 0.001",
    },
    {
      metric: "CRZ vs CS Center Time",
      value: "3.05% vs 0.15%",
      comparison: "Corazonin shows elevated center occupancy",
      significance: "U=5,758, p=5.32e-15",
    },
    {
      metric: "Movement (CRZ vs CS)",
      value: "345.8 vs 171.7",
      comparison: "Corazonin exhibits 2x movement",
      significance: "U=37.5, p=0.002",
    },
    {
      metric: "Post-mating Female Change",
      value: "9.87% → 0.96%",
      comparison: "Canton-S females pre vs post",
      significance: "U=10,174, p=2.38e-6",
    },
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

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useInView(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

// ─── Small Components ────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, isVisible] = useInView();
  return (
    <div
      ref={ref}
      className={`fade-in ${isVisible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children, variant = "green" }) {
  return (
    <div className={`section-label section-label--${variant}`}>
      <span className="section-label__line" />
      <span className="section-label__text">{children}</span>
    </div>
  );
}

function IconBox({ type, size = "md" }) {
  const icons = {
    thread: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
      </svg>
    ),
    window: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4m0-4h.01" />
      </svg>
    ),
    code: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    science: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6m-5 0v6.5L4 18a1 1 0 001 1h14a1 1 0 001-1l-6-8.5V3" />
        <path d="M8 14h8" />
      </svg>
    ),
    pipeline: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="8" cy="6" r="2" fill="currentColor" />
        <circle cx="16" cy="12" r="2" fill="currentColor" />
        <circle cx="10" cy="18" r="2" fill="currentColor" />
      </svg>
    ),
    flow: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18m0 0l-4-4m4 4l4-4M3 12h4m10 0h4" />
      </svg>
    ),
  };
  return <span className={`icon-box icon-box--${size}`}>{icons[type]}</span>;
}

// ─── Page Components ─────────────────────────────────────────────────────────

function HeroSection({ page }) {
  const isResearch = page === "research";
  return (
    <section className={`hero ${isResearch ? "hero--research" : ""}`}>
      <div className="hero__bg">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__grid" />
      </div>
      <div className="hero__content">
        <FadeIn>
          <div className={`hero__badge ${isResearch ? "hero__badge--research" : ""}`}>
            <IconBox type={isResearch ? "science" : "code"} size="sm" />
            <span>{isResearch ? "Research Study" : "Python Desktop App"}</span>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <h1 className="hero__title">
            {isResearch ? researchData.title : codeOverview.title}
          </h1>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="hero__subtitle">
            {isResearch ? researchData.abstract : codeOverview.description}
          </p>
        </FadeIn>
        {!isResearch && (
          <FadeIn delay={300}>
            <div className="hero__tech">
              {codeOverview.tech.map((t) => (
                <span key={t} className="tech-chip">{t}</span>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function CodePage() {
  const [activeTab, setActiveTab] = useState("architecture");

  const tabs = [
    { id: "architecture", label: "Architecture", icon: "window" },
    { id: "algorithm", label: "Algorithm", icon: "pipeline" },
    { id: "dataflow", label: "Data Flow", icon: "flow" },
  ];

  return (
    <>
      <HeroSection page="code" />
      <div className="content-wrap">
        <nav className="tabs">
          <div className="tabs__track">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tabs__btn ${activeTab === tab.id ? "tabs__btn--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconBox type={tab.icon} size="xs" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {activeTab === "architecture" && <ArchitectureSection />}
        {activeTab === "algorithm" && <AlgorithmSection />}
        {activeTab === "dataflow" && <DataFlowSection />}
      </div>
    </>
  );
}

function ArchitectureSection() {
  return (
    <section className="section">
      <FadeIn>
        <SectionLabel>System Architecture</SectionLabel>
        <h2 className="section__title">Core Classes</h2>
        <p className="section__desc">
          Three primary classes power the application, each handling a distinct
          responsibility in the processing pipeline.
        </p>
      </FadeIn>
      <div className="arch-grid">
        {coreClasses.map((cls, idx) => (
          <FadeIn key={cls.name} delay={idx * 100}>
            <div className="arch-card">
              <div className="arch-card__header">
                <IconBox type={cls.icon} size="md" />
                <div>
                  <h3 className="arch-card__name">{cls.name}</h3>
                  <p className="arch-card__purpose">{cls.purpose}</p>
                </div>
              </div>

              <div className="arch-card__body">
                <div className="arch-card__group">
                  <h4 className="arch-card__label">Key Features</h4>
                  <ul className="feature-list">
                    {cls.keyFeatures.map((f, i) => (
                      <li key={i} className="feature-list__item">
                        <span className="feature-list__dot" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {cls.signals && (
                  <div className="arch-card__group">
                    <h4 className="arch-card__label">Signals</h4>
                    <div className="signal-grid">
                      {cls.signals.map((s) => (
                        <div key={s.name} className="signal-chip">
                          <code className="signal-chip__code">{s.name}</code>
                          <span className="signal-chip__desc">{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cls.uiComponents && (
                  <div className="arch-card__group">
                    <h4 className="arch-card__label">UI Components</h4>
                    <div className="ui-comp-grid">
                      {cls.uiComponents.map((c) => (
                        <div key={c.name} className="ui-comp">
                          <strong className="ui-comp__name">{c.name}</strong>
                          <span className="ui-comp__desc">{c.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function AlgorithmSection() {
  return (
    <section className="section">
      <FadeIn>
        <SectionLabel>Processing Pipeline</SectionLabel>
        <h2 className="section__title">Algorithm Breakdown</h2>
        <p className="section__desc">
          A five-stage computer vision pipeline that transforms raw video into
          structured mating behavior data.
        </p>
      </FadeIn>
      <div className="pipeline">
        {algorithmSteps.map((step, idx) => (
          <FadeIn key={step.title} delay={idx * 80}>
            <div className="pipeline__step">
              <div className="pipeline__marker">
                <span className="pipeline__num">{idx + 1}</span>
                {idx < algorithmSteps.length - 1 && <span className="pipeline__line" />}
              </div>
              <div className="pipeline__card">
                <h3 className="pipeline__title">{step.title}</h3>
                <div className="code-block">
                  <div className="code-block__header">
                    <span className="code-block__dot" />
                    <span className="code-block__dot" />
                    <span className="code-block__dot" />
                    <span className="code-block__lang">python</span>
                  </div>
                  <pre className="code-block__body">
                    <code>{step.code}</code>
                  </pre>
                </div>
                <p className="pipeline__explanation">{step.explanation}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function DataFlowSection() {
  return (
    <section className="section">
      <FadeIn>
        <SectionLabel>System Flow</SectionLabel>
        <h2 className="section__title">Application Data Flow</h2>
        <p className="section__desc">
          End-to-end data journey from video input to structured CSV export.
        </p>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="flow-track">
          {dataFlow.map((item, idx) => (
            <div key={item.step} className="flow-node">
              <div className="flow-node__badge">{item.step}</div>
              <div className="flow-node__content">
                <span className="flow-node__action">{item.action}</span>
                <code className="flow-node__code">{item.component}</code>
              </div>
              {idx < dataFlow.length - 1 && (
                <div className="flow-node__connector">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14m0 0l-4-4m4 4l4-4" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div className="output-card">
          <div className="output-card__header">
            <IconBox type="info" size="sm" />
            <h3>Output Format</h3>
          </div>
          <p className="output-card__desc">
            The application exports a CSV file containing:
          </p>
          <div className="output-card__fields">
            {[
              { field: "ROI", desc: "Region of Interest identifier" },
              { field: "Start Time", desc: "Mating start (adjusted -360s for verification window)" },
              { field: "Longest Duration", desc: "Maximum mating duration recorded for this ROI" },
            ].map((f) => (
              <div key={f.field} className="output-field">
                <code className="output-field__name">{f.field}</code>
                <span className="output-field__desc">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function ResearchPage() {
  return (
    <>
      <HeroSection page="research" />
      <div className="content-wrap">
        {/* Methodology */}
        <section className="section">
          <FadeIn>
            <SectionLabel variant="purple">Experimental Design</SectionLabel>
            <h2 className="section__title">Methodology</h2>
          </FadeIn>
          <div className="methods">
            {[
              { label: "Recording", value: researchData.methods.recording, icon: "R" },
              { label: "Strains", value: researchData.methods.strains, icon: "S" },
              { label: "Analysis", value: researchData.methods.analysis, icon: "A" },
            ].map((m, idx) => (
              <FadeIn key={m.label} delay={idx * 100}>
                <div className="method-card">
                  <span className="method-card__icon">{m.icon}</span>
                  <div>
                    <span className="method-card__label">{m.label}</span>
                    <span className="method-card__value">{m.value}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Key Findings */}
        <section className="section">
          <FadeIn>
            <SectionLabel variant="purple">Statistical Results</SectionLabel>
            <h2 className="section__title">Key Findings</h2>
          </FadeIn>
          <div className="findings">
            {researchData.keyFindings.map((f, idx) => (
              <FadeIn key={f.metric} delay={idx * 100}>
                <div className="finding">
                  <span className="finding__metric">{f.metric}</span>
                  <span className="finding__value">{f.value}</span>
                  <span className="finding__comp">{f.comparison}</span>
                  <code className="finding__sig">{f.significance}</code>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Conclusions */}
        <section className="section">
          <FadeIn>
            <SectionLabel variant="purple">Summary</SectionLabel>
            <h2 className="section__title">Conclusions</h2>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="conclusions">
              {researchData.conclusions.map((c, i) => (
                <div key={i} className="conclusion">
                  <span className="conclusion__num">{i + 1}</span>
                  <p className="conclusion__text">{c}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* References */}
        <section className="section">
          <FadeIn>
            <SectionLabel variant="purple">Citations</SectionLabel>
            <h2 className="section__title">References</h2>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="references">
              {researchData.references.map((ref, i) => (
                <div key={i} className="reference">
                  <span className="reference__num">[{i + 1}]</span>
                  <span className="reference__text">{ref}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>
      </div>
    </>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("code");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="app">
      <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner">
          <div className="navbar__brand">
            <div className="navbar__logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
                <path d="M8 12c0-2 1.5-4 4-4s4 2 4 4-1.5 4-4 4-4-2-4-4" />
                <path d="M12 8V2M8 12H2m10 4v6m4-10h6" />
              </svg>
            </div>
            <span className="navbar__name">FlyTracker</span>
          </div>
          <nav className="navbar__nav">
            <button
              className={`navbar__link ${page === "code" ? "navbar__link--active" : ""}`}
              onClick={() => setPage("code")}
            >
              <IconBox type="code" size="xs" />
              <span>Documentation</span>
            </button>
            <button
              className={`navbar__link ${page === "research" ? "navbar__link--active" : ""}`}
              onClick={() => setPage("research")}
            >
              <IconBox type="science" size="xs" />
              <span>Research</span>
            </button>
          </nav>
        </div>
      </header>

      <main>
        {page === "code" ? <CodePage /> : <ResearchPage />}
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__left">
            <div className="navbar__logo navbar__logo--sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
                <path d="M8 12c0-2 1.5-4 4-4s4 2 4 4-1.5 4-4 4-4-2-4-4" />
              </svg>
            </div>
            <span>FlyTracker</span>
          </div>
          <div className="footer__center">
            Drosophila Mating Behavior Analysis
          </div>
          <div className="footer__right">
            PyQt6 + OpenCV
          </div>
        </div>
      </footer>
    </div>
  );
}
