import { useState, useEffect, useRef } from "react";
import "./App.css";

/* ── Scroll reveal ─────────────────────────────────────────────────────── */

function useInView() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(e.target); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function R({ children, delay = 0 }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} className={`r ${vis ? "r--v" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Documentation Page ────────────────────────────────────────────────── */

function DocsPage() {
  const [tab, setTab] = useState("arch");

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="label">Srujan Yamali</p>
          <h1>FlyTracker</h1>
          <p className="hero-sub">
            A desktop application for automated detection and spatial analysis of
            Drosophila melanogaster mating behaviors through real-time video processing.
          </p>
          <div className="chips">
            {["Python 3", "PyQt6", "OpenCV", "NumPy", "Pandas", "SciPy"].map(t =>
              <span key={t} className="chip">{t}</span>
            )}
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* Tabs */}
        <nav className="tabs">
          {[
            ["arch", "Architecture"],
            ["pipeline", "Pipeline"],
            ["export", "Data Export"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`tab ${tab === id ? "tab--on" : ""}`}
              onClick={() => setTab(id)}
            >{label}</button>
          ))}
        </nav>

        {tab === "arch" && <ArchSection />}
        {tab === "pipeline" && <PipelineSection />}
        {tab === "export" && <ExportSection />}
      </div>
    </>
  );
}

function ArchSection() {
  return (
    <section className="sec">
      <R><h2>System Architecture</h2></R>
      <R><p className="sec-desc">Two classes. One runs video processing on a background thread, the other is the GUI. They communicate through PyQt signals.</p></R>

      <R delay={50}>
        <div className="card">
          <div className="card-head">
            <code className="card-name">VideoProcessingThread</code>
            <span className="card-tag">QThread</span>
          </div>
          <p className="card-desc">Background video processing engine. Runs the full detection pipeline on every frame without blocking the GUI.</p>

          <h4>Signals</h4>
          <div className="tbl">
            {[
              ["frame_processed", "(str, ndarray, dict)", "Annotated frame + current mating durations"],
              ["verified_mating_start_times", "(str, dict)", "Confirmed mating events (> 6 min)"],
              ["center_mating_duration_signal", "(int, float)", "Per-ROI center zone mating time"],
              ["center_gender_duration_signal", "(int, float, float)", "Male/female center occupancy"],
              ["void_roi_signal", "(str, int)", "Marks invalid ROIs"],
              ["mating_analysis_complete", "(str)", "Video processing finished"],
            ].map(([name, type, desc]) => (
              <div key={name} className="tbl-row">
                <code>{name}</code>
                <code className="tbl-type">{type}</code>
                <span>{desc}</span>
              </div>
            ))}
          </div>

          <h4>Key Methods</h4>
          <div className="tag-list">
            {["run()", "process_frame()", "detect_flies()", "export_roi_locations()", "export_combined_mating_times()", "void_roi()"].map(m =>
              <code key={m} className="tag">{m}</code>
            )}
          </div>

          <h4>State</h4>
          <div className="tag-list">
            {["mating_durations{}", "mating_start_times{}", "void_rois{}", "fly_trail_history{}", "center_gender_duration{}", "fly_size_history{}", "roi_details{}"].map(v =>
              <code key={v} className="tag tag--dim">{v}</code>
            )}
          </div>
        </div>
      </R>

      <R delay={100}>
        <div className="card">
          <div className="card-head">
            <code className="card-name">MainWindow</code>
            <span className="card-tag">QMainWindow</span>
          </div>
          <p className="card-desc">Primary GUI with video display, batch processing queue, real-time mating dashboards, and CSV export.</p>

          <h4>Connected Slots</h4>
          <div className="tag-list">
            {["update_video_frame()", "update_frame_info()", "update_verified_mating_times()", "update_center_mating_duration()", "update_center_gender_duration()", "void_roi_handler()", "export_dataframe()"].map(s =>
              <code key={s} className="tag">{s}</code>
            )}
          </div>

          <h4>UI Panels</h4>
          <div className="tag-list">
            {["Video Display (860x440)", "Video Controls + FPS", "Mating Durations", "Verified Mating Times", "Center Duration Panels", "Video Queue", "Manual ROI Void", "Data Export"].map(p =>
              <span key={p} className="tag tag--outline">{p}</span>
            )}
          </div>
        </div>
      </R>
    </section>
  );
}

function PipelineSection() {
  return (
    <section className="sec">
      <R><h2>Processing Pipeline</h2></R>
      <R><p className="sec-desc">Six stages that run per-frame inside the processing thread.</p></R>

      <div className="steps">
        {[
          {
            n: "1", title: "Frame Preprocessing",
            desc: "Each frame is padded with 50px borders, converted to grayscale, binary-thresholded at 127. Contours extracted and sorted by a grid-aware comparator (y-tolerance 200px) for consistent ROI ordering.",
            code: `gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n_, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)\ncontours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)`,
          },
          {
            n: "2", title: "ROI Calibration (500 frames)",
            desc: "During the first 500 processed frames, candidate contours with area > 500px are accumulated. The set is only committed if it has at least as many ROIs as the previous best. Mode radius computed via scipy.stats.mode.",
            code: `if processed_frame_count < 500:\n    candidate = [c for c in contours if cv2.contourArea(c) > 500]\n    if len(candidate) >= len(initial_contours):\n        initial_contours = candidate`,
          },
          {
            n: "3", title: "Blob Detection",
            desc: "Each ROI is isolated with a circular mask. Morphological operations (close, dilate, erode with 6x6 kernel) clean noise. SimpleBlobDetector with minArea=1 finds fly-sized blobs. Keypoint count determines state: 2 = separated, 1 = mating, 0 = void candidate.",
            code: `params = cv2.SimpleBlobDetector_Params()\nparams.filterByArea = True\nparams.minArea = 1\ndetector = cv2.SimpleBlobDetector_create(params)\nkeypoints = detector.detect(gray)`,
          },
          {
            n: "4", title: "Mating Detection",
            desc: "When two flies merge into one blob, a mating event starts. A 10-second grace period (scaled by frame skip rate) handles brief separations. Events confirmed after 6 minutes. Yellow dots = unverified, blue = confirmed.",
            code: `if len(keypoints) == 1:\n    duration = (frame_count - start) / fps\n    if duration < 360:\n        cv2.circle(frame, (x,y), r, YELLOW, -1)\n    else:\n        cv2.circle(frame, (x,y), r, BLUE, -1)\n        mating_start_times[roi] = start / fps`,
          },
          {
            n: "5", title: "Gender Identification",
            desc: "Identity maintained across frames with nearest-neighbor position matching. A 30-frame rolling size average determines gender (females are larger in D. melanogaster). Red dots = female, cyan = male.",
            code: `# Nearest-neighbor slot assignment\nd00 = norm(kp[0] - prev[0])\nd01 = norm(kp[0] - prev[1])\nif d00 + d11 <= d01 + d10:\n    slot0, slot1 = kp[0], kp[1]\n\n# 30-frame rolling average for gender\nfemale = slot0 if avg_size[0] >= avg_size[1] else slot1`,
          },
          {
            n: "6", title: "Spatial Analysis",
            desc: "A 32px threshold defines the center zone. The system tracks center mating duration, per-gender center occupancy, and pre- vs post-mating center time independently. This quantifies centrophobism and thigmotaxis.",
            code: `center_threshold = 32\ndist = sqrt((x - center[0])**2 + (y - center[1])**2)\nin_center = dist <= center_threshold\n\nif not mating_ongoing and in_center:\n    pre_mating_center[gender] += 1/fps`,
          },
        ].map((step, i) => (
          <R key={step.n} delay={i * 40}>
            <div className="step">
              <div className="step-n">{step.n}</div>
              <div className="step-body">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <pre><code>{step.code}</code></pre>
              </div>
            </div>
          </R>
        ))}
      </div>
    </section>
  );
}

