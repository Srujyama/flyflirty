import { useState, useEffect, useRef } from "react";
import "./App.css";

/* ── scroll reveal ──────────────────────────────────────────────────── */

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

/* ── figure component ───────────────────────────────────────────────── */

function Fig({ src, alt, caption, n }) {
  return (
    <figure className="fig">
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption>{n && <span className="fig-n">Fig. {n}</span>}{caption}</figcaption>}
    </figure>
  );
}

/* ── docs: sidebar nav items ────────────────────────────────────────── */

const docsSections = [
  { id: "overview", label: "overview" },
  { id: "getting-started", label: "getting-started" },
  { id: "usage", label: "usage" },
  { id: "architecture", label: "architecture" },
  { id: "pipeline", label: "pipeline" },
  { id: "data-export", label: "data-export" },
  { id: "configuration", label: "configuration" },
  { id: "contributing", label: "contributing" },
];

const researchSections = [
  { id: "r-abstract", label: "abstract" },
  { id: "r-introduction", label: "introduction" },
  { id: "r-methods", label: "methods" },
  { id: "r-results", label: "results" },
  { id: "r-discussion", label: "discussion" },
  { id: "r-future", label: "future-directions" },
  { id: "r-references", label: "references" },
];

/* ── Docs Page ──────────────────────────────────────────────────────── */

