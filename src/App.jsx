import "./App.css";

const highlights = [
    {
        title: "Core finding",
        body:
            "During mating, Drosophila spend significantly more time in the center (mean 0.15%) compared to males (5.70%), females (16.63%), and non-mating averages (11.16%), suggesting reduced anxiety-like spatial avoidance.",
    },
    {
        title: "Genotype & hormones",
        body:
            "Corazonin strain shows increased center time during mating (3.05%) compared to Canton-S. Sex peptide and seminal fluid influence these patterns, with sexual reward appearing to decrease anxiety.",
    },
    {
        title: "Bigger picture",
        body:
            "Links survival vs reproduction tradeoffs. Predator avoidance may decrease as mating drive grows stronger. Sexual dimorphism suggests males are naturally more fearful than females.",
    },
];

const stats = [
    { k: "Recording rate", v: "10 fps" },
    { k: "Arena height", v: "6 mm" },
    { k: "Strains", v: "Canton-S (CS), Corazonin (CRZ)" },
    { k: "Total assays", v: "170 CSW and 187 CRZ analyzed" },
    { k: "Analysis tools", v: "Python (matplotlib/pandas), Mann-Whitney U, Pearson r" },
];

const results = [
    {
        title: "Spatial preferences during mating",
        bullets: [
            "Mating pairs spend significantly less time in center (mean/median: 0.15%/0.00%) compared to males (5.70%/5.27%), females (16.63%/15.05%), and non-mating average (11.16%/10.88%)",
            "Statistical significance between sexes: U-value 22,854.0, p-value 7.7e-31",
            "Corazonin increases center time during mating (3.05%/0.43%) compared to Canton-S (0.15%/0.00%). U-value: 5,758.0, p-value: 5.32e-15",
            "Corazonin males spend more time in center (6.72%/5.93%) while females spend less (10.56%/9.46%)",
        ],
    },
    {
        title: "Movement differences (CRZ vs CS)",
        bullets: [
            "Corazonin exhibits substantially more movement (avg: 345.8) than Canton-S (avg: 171.73)",
            "Mann-Whitney U test shows statistically significant difference: U-value: 37.5, p-value: 0.002",
            "Increased sexual reward appears to cause more movement and longer mating duration in center for Corazonin flies",
        ],
    },
    {
        title: "Pre vs post mating centrophobism",
        bullets: [
            "Canton-S females show strong pre vs post-mating change: pre-mating 9.87%/8.90% vs post-mating 0.96%/0.00% in center",
            "Statistical significance: U-value: 10,174.0, p-value: 2.38e-6",
            "Corazonin shows opposite trend in females: statistically less time in center pre-mating than post-mating (16.10%/15.00%)",
            "Corazonin female pre vs post: U-value: 29,178.0, p-value: 4.4e-31",
            "Weak correlation between center time during mating and latency (Pearson r = -0.191, p = 0.032), but no correlation with duration (r = 0.069, p = 0.446)",
        ],
    },
];

const future = [
    "Probe neurobiological and genetic bases of spatial behavior changes during mating, including the processing of mating signals and molecular pathways involved",
    "Investigate environmental context effects on mating behaviors, spatial preferences, and examine behavioral plasticity and adaptability across different habitat types",
    "Study how natural vs artificial rewards affect centrophobism and anxiety-like behaviors, and model these behaviors through different methods",
    "Explore sexual reward system: how sexual reward impacts risk-taking behaviors through evolution, whether lack of natural reward increases anxiety that can be compensated with artificial reward",
];

const references = [
    "Mohammad, F., Aryal, S., Ho, J., Stewart, J., Norman, N., Tan, T., Eisaka, A., & Claridge-Chang, A. (2016). Ancient Anxiety Pathways Influence Drosophila Defense Behaviors. Current Biology, 26(7), 981–986.",
    "Bath, E., Thomson, J., & Perry, J. (2020). Anxiety-like behaviour is regulated independently from sex, mating status and the sex peptide receptor in Drosophila melanogaster. Animal Behaviour, 166, 1–7.",
    "Gunaratne, G. H., Pletcher, S. D., & Roman, G. (2012). Open‐field arena boundary is a primary object of exploration for Drosophila. Brain and Behavior, 2(2), 97–108.",
    "Finn, D. A., Rutledge-Gorman, M. T., & Crabbe, J. C. (2003). Genetic animal models of anxiety. Neurogenetics, 4(3), 109–135.",
];

