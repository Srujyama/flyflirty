// Initialize highlight.js
if (window.hljs) {
    hljs.highlightAll();
}

// ScrollReveal animations
if (window.ScrollReveal) {
    const sr = ScrollReveal({
        distance: "24px",
        duration: 700,
        easing: "ease-out",
        origin: "bottom",
        interval: 80,
        scale: 1,
        opacity: 0
    });

    sr.reveal("[data-sr]");
}

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
        });
    });
}

// Smooth scroll for internal links (just in case browser doesn't do it nicely)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

// Copy git clone command
const copyBtn = document.getElementById("copy-command-btn");
if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        const text = copyBtn.dataset.copy || "";
        try {
            await navigator.clipboard.writeText(text);
            const original = copyBtn.textContent;
            copyBtn.textContent = "Copied!";
            copyBtn.disabled = true;
            setTimeout(() => {
                copyBtn.textContent = original;
                copyBtn.disabled = false;
            }, 1600);
        } catch (err) {
            console.error("Clipboard copy failed:", err);
            alert("Unable to copy – please copy manually:\n\n" + text);
        }
    });
}