function DocsPage() {
  return (
    <div className="doc-body">
      {/* overview */}
      <section id="overview" className="doc-sec">
        <R>
          <h1 className="doc-h1">FlyTracker</h1>
          <p className="doc-lead">Automated detection and spatial analysis of <em>Drosophila melanogaster</em> mating behaviors through real-time video processing.</p>
          <div className="chips">
            {["Python 3", "PyQt6", "OpenCV", "NumPy", "Pandas", "SciPy"].map(t =>
              <span key={t} className="chip">{t}</span>
            )}
          </div>
        </R>
        <R delay={40}>
          <div className="doc-block">
            <p>FlyTracker is a desktop application built for research labs studying <em>Drosophila melanogaster</em> behavior. It processes video recordings of mating assays to detect flies, track their movement, identify mating events, and analyze spatial preferences within circular arenas.</p>
            <p>The software was developed to support research on thigmotaxis and centrophobism -- how mating status affects spatial behavior and anxiety-like responses in fruit flies.</p>
          </div>
        </R>
        <R delay={80}>
          <h3>Features</h3>
          <ul className="doc-list">
            <li>Real-time fly detection and tracking via OpenCV blob detection</li>
            <li>Automatic mating event detection with 6-minute verification threshold</li>
            <li>Gender identification through 30-frame rolling size average</li>
            <li>Spatial analysis: center zone occupancy, pre/post-mating behavior</li>
            <li>Batch video processing with queue management</li>
            <li>CSV and JSON data export</li>
            <li>Manual ROI voiding for invalid arenas</li>
          </ul>
        </R>
      </section>

      {/* getting started */}
      <section id="getting-started" className="doc-sec">
        <R><h2>Getting Started</h2></R>
        <R delay={20}>
          <h3>Requirements</h3>
          <pre className="doc-pre"><code>{`python >= 3.10
PyQt6 >= 6.5
opencv-python >= 4.8
numpy >= 1.24
pandas >= 2.0
scipy >= 1.11`}</code></pre>
        </R>
        <R delay={40}>
          <h3>Installation</h3>
          <pre className="doc-pre"><code>{`$ git clone https://github.com/srujanyamali/flytracker.git
$ cd flytracker
$ pip install -r requirements.txt
$ python main.py`}</code></pre>
        </R>
        <R delay={60}>
          <h3>Quick Start</h3>
          <ol className="doc-list doc-list--ol">
            <li>Launch the application with <code>python main.py</code></li>
            <li>Add video files to the processing queue</li>
            <li>Click <strong>Start</strong> to begin batch processing</li>
            <li>Monitor real-time detection in the video display</li>
            <li>Export data when processing completes</li>
          </ol>
        </R>
      </section>

      {/* usage */}
      <section id="usage" className="doc-sec">
        <R><h2>Usage</h2></R>
        <R delay={20}>
          <p>The main window provides a video display panel, processing controls, and data dashboards. Fly detection states are color-coded:</p>
          <div className="doc-colors">
            <div className="doc-color"><span className="dot dot--red" />Red -- non-mating fly (female)</div>
            <div className="doc-color"><span className="dot dot--cyan" />Cyan -- non-mating fly (male)</div>
            <div className="doc-color"><span className="dot dot--yellow" />Yellow -- unverified mating (&lt; 6 min)</div>
            <div className="doc-color"><span className="dot dot--blue" />Blue -- confirmed mating (&gt; 6 min)</div>
            <div className="doc-color"><span className="dot dot--green" />Green -- fly in center zone</div>
          </div>
        </R>
        <R delay={40}>
          <Fig src="/screen1.png" alt="FlyTracker detection view showing numbered ROIs with fly tracking" caption="Real-time detection view. Each ROI is numbered; colored dots indicate fly state and gender." />
        </R>
        <R delay={60}>
          <Fig src="/screen2.png" alt="FlyTracker detection view showing a different processing frame" caption="Detection across multiple arenas. Green/magenta circles show ROI boundaries and center zones." />
        </R>
        <R delay={80}>
          <h3>Video Controls</h3>
          <ul className="doc-list">
            <li><code>Start</code> -- begin processing the video queue</li>
            <li><code>Pause/Resume</code> -- toggle processing</li>
            <li><code>Skip</code> -- advance to the next video in the queue</li>
            <li>Frame skip rate adjusts processing speed vs accuracy</li>
          </ul>
        </R>
        <R delay={100}>
          <h3>ROI Management</h3>
          <p>Invalid arenas (e.g. empty, damaged) can be voided manually. Voided ROIs are excluded from data export and mating statistics.</p>
        </R>
      </section>

      {/* architecture */}
      <section id="architecture" className="doc-sec">
        <R><h2>Architecture</h2></R>
        <R><p>Two classes. One runs video processing on a background thread, the other is the GUI. They communicate through PyQt signals.</p></R>

        <R delay={30}>
          <div className="doc-card">
            <div className="doc-card-head">
              <code>VideoProcessingThread</code>
              <span className="doc-tag">QThread</span>
            </div>
            <p>Background video processing engine. Runs the full detection pipeline on every frame without blocking the GUI.</p>
            <h4>Signals</h4>
            <table className="doc-table">
              <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                {[
                  ["frame_processed", "(str, ndarray, dict)", "Annotated frame + mating durations"],
                  ["verified_mating_start_times", "(str, dict)", "Confirmed events (> 6 min)"],
                  ["center_mating_duration_signal", "(int, float)", "Per-ROI center zone mating time"],
                  ["center_gender_duration_signal", "(int, float, float)", "Male/female center occupancy"],
                  ["void_roi_signal", "(str, int)", "Marks invalid ROIs"],
                  ["mating_analysis_complete", "(str)", "Video processing finished"],
                ].map(([n, t, d]) => <tr key={n}><td><code>{n}</code></td><td><code className="dim">{t}</code></td><td>{d}</td></tr>)}
              </tbody>
            </table>
            <h4>Methods</h4>
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

        <R delay={60}>
          <div className="doc-card">
            <div className="doc-card-head">
              <code>MainWindow</code>
              <span className="doc-tag">QMainWindow</span>
            </div>
            <p>Primary GUI with video display, batch processing queue, real-time mating dashboards, and CSV export.</p>
            <h4>Slots</h4>
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

      {/* pipeline */}
      <section id="pipeline" className="doc-sec">
        <R><h2>Pipeline</h2></R>
        <R><p>Six stages run per-frame inside the processing thread.</p></R>

        <div className="steps">
          {[
            {
              n: "1", title: "Frame Preprocessing",
              desc: "Each frame is padded with 50px borders, converted to grayscale, binary-thresholded at 127. Contours extracted and sorted by a grid-aware comparator (y-tolerance 200px) for consistent ROI ordering.",
              code: `gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)`,
            },
            {
              n: "2", title: "ROI Calibration (500 frames)",
              desc: "During the first 500 processed frames, candidate contours with area > 500px are accumulated. The set is only committed if it has at least as many ROIs as the previous best. Mode radius computed via scipy.stats.mode.",
              code: `if processed_frame_count < 500:
    candidate = [c for c in contours if cv2.contourArea(c) > 500]
    if len(candidate) >= len(initial_contours):
        initial_contours = candidate`,
            },
            {
              n: "3", title: "Blob Detection",
              desc: "Each ROI is isolated with a circular mask. Morphological operations (close, dilate, erode with 6x6 kernel) clean noise. SimpleBlobDetector with minArea=1 finds fly-sized blobs. Keypoint count determines state: 2 = separated, 1 = mating, 0 = void candidate.",
              code: `params = cv2.SimpleBlobDetector_Params()
params.filterByArea = True
params.minArea = 1
detector = cv2.SimpleBlobDetector_create(params)
keypoints = detector.detect(gray)`,
            },
            {
              n: "4", title: "Mating Detection",
              desc: "When two flies merge into one blob, a mating event starts. A 10-second grace period (scaled by frame skip rate) handles brief separations. Events confirmed after 6 minutes.",
              code: `if len(keypoints) == 1:
    duration = (frame_count - start) / fps
    if duration < 360:
        cv2.circle(frame, (x,y), r, YELLOW, -1)
    else:
        cv2.circle(frame, (x,y), r, BLUE, -1)
        mating_start_times[roi] = start / fps`,
            },
            {
              n: "5", title: "Gender Identification",
              desc: "Identity maintained across frames with nearest-neighbor position matching. A 30-frame rolling size average determines gender (females are larger in D. melanogaster).",
              code: `# Nearest-neighbor slot assignment
d00 = norm(kp[0] - prev[0])
d01 = norm(kp[0] - prev[1])
if d00 + d11 <= d01 + d10:
    slot0, slot1 = kp[0], kp[1]

# 30-frame rolling average for gender
female = slot0 if avg_size[0] >= avg_size[1] else slot1`,
            },
            {
              n: "6", title: "Spatial Analysis",
              desc: "A 32px threshold defines the center zone. The system tracks center mating duration, per-gender center occupancy, and pre- vs post-mating center time independently.",
              code: `center_threshold = 32
dist = sqrt((x - center[0])**2 + (y - center[1])**2)
in_center = dist <= center_threshold

if not mating_ongoing and in_center:
    pre_mating_center[gender] += 1/fps`,
            },
          ].map((step, i) => (
            <R key={step.n} delay={i * 30}>
              <div className="step">
                <div className="step-n">{step.n}</div>
                <div className="step-body">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <pre className="doc-pre"><code>{step.code}</code></pre>
                </div>
              </div>
            </R>
          ))}
        </div>
      </section>

      {/* data-export */}
      <section id="data-export" className="doc-sec">
        <R><h2>Data Export</h2></R>
        <R><p>Each video produces a CSV with the following columns per ROI.</p></R>

        <R delay={30}>
          <table className="doc-table">
            <thead><tr><th>Column</th><th>Description</th></tr></thead>
            <tbody>
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
              ].map(([f, d]) => <tr key={f}><td><code>{f}</code></td><td>{d}</td></tr>)}
            </tbody>
          </table>
        </R>

        <R delay={60}>
          <h3>Additional Exports</h3>
          <div className="doc-grid-2">
            <div className="doc-card doc-card--sm">
              <h4>JSON ROI Export</h4>
              <p>Video path, dimensions, per-ROI center/radius, void status, mating flags, and full trail coordinate history.</p>
            </div>
            <div className="doc-card doc-card--sm">
              <h4>Combined Mating Times</h4>
              <p>DataFrame merging mating events within 1 second. Keeps the earlier start time. Includes ROI, start time, and duration.</p>
            </div>
          </div>
        </R>
      </section>

      {/* configuration */}
      <section id="configuration" className="doc-sec">
        <R><h2>Configuration</h2></R>
        <R delay={20}>
          <table className="doc-table">
            <thead><tr><th>Parameter</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              {[
                ["Calibration frames", "500", "Number of frames used for ROI detection calibration"],
                ["Min contour area", "500 px", "Minimum contour area to qualify as a candidate ROI"],
                ["Binary threshold", "127", "Grayscale threshold for binary conversion"],
                ["Border padding", "50 px", "Border added to each frame before processing"],
                ["Grace period", "10 s", "Maximum separation gap before mating event resets"],
                ["Mating threshold", "360 s", "Minimum duration to confirm a mating event (6 min)"],
                ["Center threshold", "32 px", "Distance from ROI center defining the center zone"],
                ["Morph kernel", "6x6", "Kernel size for morphological close/dilate/erode"],
                ["Rolling avg window", "30 frames", "Frame window for gender size averaging"],
                ["Y-tolerance", "200 px", "Vertical tolerance for grid-aware contour sorting"],
                ["Min blob area", "1 px", "Minimum blob area for SimpleBlobDetector"],
                ["Recording FPS", "10", "Expected video frame rate"],
              ].map(([p, d, desc]) => <tr key={p}><td><code>{p}</code></td><td><code className="dim">{d}</code></td><td>{desc}</td></tr>)}
            </tbody>
          </table>
        </R>
      </section>

      {/* contributing */}
      <section id="contributing" className="doc-sec">
        <R><h2>Contributing</h2></R>
        <R delay={20}>
          <div className="doc-block">
            <p>Contributions are welcome. Please follow standard fork-and-PR workflow.</p>
            <pre className="doc-pre"><code>{`$ git checkout -b feature/your-feature
$ # make changes
$ git commit -m "add: your feature description"
$ git push origin feature/your-feature`}</code></pre>
            <h3>Guidelines</h3>
            <ul className="doc-list">
              <li>Follow existing code style</li>
              <li>Test with multiple video formats before submitting</li>
              <li>Document new configuration parameters</li>
              <li>Keep commits atomic and descriptive</li>
            </ul>
          </div>
        </R>
        <R delay={40}>
          <h3>License</h3>
          <p>MIT License. See <code>LICENSE</code> for details.</p>
        </R>
        <R delay={60}>
          <h3>Contact</h3>
          <p>Srujan Yamali -- <a href="mailto:srujan@example.com">srujan@example.com</a></p>
        </R>
      </section>
    </div>
  );
}