export default function App() {
    return (
        <div className="page">
            <header className="nav">
                <div className="brand">Drosophila Spatial Behavior</div>
                <a className="navlink" href="#sections">Overview</a>
            </header>

            <main className="container">
                <section className="hero">
                    <div className="pill">Research poster</div>
                    <h1>
                        Exploring the Behavioral Enigmas of <em>Drosophila melanogaster</em>
                    </h1>
                    <p className="subtitle">
                        Insights into thigmotaxis and centrophobism during mating — how mating status,
                        genotype, and reward-related factors shift anxiety-like spatial behavior.
                    </p>

                    <div className="heroGrid">
                        <div className="card">
                            <h2>Abstract</h2>
                            <p>
                                In Drosophila melanogaster, mating behaviors are influenced by genetic factors and environmental cues, 
                                affecting social interactions and evolutionary outcomes. Centrophobism (preference for peripheral locations) 
                                reflects innate anxiety-like behaviors and survival strategies. This research demonstrates that Drosophila 
                                exhibits a significant increase in time spent in the center during mating compared to non-mating periods, 
                                suggesting an intrinsic behavioral change linked to mating status. These spatial patterns can be manipulated 
                                by different genotypes and hormones such as sex peptide. The findings offer insights into broader principles 
                                of animal behavior and may lead to novel approaches for understanding anxiety in humans, as Drosophila can 
                                be used as a model organism for high-throughput gene therapy development.
                            </p>
                        </div>

                        <div className="card">
                            <h2>Quick methods</h2>
                            <ul className="list">
                                {stats.map((s) => (
                                    <li key={s.k}>
                                        <span className="muted">{s.k}:</span> {s.v}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="sections" className="section">
                    <h2>Key highlights</h2>
                    <div className="grid3">
                        {highlights.map((h) => (
                            <div className="card" key={h.title}>
                                <h3>{h.title}</h3>
                                <p>{h.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="section">
                    <h2>Results (poster summary)</h2>
                    <div className="stack">
                        {results.map((r) => (
                            <div className="card" key={r.title}>
                                <h3>{r.title}</h3>
                                <ul className="list">
                                    {r.bullets.map((b) => (
                                        <li key={b}>{b}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="section">
                    <h2>Implications</h2>
                    <div className="card">
                        <ul className="list">
                            <li>
                                Drosophila sex peptide or seminal fluid causes differences in centrophobism, with general decreases in anxiety in post-mating females
                            </li>
                            <li>
                                Sexual reward causes a decrease in anxiety, as Corazonin flies mate longer in the center than standard males, suggesting predator avoidance might be decreased as the need to mate grows stronger
                            </li>
                            <li>
                                Sexual dimorphism suggests that males are naturally more fearful or anxious than females
                            </li>
                            <li>
                                When it takes longer to find a mate (shown through latency), there is a minor increase in fear or anxiety in Drosophila, which could be evolutionary to help find a mate
                            </li>
                            <li>
                                Mating activities significantly impact survival strategies, demonstrating how mating modulates survival tactics like predator avoidance
                            </li>
                            <li>
                                Findings illustrate the balance between survival and reproduction in the context of evolutionary pressures
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="section">
                    <h2>Future directions</h2>
                    <div className="card">
                        <ul className="list">
                            {future.map((f) => (
                                <li key={f}>{f}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="section">
                    <h2>References (short list)</h2>
                    <div className="card">
                        <ul className="list">
                            {references.map((r) => (
                                <li key={r}>{r}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <footer className="footer">
                    <div className="muted">Built with Vite + React.</div>
                </footer>
            </main>
        </div>
    );
}
