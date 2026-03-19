import { useState } from "react";
import "./App.css";

// Code documentation data
const codeOverview = {
    title: "Fly Behavior Analysis Tool",
    description: "A PyQt6-based desktop application for automated detection and analysis of Drosophila mating behaviors through real-time video processing.",
    tech: ["Python 3", "PyQt6", "OpenCV", "NumPy", "Pandas"],
};

const coreClasses = [
    {
        name: "VideoProcessingThread",
        purpose: "Handles video processing in a separate thread to keep the UI responsive",
        keyFeatures: [
            "Processes video frames in real-time at configurable FPS",
            "Detects and tracks flies using blob detection algorithms",
            "Identifies mating events when two flies merge into one blob",
            "Tracks mating duration with visual feedback (yellow → blue dots)",
            "Emits signals for frame updates, mating times, and processing status",
        ],
        signals: [
            { name: "finished", desc: "Emitted when video processing completes" },
            { name: "frame_processed", desc: "Sends processed frame with annotations" },
            { name: "frame_info", desc: "Reports current frame number and timestamp" },
            { name: "verified_mating_start_times", desc: "Confirms mating events exceeding 6 minutes" },
        ],
    },
    {
        name: "MainWindow",
        purpose: "The primary GUI interface for user interaction and display",
        keyFeatures: [
            "Multi-video batch processing support",
            "Real-time video display with ROI annotations",
            "Mating duration tracking per region of interest",
            "Navigation between multiple loaded videos",
            "CSV export of mating data with adjusted timestamps",
        ],
        uiComponents: [
            { name: "Video Display", desc: "Shows processed video with fly tracking overlays" },
            { name: "Video Controls", desc: "FPS input, select/start/stop processing" },
            { name: "Video List", desc: "Queue of loaded videos for batch processing" },
            { name: "Mating Info Panel", desc: "Real-time durations and verified mating times" },
            { name: "Navigation", desc: "Previous/Next buttons for multi-video review" },
            { name: "Export", desc: "Save mating data to CSV files" },
        ],
    },
    {
        name: "FlyInfoWindow",
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
        explanation: "Converts each frame to grayscale, applies binary thresholding to isolate arena regions, and detects contours representing individual experimental chambers.",
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
        explanation: "During the first 500 frames, the system calibrates by identifying stable arena regions. Contours with area > 100 pixels are tracked as valid ROIs.",
    },
    {
        title: "Blob Detection",
        code: `params = cv2.SimpleBlobDetector_Params()
params.filterByArea = True
params.minArea = 10
detector = cv2.SimpleBlobDetector_create(params)
keypoints = detector.detect(gray)`,
        explanation: "Uses OpenCV's SimpleBlobDetector to identify flies within each masked ROI. Minimum area threshold filters out noise while detecting fly-sized objects.",
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
        explanation: "When two flies merge into a single blob, a mating event begins. Yellow indicates early mating; blue confirms events lasting > 6 minutes (verified mating).",
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
        explanation: "When flies separate, size-based heuristics identify gender—females are typically larger than males in Drosophila melanogaster.",
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

// Research paper data (condensed scientific focus)
const researchData = {
    title: "Spatial Behavior Analysis in Drosophila melanogaster",
    abstract: "This research investigates centrophobism and thigmotaxis in Drosophila during mating, demonstrating that mating status, genotype (Canton-S vs Corazonin), and hormonal factors significantly modulate anxiety-like spatial behaviors. Mating pairs show dramatically reduced center occupancy (0.15%) compared to unmated individuals, with implications for understanding the survival-reproduction tradeoff.",
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

function CodePage() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <main className="container">
            <section className="hero">
                <div className="pill">
                    <span className="pill-icon">🐍</span>
                    Python Application
                </div>
                <h1>{codeOverview.title}</h1>
                <p className="subtitle">{codeOverview.description}</p>

                <div className="tech-stack">
                    {codeOverview.tech.map((t) => (
                        <span key={t} className="tech-badge">{t}</span>
                    ))}
                </div>
            </section>

            <nav className="tab-nav">
                {[
                    { id: "overview", label: "Architecture" },
                    { id: "algorithm", label: "Algorithm" },
                    { id: "dataflow", label: "Data Flow" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {activeTab === "overview" && (
                <section className="section">
                    <h2>Core Classes</h2>
                    <div className="class-grid">
                        {coreClasses.map((cls) => (
                            <div key={cls.name} className="class-card">
                                <div className="class-header">
                                    <span className="class-icon">◆</span>
                                    <h3>{cls.name}</h3>
                                </div>
                                <p className="class-purpose">{cls.purpose}</p>

                                <div className="class-section">
                                    <h4>Key Features</h4>
                                    <ul>
                                        {cls.keyFeatures.map((f, i) => (
                                            <li key={i}>{f}</li>
                                        ))}
                                    </ul>
                                </div>

                                {cls.signals && (
                                    <div className="class-section">
                                        <h4>Signals</h4>
                                        <div className="signal-list">
                                            {cls.signals.map((s) => (
                                                <div key={s.name} className="signal-item">
                                                    <code>{s.name}</code>
                                                    <span>{s.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {cls.uiComponents && (
                                    <div className="class-section">
                                        <h4>UI Components</h4>
                                        <div className="component-list">
                                            {cls.uiComponents.map((c) => (
                                                <div key={c.name} className="component-item">
                                                    <strong>{c.name}</strong>
                                                    <span>{c.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {activeTab === "algorithm" && (
                <section className="section">
                    <h2>Processing Pipeline</h2>
                    <div className="algorithm-steps">
                        {algorithmSteps.map((step, idx) => (
                            <div key={step.title} className="algorithm-card">
                                <div className="step-number">{idx + 1}</div>
                                <div className="step-content">
                                    <h3>{step.title}</h3>
                                    <pre className="code-block">
                                        <code>{step.code}</code>
                                    </pre>
                                    <p className="step-explanation">{step.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {activeTab === "dataflow" && (
                <section className="section">
                    <h2>Application Data Flow</h2>
                    <div className="dataflow-container">
                        {dataFlow.map((item, idx) => (
                            <div key={item.step} className="dataflow-item">
                                <div className="flow-step">{item.step}</div>
                                <div className="flow-content">
                                    <div className="flow-action">{item.action}</div>
                                    <code className="flow-component">{item.component}</code>
                                </div>
                                {idx < dataFlow.length - 1 && <div className="flow-arrow">↓</div>}
                            </div>
                        ))}
                    </div>

                    <div className="card info-card">
                        <h3>Output Format</h3>
                        <p>The application exports a CSV file containing:</p>
                        <div className="output-fields">
                            <div className="field">
                                <code>ROI</code>
                                <span>Region of Interest identifier</span>
                            </div>
                            <div className="field">
                                <code>Start Time</code>
                                <span>Mating start (adjusted -360s for verification window)</span>
                            </div>
                            <div className="field">
                                <code>Longest Duration</code>
                                <span>Maximum mating duration recorded for this ROI</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}

function ResearchPage() {
    return (
        <main className="container research-container">
            <section className="hero">
                <div className="pill research-pill">
                    <span className="pill-icon">🔬</span>
                    Research Study
                </div>
                <h1>{researchData.title}</h1>
                <p className="subtitle">{researchData.abstract}</p>
            </section>

            <section className="section">
                <h2>Methodology</h2>
                <div className="methods-grid">
                    <div className="method-item">
                        <span className="method-label">Recording</span>
                        <span className="method-value">{researchData.methods.recording}</span>
                    </div>
                    <div className="method-item">
                        <span className="method-label">Strains</span>
                        <span className="method-value">{researchData.methods.strains}</span>
                    </div>
                    <div className="method-item">
                        <span className="method-label">Analysis</span>
                        <span className="method-value">{researchData.methods.analysis}</span>
                    </div>
                </div>
            </section>

            <section className="section">
                <h2>Key Findings</h2>
                <div className="findings-grid">
                    {researchData.keyFindings.map((finding) => (
                        <div key={finding.metric} className="finding-card">
                            <div className="finding-metric">{finding.metric}</div>
                            <div className="finding-value">{finding.value}</div>
                            <div className="finding-comparison">{finding.comparison}</div>
                            <div className="finding-sig">{finding.significance}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section">
                <h2>Conclusions</h2>
                <div className="card">
                    <ul className="conclusions-list">
                        {researchData.conclusions.map((c, i) => (
                            <li key={i}>{c}</li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="section">
                <h2>References</h2>
                <div className="card references-card">
                    {researchData.references.map((ref, i) => (
                        <div key={i} className="reference-item">{ref}</div>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default function App() {
    const [page, setPage] = useState("code");

    return (
        <div className="page">
            <header className="nav">
                <div className="brand">
                    <span className="brand-icon">🪰</span>
                    FlyTracker
                </div>
                <div className="nav-links">
                    <button
                        className={`navlink ${page === "code" ? "active" : ""}`}
                        onClick={() => setPage("code")}
                    >
                        Code Documentation
                    </button>
                    <button
                        className={`navlink ${page === "research" ? "active" : ""}`}
                        onClick={() => setPage("research")}
                    >
                        Research Paper
                    </button>
                </div>
            </header>

            {page === "code" ? <CodePage /> : <ResearchPage />}

            <footer className="footer container">
                <div className="footer-content">
                    <span>Drosophila Mating Behavior Analysis</span>
                    <span className="footer-sep">•</span>
                    <span>PyQt6 + OpenCV</span>
                </div>
            </footer>
        </div>
    );
}