/* ── Research Page ──────────────────────────────────────────────────── */

function ResearchPage() {
  return (
    <div className="doc-body">
      <section id="r-abstract" className="doc-sec">
        <R>
          <h1 className="doc-h1">The Impact of Mating on Thigmotaxis and Centrophobism in <em>Drosophila melanogaster</em></h1>
          <p className="doc-lead">Srujan Yamali</p>
        </R>
        <R delay={30}>
          <h2>Abstract</h2>
          <div className="doc-block">
            <p>In <em>Drosophila melanogaster</em>, mating behaviors are influenced by genetic factors and environmental cues, affecting social interactions and evolutionary outcomes. Taxis behaviors guide navigation and survival by responding to environmental stimuli. Centrophobism -- a preference for peripheral locations over central spaces -- reflects innate anxiety-like behaviors and survival strategies. However, the impacts of mating on thigmotaxis and centrophobism behaviors remains largely unexplored.</p>
            <p>This research demonstrates that <em>D. melanogaster</em> exhibits a significant increase in time spent in the center during mating compared to non-mating periods. Previously, it was thought that behaviors in <em>D. melanogaster</em> might not significantly alter spatial preferences, focusing instead on external stimuli such as pheromones and visual cues. The main result adds to our understanding by demonstrating a clear shift in spatial behavior during mating, with a marked preference for the center of the arena, suggesting an intrinsic behavioral change linked to mating status. This can also be manipulated by different genotypes and hormones such as Sex Peptide.</p>
            <p>The findings extend beyond fly biology, offering insights into broader principles of animal behavior. <em>Drosophila</em> can be used as a model organism to study fear and anxiety, potentially leading to gene therapies being developed at higher throughput.</p>
          </div>
        </R>
      </section>

      {/* Introduction */}
      <section id="r-introduction" className="doc-sec">
        <R><h2>Introduction</h2></R>
        <R delay={20}>
          <div className="doc-block">
            <h3><em>Drosophila melanogaster</em> as a Model Organism</h3>
            <p><em>D. melanogaster</em> is central to genetic, neurological, and behavioral research. The species exhibits thigmotaxis and centrophobism -- a preference for edges over open spaces. Mating alters <em>Drosophila</em> behavior based on social presence and potential for mating.</p>
          </div>
        </R>
        <R delay={40}>
          <Fig src="/figures/figure-3.jpeg" alt="Drosophila wall-following behavior patterns" caption="Drosophila wall-following behavior. Three specimens with corresponding movement traces showing edge preference (Mohammad et al., 2016)." n={1} />
        </R>
        <R delay={60}>
          <div className="doc-block">
            <h3>Understanding Human Psychology</h3>
            <p>Studies suggest a genetic basis for fear and anxiety-like behaviors, paralleling findings in other animals and mammals. Research into <em>Drosophila</em> may offer insights into anxiety in humans.</p>
            <h3>Research Gaps</h3>
            <p>There is limited understanding of the effects of mating on thigmotaxis and centrophobism, especially regarding sexual reward. This study addresses how mating status modulates spatial preferences and anxiety-like behaviors across two genotypes: Canton-S and Corazonin.</p>
          </div>
        </R>
      </section>

      {/* Methods */}
      <section id="r-methods" className="doc-sec">
        <R><h2>Materials &amp; Methods</h2></R>

        <R delay={20}>
          <h3>Behavioral Assays</h3>
          <div className="doc-block">
            <ul className="doc-list">
              <li>Recording rate: 10 frames per second, each arena 1 cm radius, 6 mm high</li>
              <li>Strains used: Canton-S (CS) and Corazonin (CRZ)</li>
              <li>Total assays tested: 255 (CS) and 447 (CRZ) respectively</li>
              <li>Conducted in darkness at 21-23C, 70% humidity</li>
              <li>Film barrier used for latency measurement</li>
              <li>Initial observations confirmed no significant preference for specific areas by Canton-S strain (female control)</li>
            </ul>
          </div>
        </R>

        <R delay={40}>
          <Fig src="/figures/figure-2.jpeg" alt="Mating assay apparatus with circular arenas and fly vials" caption="Mating assays (1 cm radius) and vials. 3D-printed arena plates with circular chambers for individual fly pairs. Red illumination for dark-condition recording (Photograph by Researcher)." n={2} />
        </R>

        <R delay={50}>
          <Fig src="/figures/figure-4.jpeg" alt="Drosophila vials with corn-meal medium" caption="Fly stock vials. Canton-S and Corazonin strains grown on corn-meal medium. Flies were CO2 anesthetized, sexed, and sex-separated before assays." n={3} />
        </R>

        <R delay={60}>
          <h3>Video Analysis</h3>
          <div className="doc-block">
            <p>Custom tracking software (FlyTracker) capabilities include tracking the onset and duration of mating, spatial analysis, and compiling data. Color coding: red = non-mating flies, green = fly in center (mating/non-mating), blue = mating on edge, yellow = contact.</p>
          </div>
        </R>

        <R delay={70}>
          <h3>Statistical Analysis</h3>
          <div className="doc-block">
            <ul className="doc-list">
              <li>Data graphed and analyzed using Python's matplotlib and pandas modules</li>
              <li>All graphs were produced solely by the researcher</li>
              <li>Analysis based on 170 CS and 187 CRZ assays, cleaned by mating status</li>
              <li>Statistical tests: Mann-Whitney U tests and Pearson R correlation</li>
              <li>Outliers defined as data points below Q1 - 1.5*IQR or above Q3 + 1.5*IQR</li>
              <li>Final dataset after cleaning: 137 Canton-S and 145 Corazonin assays</li>
            </ul>
          </div>
        </R>
      </section>

      {/* Results */}
      <section id="r-results" className="doc-sec">
        <R><h2>Results</h2></R>

        {/* Spatial Preferences During Mating */}
        <R delay={20}>
          <h3>Spatial Preferences During Mating</h3>
          <div className="doc-block">
            <p><em>Drosophila</em> spends a significantly lower mean/median percent of time in the center during mating (0.15% / 0.00%) compared to males (5.70% / 5.27%), females (16.63% / 15.05%), and average non-mating (11.16% / 10.88%).</p>
            <p>Difference in sex values: U = 22854.0, p = 7.7e-31. Evidence that Corazonin affects spatial patterns with mean/median center time during mating increased to 3.05% / 0.43%.</p>
            <p>Comparison of Canton-S and Corazonin: U = 5758.0, p = 5.32e-15. CRZ shows increased male center time (6.72% / 5.93%) and decreased female center time (10.56% / 9.46%).</p>
          </div>
        </R>

        <R delay={30}>
          <Fig src="/figures/figure-5.png" alt="Box plot comparing CRZ vs CS percent time in center across conditions" caption="Comparison of percent time spent in the center: CRZ vs CS. Box plots showing mating, female, male, and non-mating center time distributions for both strains." n={4} />
        </R>

        <R delay={40}>
          <div className="stat-grid">
            {[
              { label: "CS mating center time", val: "0.07%", sub: "median ~0%, vs 5.12% male / 14.78% female non-mating", p: "p = 4.07e-43 (male), p = 1.23e-44 (female)" },
              { label: "CRZ mating center time", val: "3.57%", sub: "median 1.15%, vs 6.57% male / 10.23% female non-mating", p: "p = 7.29e-12 (male), p = 3.60e-20 (female)" },
              { label: "CS sex difference (non-mating)", val: "p = 2.08e-21", sub: "Males 4.81% median vs females 13.86% median", p: "Pronounced sexual dimorphism in spatial use" },
              { label: "CRZ sex difference (non-mating)", val: "p = 7.25e-6", sub: "Similar sex-specific pattern as Canton-S", p: "Reinforces sex-specific spatial behaviors" },
            ].map((s, i) => (
              <R key={i} delay={i * 20}>
                <div className="stat">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-val">{s.val}</span>
                  <span className="stat-sub">{s.sub}</span>
                  <code className="stat-p">{s.p}</code>
                </div>
              </R>
            ))}
          </div>
        </R>

        {/* Spatial Differences Visualization */}
        <R delay={50}>
          <h3>Visualization of Spatial Differences During Mating</h3>
          <div className="doc-block">
            <p>Corazonin exhibits significantly more movement than Canton-S. Average movement for CS: ~171.73 points; for CRZ: ~345.8 points. Mann-Whitney U test: U = 37.5, p = 0.002.</p>
          </div>
        </R>

        <R delay={60}>
          <Fig src="/figures/figure-6.jpeg" alt="Spatial movement traces comparing Canton-S and Corazonin strains" caption="Visualization of spatial differences during mating. Top row: Canton-S movement traces. Bottom row: Corazonin movement traces. CRZ shows substantially more movement and center exploration." n={5} />
        </R>

        <R delay={65}>
          <Fig src="/figures/figure-8.png" alt="Bar chart of average movement points per fly ID comparing CS and CRZ" caption="Average movement points per fly. CS (light teal) vs CRZ (dark teal) across 15 individual fly assays, showing consistently higher movement in Corazonin flies." n={6} />
        </R>

        {/* Pre vs Post Mating */}
        <R delay={70}>
          <h3>Pre- vs Post-Mating Centrophobism</h3>
          <div className="doc-block">
            <p><em>Drosophila</em> spends statistically more time in the center pre-mating in CS females: mean/median pre-mating 9.87% / 8.90% vs post-mating 0.96% / 0.00%. Female pre vs post: U = 10174.0, p = 2.38e-6. No significant difference in CS males: U = 12278.0, p = 0.0166.</p>
            <p>Corazonin affects these patterns with increases in post-mating times for males (4.28% / 3.68%) and females (16.10% / 15.00%). CRZ shows a different trend than CS, with statistically less time in the center pre-mating in females than post-mating. Female pre vs post: U = 29178.0, p = 4.4e-31.</p>
          </div>
        </R>

        <R delay={75}>
          <Fig src="/figures/figure-9.png" alt="Box plot of pre vs post mating centrophobism by sex and strain" caption="Pre vs post mating centrophobism. CRZ (blue) vs CS (green) across male and female pre/post conditions. Note the dramatic decrease in CRZ female post-mating center time." n={7} />
        </R>

        <R delay={80}>
          <div className="stat-grid">
            {[
              { label: "CS males post-mating", val: "3.62% -> 5.22%", sub: "Increased center time post-mating", p: "May indicate mate guarding or seeking additional mates" },
              { label: "CS females post-mating", val: "8.80% -> 15.38%", sub: "Substantial increase in center time", p: "Possibly avoiding further mating or resource searching" },
              { label: "CRZ males post-mating", val: "6.16% -> 2.24%", sub: "Decreased center time post-mating", p: "p = 7.29e-12 -- loss of sexual reward motivation" },
              { label: "CRZ females post-mating", val: "12.11% -> 2.52%", sub: "Marked reduction in center time", p: "p = 3.60e-20 -- protective strategy post-mating" },
            ].map((s, i) => (
              <R key={i} delay={i * 20}>
                <div className="stat">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-val">{s.val}</span>
                  <span className="stat-sub">{s.sub}</span>
                  <code className="stat-p">{s.p}</code>
                </div>
              </R>
            ))}
          </div>
        </R>

        {/* How Sex Affects Mating */}
        <R delay={90}>
          <h3>How Sex Affects Mating Center Time</h3>
          <div className="doc-block">
            <p>No correlation between percent time in center during mating and percent time in center for either sex. Pearson r = 0.031, p = 0.691 (females); r = -0.064, p = 0.420 (males).</p>
          </div>
        </R>

        <R delay={95}>
          <Fig src="/figures/figure-7.png" alt="Scatter plot of center mating time vs male/female center time" caption="Percent time in center mating vs male/female. Blue dots = males, orange crosses = females. Regression lines show no meaningful correlation for either sex." n={8} />
        </R>

        {/* Latency and Duration */}
        <R delay={100}>
          <h3>Latency and Duration Correlations</h3>
          <div className="doc-block">
            <p>There is a correlation between center time during mating and latency (Pearson r = -0.191, p = 0.032) but no correlation with duration (r = 0.069, p = 0.446). Shorter latency is linked to more center time.</p>
          </div>
        </R>

        <R delay={105}>
          <Fig src="/figures/figure-10.png" alt="Scatter plot of latency and duration vs center time with regression lines" caption="Percent time in center mating vs latency/duration. Blue = latency, green = duration. Latency shows a negative correlation while duration shows no significant relationship." n={9} />
        </R>

        <R delay={110}>
          <div className="doc-grid-2">
            <div className="doc-card doc-card--sm">
              <h4>Center Time vs Mating Duration</h4>
              <p>CRZ: r = 0.460, p = 2.92e-8 (moderate positive). CS: r = 0.163, p = 0.053. Longer mating durations associated with more center usage.</p>
            </div>
            <div className="doc-card doc-card--sm">
              <h4>Latency vs Center Mating Time</h4>
              <p>CRZ: r = -0.20, p = 0.22 (weak negative, n.s.). CS: r = 0.40, p = 0.05 (moderate positive). Shorter latency linked to more center time in CS.</p>
            </div>
          </div>
        </R>
        <R delay={115}>
          <div className="doc-grid-2">
            <div className="doc-card doc-card--sm">
              <h4>CRZ Female Center vs Mating</h4>
              <p>r = -0.45, p = 0.03. As mating activity increases, female center presence decreases. Females minimize exposure during vulnerable mating.</p>
            </div>
            <div className="doc-card doc-card--sm">
              <h4>CS Male Center vs Mating</h4>
              <p>r = 0.35, p = 0.04. Males use the center more during mating. Possibly a strategy to enhance visibility or monitor for rivals.</p>
            </div>
          </div>
        </R>
      </section>

      {/* Discussion */}
      <section id="r-discussion" className="doc-sec">
        <R><h2>Discussion</h2></R>

        <R delay={20}>
          <div className="doc-block">
            <h3>Spatial Behavior and Mating</h3>
            <p>The data shows spatial dynamics are modulated by mating. During mating, wall-following increases -- a measure of fear-based anxiety-like behavior (Finn et al., 2003). Taxis behaviors in <em>Drosophila</em> are not static but change during mating, with distinct male/female preferences reflecting broader sexual dimorphism.</p>
          </div>
        </R>

        <R delay={40}>
          <div className="doc-block">
            <h3>Evolutionary Implications</h3>
            <p>Open-space aversion is driven by predation risk and decreased reproductive fitness (Kacsoh et al., 2015). The finding that mating location varies by genotype (Canton-S vs Corazonin) points to genetic pathways governing spatial preference during reproduction. Females show stronger spatial preference shifts, possibly linked to courtship behavior or competitive visibility.</p>
          </div>
        </R>

        <R delay={60}>
          <div className="doc-block">
            <h3>Fear Model Applications</h3>
            <p>Centrophobism in <em>Drosophila</em> correlates with anxiety (Mohammad et al., 2016). This study validates <em>Drosophila</em> as a model for studying how behavioral states modulate fear. Findings could inform gene therapies for anxiety disorders through the conserved genetic basis between fly and mammalian anxiety pathways.</p>
          </div>
        </R>

        <R delay={80}>
          <div className="doc-block">
            <h3>Sexual Reward</h3>
            <p>The presence of some center-dwelling during mating (despite the risk) suggests a sexual reward mechanism that outweighs predation risk. This is likely tied to the NPF/NPFR system -- analogous to mammalian NPY -- which modulates reward and stress responses. Failure to mate increases stress behaviors, especially in males (Ryvkin et al., 2024).</p>
          </div>
        </R>

        <R delay={90}>
          <h3>Conclusions</h3>
          <div className="doc-block">
            <ul className="doc-list">
              <li>Investigation focuses on spatial behaviors of <em>Drosophila</em> during mating showing that fear or anxiety-like behaviors might be decreased during mating</li>
              <li>Mating activities significantly impact <em>Drosophila</em>'s survival strategies and modulate survival tactics like predator avoidance</li>
              <li>Sexual dimorphism in spatial preferences highlights evolutionary significance</li>
              <li><em>Drosophila</em> sex peptide or seminal fluid causes differences in centrophobism between CRZ and CS strains</li>
              <li>Sexual reward causes a decrease in anxiety as CRZ flies mate longer in the center than standard males</li>
              <li>Sexual dimorphism suggests males are naturally more fearful or anxious than females</li>
              <li>Longer latency to mate is associated with a minor increase in anxiety, which could be evolutionary to help find a mate</li>
            </ul>
          </div>
        </R>
      </section>

      {/* Future Directions */}
      <section id="r-future" className="doc-sec">
        <R><h2>Future Directions</h2></R>

        <R delay={20}>
          <div className="doc-block">
            <h3>Behavioral Mechanisms</h3>
            <ul className="doc-list">
              <li>Explore the neurobiological and genetic bases of changes in spatial behavior</li>
              <li>Investigate the processing of mating signals and their impact on behavioral alterations</li>
              <li>Examine the molecular pathways involved in these behavioral changes</li>
            </ul>
          </div>
        </R>

        <R delay={40}>
          <div className="doc-block">
            <h3>Environmental Influences</h3>
            <ul className="doc-list">
              <li>Study the impact of different environmental contexts on mating behaviors and spatial preferences</li>
              <li>Analyze the adaptability and plasticity of mating behaviors in response to environmental changes</li>
              <li>Investigate how different habitat types influence mating behaviors and strategies</li>
            </ul>
          </div>
        </R>

        <R delay={60}>
          <div className="doc-block">
            <h3>Sexual Reward System</h3>
            <ul className="doc-list">
              <li>How does sexual reward impact <em>Drosophila</em> risk-taking behaviors through evolution?</li>
              <li>Does lack of natural reward cause an increase in anxiety that can be filled to the same degree with artificial reward?</li>
              <li>Pathways link addiction with anxiety-like behaviors in both <em>Drosophila</em> and mammals that can be tested</li>
              <li>Understand how natural and artificial rewards affect centrophobism and anxiety-like behaviors</li>
            </ul>
          </div>
        </R>
      </section>

      {/* References */}
      <section id="r-references" className="doc-sec">
        <R><h2>References</h2></R>
        <R delay={20}>
          <div className="refs">
            {[
              "Bath, E., Thomson, J., & Perry, J. (2020). Anxiety-like behaviour is regulated independently from sex, mating status and the sex peptide receptor in Drosophila melanogaster. Animal Behaviour, 166, 1-7.",
              "Besson, M. & Martin, J.-R. (2005). Centrophobism/thigmotaxis, a new role for the mushroom bodies in Drosophila. J Neurobiology, 62(3), 386-396.",
              "Finn, D. A., Rutledge-Gorman, M. T., & Crabbe, J. C. (2003). Genetic animal models of anxiety. Neurogenetics, 4(3), 109-135.",
              "Gotz, K. G. & Biesinger, R. (1985). Centrophobism in Drosophila melanogaster. J Comp Physiology, 156(3), 329-337.",
              "Gunaratne, G. H., Pletcher, S. D., & Roman, G. (2012). Open-field arena boundary is a primary object of exploration for Drosophila. Brain and Behavior, 2(2), 97-108.",
              "Kacsoh, B. Z. et al. (2015). Social communication of predator-induced changes in Drosophila behavior and germ line physiology. eLife, 4, e07423.",
              "Keleman, K. et al. (2012). Dopamine neurons modulate pheromone responses in Drosophila courtship learning. Nature, 489(7414), 145-149.",
              "Liu, C. et al. (2020). A serotonin-modulated circuit controls sleep architecture to regulate cognitive function. Nature Communications, 11(1).",
              "Mohammad, F., Aryal, S., Ho, J., Stewart, J., Norman, N., Tan, T., Eisaka, A., & Claridge-Chang, A. (2016). Ancient Anxiety Pathways Influence Drosophila Defense Behaviors. Current Biology, 26(7), 981-986.",
              "Ryvkin, J. et al. (2024). Failure to mate enhances investment in behaviors that may promote mating in Drosophila. PLOS Genetics, 20(1), e1011054.",
              "Valente, D. et al. (2007). Analysis of the trajectory of Drosophila melanogaster in a circular open field arena. PLoS ONE, 2(10), e1083.",
            ].map((r, i) => (
              <div key={i} className="ref"><span className="ref-n">{i + 1}</span><span>{r}</span></div>
            ))}
          </div>
        </R>
      </section>
    </div>
  );
}