function ExportSection() {
  return (
    <section className="sec">
      <R><h2>Data Export</h2></R>
      <R><p className="sec-desc">Each video produces a CSV with the following columns per ROI.</p></R>

      <R delay={50}>
        <div className="card">
          <div className="export-grid">
            {[
              ["ROI", "Region of Interest index (0-based)"],
              ["Mating Start Time (s)", "Verified mating event start timestamp"],
              ["Longest Duration (s)", "Duration of confirmed mating (>= 360s)"],
              ["Mating Status", "Boolean: duration >= 360 seconds"],
              ["Center-Mating Duration (s)", "Time spent mating inside the center zone"],
              ["Male Time in Center (s)", "Total male center occupancy"],
              ["Female Time in Center (s)", "Total female center occupancy"],
              ["Pre-mating Male Center (s)", "Male center time before mating onset"],
              ["Post-mating Male Center (s)", "Male center time after mating onset"],
              ["Pre-mating Female Center (s)", "Female center time before mating onset"],
              ["Post-mating Female Center (s)", "Female center time after mating onset"],
            ].map(([field, desc]) => (
              <div key={field} className="export-row">
                <code>{field}</code>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </R>

      <R delay={100}>
        <h3 className="mt">Additional Exports</h3>
        <div className="card-grid-2">
          <div className="card card--sm">
            <h4>JSON ROI Export</h4>
            <p>Video path, dimensions, per-ROI center/radius, void status, mating flags, and full trail coordinate history.</p>
          </div>
          <div className="card card--sm">
            <h4>Combined Mating Times</h4>
            <p>DataFrame merging mating events within 1 second. Keeps the earlier start time. Includes ROI, start time, and duration.</p>
          </div>
        </div>
      </R>
    </section>
  );
}

/* ── Research Page ──────────────────────────────────────────────────────── */

function ResearchPage() {
  return (
    <>
      <section className="hero hero--r">
        <div className="hero-inner">
          <p className="label">Research Paper</p>
          <h1>The Impact of Mating on Thigmotaxis and Centrophobism in <em>Drosophila melanogaster</em></h1>
          <p className="hero-sub">Srujan Yamali</p>
        </div>
      </section>

      <div className="wrap">
        {/* Abstract */}
        <section className="sec">
          <R><h2>Abstract</h2></R>
          <R>
            <div className="card">
              <p>In <em>Drosophila melanogaster</em>, mating behaviors are influenced by genetic factors and environmental cues, affecting social interactions and evolutionary outcomes. Centrophobism -- a preference for peripheral locations over central spaces -- reflects innate anxiety-like behaviors and survival strategies. This research demonstrates that <em>D. melanogaster</em> exhibits a significant decrease in time spent in the center during mating compared to non-mating periods. The findings show a clear shift in spatial behavior during mating, with a marked preference for the periphery, suggesting behavioral changes linked to mating status. This can also be manipulated by different genotypes and seminal fluid. The behavioral state of the <em>Drosophila</em> can change the amount of fear that they experience, regulated through biological factors, with implications for understanding anxiety in humans using <em>Drosophila</em> as a model organism.</p>
            </div>
          </R>
        </section>

        {/* Methods */}
        <section className="sec">
          <R><h2>Materials & Methods</h2></R>
          <div className="card-grid-3">
            <R><div className="card card--sm">
              <h4>Fly Stocks</h4>
              <p>Canton-S and Corazonin strains. Grown on corn-meal medium at 18C (larval phase), shifted to 25C with 12hr light/dark post-emergence. CO2 anesthetized, sexed, sex-separated.</p>
            </div></R>
            <R delay={40}><div className="card card--sm">
              <h4>Behavioral Assays</h4>
              <p>Circular arenas, 1cm radius, 6mm height. 10 fps recording. Conducted in darkness, 21-23C, 70% humidity. Film barrier for latency measurement. 255 Canton-S and 447 Corazonin assays total.</p>
            </div></R>
            <R delay={80}><div className="card card--sm">
              <h4>Analysis</h4>
              <p>Custom tracking software (FlyTracker). Data cleaned with pandas, outliers removed (IQR +/- 1.5). Final dataset: 137 Canton-S and 145 Corazonin assays. Mann-Whitney U tests, Pearson correlation.</p>
            </div></R>
          </div>
        </section>

        {/* Results */}
        <section className="sec">
          <R><h2>Results</h2></R>

          <R><h3>Center Behavior During Mating</h3></R>
          <R><p className="sec-desc">Flies spent dramatically less time in the center during mating vs. non-mating periods.</p></R>

          <div className="stat-grid">
            {[
              { label: "CS mating center time", val: "0.07%", sub: "median ~0%, vs 5.12% male / 14.78% female non-mating", p: "p = 4.07e-43 (male), p = 1.23e-44 (female)" },
              { label: "CRZ mating center time", val: "3.57%", sub: "median 1.15%, vs 6.57% male / 10.23% female non-mating", p: "p = 7.29e-12 (male), p = 3.60e-20 (female)" },
              { label: "CS sex difference (non-mating)", val: "p = 2.08e-21", sub: "Males 4.81% median vs females 13.86% median", p: "Pronounced sexual dimorphism in spatial use" },
              { label: "CRZ sex difference (non-mating)", val: "p = 7.25e-6", sub: "Similar sex-specific pattern as Canton-S", p: "Reinforces sex-specific spatial behaviors" },
            ].map((s, i) => (
              <R key={i} delay={i * 30}>
                <div className="stat">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-val">{s.val}</span>
                  <span className="stat-sub">{s.sub}</span>
                  <code className="stat-p">{s.p}</code>
                </div>
              </R>
            ))}
          </div>

          <R><h3 className="mt">Mating Status Effects on Centrophobism</h3></R>
          <R><p className="sec-desc">Pre- vs post-mating spatial preferences varied by strain and sex.</p></R>

          <div className="stat-grid">
            {[
              { label: "CS males post-mating", val: "3.62% -> 5.22%", sub: "Increased center time post-mating", p: "May indicate mate guarding or seeking additional mates" },
              { label: "CS females post-mating", val: "8.80% -> 15.38%", sub: "Substantial increase in center time", p: "Possibly avoiding further mating or resource searching" },
              { label: "CRZ males post-mating", val: "6.16% -> 2.24%", sub: "Decreased center time post-mating", p: "p = 7.29e-12 -- loss of sexual reward motivation" },
              { label: "CRZ females post-mating", val: "12.11% -> 2.52%", sub: "Marked reduction in center time", p: "p = 3.60e-20 -- protective strategy post-mating" },
            ].map((s, i) => (
              <R key={i} delay={i * 30}>
                <div className="stat">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-val">{s.val}</span>
                  <span className="stat-sub">{s.sub}</span>
                  <code className="stat-p">{s.p}</code>
                </div>
              </R>
            ))}
          </div>

          <R><h3 className="mt">Correlation Analyses</h3></R>
          <div className="card-grid-2">
            <R><div className="card card--sm">
              <h4>Center Time vs Mating Duration</h4>
              <p>CRZ: r = 0.460, p = 2.92e-8 (moderate positive). CS: r = 0.163, p = 0.053. Longer mating durations associated with more center usage.</p>
            </div></R>
            <R delay={40}><div className="card card--sm">
              <h4>Latency vs Center Mating Time</h4>
              <p>CRZ: r = -0.20, p = 0.22 (weak negative, n.s.). CS: r = 0.40, p = 0.05 (moderate positive). Shorter latency linked to more center time in CS.</p>
            </div></R>
          </div>
          <div className="card-grid-2">
            <R><div className="card card--sm">
              <h4>CRZ Female Center vs Mating</h4>
              <p>r = -0.45, p = 0.03. As mating activity increases, female center presence decreases. Females minimize exposure during vulnerable mating.</p>
            </div></R>
            <R delay={40}><div className="card card--sm">
              <h4>CS Male Center vs Mating</h4>
              <p>r = 0.35, p = 0.04. Males use the center more during mating. Possibly a strategy to enhance visibility or monitor for rivals.</p>
            </div></R>
          </div>
        </section>

        {/* Discussion */}
        <section className="sec">
          <R><h2>Discussion</h2></R>
          <R>
            <div className="card">
              <h4>Spatial Behavior and Mating</h4>
              <p>The data shows spatial dynamics are modulated by mating. During mating, wall-following increases -- a measure of fear-based anxiety-like behavior (Finn et al., 2003). Taxis behaviors in <em>Drosophila</em> are not static but change during mating, with distinct male/female preferences reflecting broader sexual dimorphism in the species.</p>
            </div>
          </R>
          <R delay={40}>
            <div className="card">
              <h4>Evolutionary Implications</h4>
              <p>Open-space aversion is driven by predation risk and decreased reproductive fitness (Kacsoh et al., 2015). The finding that mating location varies by genotype (Canton-S vs Corazonin) points to genetic pathways governing spatial preference during reproduction. Females show stronger spatial preference shifts, possibly linked to courtship behavior or competitive visibility.</p>
            </div>
          </R>
          <R delay={80}>
            <div className="card">
              <h4>Fear Model Applications</h4>
              <p>Centrophobism in <em>Drosophila</em> correlates with anxiety (Mohammad et al., 2016). This study validates <em>Drosophila</em> as a model for studying how behavioral states modulate fear. Findings could inform gene therapies for anxiety disorders through the conserved genetic basis between fly and mammalian anxiety pathways.</p>
            </div>
          </R>
          <R delay={120}>
            <div className="card">
              <h4>Sexual Reward</h4>
              <p>The presence of some center-dwelling during mating (despite the risk) suggests a sexual reward mechanism that outweighs predation risk. This is likely tied to the NPF/NPFR system -- analogous to mammalian NPY -- which modulates reward and stress responses. Failure to mate increases stress behaviors, especially in males (Ryvkin et al., 2024).</p>
            </div>
          </R>
        </section>

        {/* References */}
        <section className="sec">
          <R><h2>References</h2></R>
          <R>
            <div className="refs">
              {[
                "Bath et al. (2020) Animal Behaviour 166:1-7",
                "Besson & Martin (2005) J Neurobiology 62(3):386-396",
                "Finn et al. (2003) Neurogenetics 4(3):109-135",
                "Gotz & Biesinger (1985) J Comp Physiology 156(3):329-337",
                "Kacsoh et al. (2015) eLife 4:e07423",
                "Keleman et al. (2012) Nature 489(7414):145-149",
                "Liu et al. (2020) Nature Communications 11(1)",
                "Mohammad et al. (2016) Current Biology 26(7):981-986",
                "Ryvkin et al. (2024) PLOS Genetics 20(1):e1011054",
                "Soibam, Mann et al. (2012) Brain and Behavior 2(2):97-108",
                "Valente et al. (2007) PLoS ONE 2(10):e1083",
              ].map((r, i) => (
                <div key={i} className="ref"><span className="ref-n">{i + 1}</span><span>{r}</span></div>
              ))}
            </div>
          </R>
        </section>
      </div>
    </>
  );
}

/* ── Root ───────────────────────────────────────────────────────────────── */

export default function App() {
  const [page, setPage] = useState("docs");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  return (
    <div className="app">
      <header className={`nav ${scrolled ? "nav--s" : ""}`}>
        <div className="nav-inner">
          <span className="nav-brand">FlyTracker</span>
          <div className="nav-links">
            <button className={`nav-btn ${page === "docs" ? "nav-btn--on" : ""}`} onClick={() => setPage("docs")}>Docs</button>
            <button className={`nav-btn ${page === "research" ? "nav-btn--on" : ""}`} onClick={() => setPage("research")}>Research</button>
          </div>
        </div>
      </header>
      <main>{page === "docs" ? <DocsPage /> : <ResearchPage />}</main>
      <footer className="foot">
        <span>FlyTracker</span>
        <span className="foot-sep" />
        <span>PyQt6 + OpenCV</span>
        <span className="foot-sep" />
        <span>Srujan Yamali</span>
      </footer>
    </div>
  );
}