/* ── Sidebar ────────────────────────────────────────────────────────── */

function Sidebar({ mode, active, onNav }) {
  const items = mode === "docs" ? docsSections : researchSections;
  return (
    <aside className="sidebar">
      <div className="sb-tree">
        <div className="sb-label">{mode === "docs" ? "docs/" : "research/"}</div>
        {items.map(({ id, label }) => (
          <button
            key={id}
            className={`sb-item ${active === id ? "sb-item--on" : ""}`}
            onClick={() => onNav(id)}
          >
            <span className="sb-dash">{active === id ? ">" : "-"}</span>
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ── Root ────────────────────────────────────────────────────────────── */

export default function App() {
  const [mode, setMode] = useState("docs");
  const [active, setActive] = useState("overview");
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActive(mode === "docs" ? "overview" : "r-abstract");
    setSidebarOpen(false);
  }, [mode]);

  const handleNav = (id) => {
    setActive(id);
    setSidebarOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // track active section on scroll
  useEffect(() => {
    const items = mode === "docs" ? docsSections : researchSections;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [mode]);

  return (
    <div className="app">
      <header className={`nav ${scrolled ? "nav--s" : ""}`}>
        <div className="nav-inner">
          <div className="nav-left">
            <button className="nav-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
              <span /><span /><span />
            </button>
            <span className="nav-brand">flytracker</span>
          </div>
          <div className="nav-links">
            <button className={`nav-btn ${mode === "docs" ? "nav-btn--on" : ""}`} onClick={() => setMode("docs")}>docs</button>
            <button className={`nav-btn ${mode === "research" ? "nav-btn--on" : ""}`} onClick={() => setMode("research")}>research</button>
            <a className="nav-btn" href="/poster.pdf" target="_blank" rel="noopener noreferrer">poster</a>
          </div>
        </div>
      </header>

      <div className="layout">
        <Sidebar mode={mode} active={active} onNav={handleNav} />
        {sidebarOpen && <div className="sb-overlay" onClick={() => setSidebarOpen(false)} />}
        <div className={`sb-mobile ${sidebarOpen ? "sb-mobile--open" : ""}`}>
          <Sidebar mode={mode} active={active} onNav={handleNav} />
        </div>
        <main className="content">
          {mode === "docs" ? <DocsPage /> : <ResearchPage />}
        </main>
      </div>

      <footer className="foot">
        <span>flytracker</span>
        <span className="foot-sep" />
        <span>PyQt6 + OpenCV</span>
        <span className="foot-sep" />
        <span>Srujan Yamali</span>
      </footer>
    </div>
  );
}
