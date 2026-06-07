/**
 * FinScheme Magical Interactions
 * Inspired by Design Spells, Unsection, and Jitter
 */

document.addEventListener("DOMContentLoaded", () => {
    const allowMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Magnetic Interactions
    document.querySelectorAll(".magnetic-target").forEach((el) => {
        if (!allowMotion) return;

        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let isHovered = false;
        let animationFrameId = null;

        const animate = () => {
            if (!isHovered && Math.abs(currentX) < 0.01 && Math.abs(currentY) < 0.01) {
                currentX = 0;
                currentY = 0;
                el.style.transform = "translate(0, 0)";
                animationFrameId = null;
                return;
            }

            currentX += (targetX - currentX) * 0.15;
            currentY += (targetY - currentY) * 0.15;

            el.style.transform = `translate(${currentX}px, ${currentY}px)`;
            animationFrameId = requestAnimationFrame(animate);
        };

        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            targetX = (e.clientX - centerX) * 0.35;
            targetY = (e.clientY - centerY) * 0.35;
            isHovered = true;

            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(animate);
            }
        });

        el.addEventListener("mouseleave", () => {
            targetX = 0;
            targetY = 0;
            isHovered = false;
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(animate);
            }
        });
    });

    // 2. Spotlight Hover Effect
    document.querySelectorAll(".spotlight-card, .clay-card, .bento-item").forEach((card) => {
        if (!allowMotion) return;

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
            card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        });

        card.addEventListener("mouseleave", () => {
            card.style.setProperty("--mouse-x", "-9999px");
            card.style.setProperty("--mouse-y", "-9999px");
        });
    });

    // 3. Staggered Entrance Reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const items = entry.target.querySelectorAll(".reveal-item");
            items.forEach((item, index) => {
                const delay = allowMotion ? index * 120 : 0;
                window.setTimeout(() => item.classList.add("revealed"), delay);
            });

            revealObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    });

    document.querySelectorAll(".reveal-container").forEach((container) => {
        revealObserver.observe(container);
    });

    // 4. Sparkle Effect for Agentic Bubble
    const bubble = document.getElementById("agenticBubble");
    if (bubble && allowMotion) {
        window.setInterval(() => {
            if (!bubble.classList.contains("visible")) return;

            const sparkle = document.createElement("div");
            sparkle.className = "design-sparkle";

            const size = Math.random() * 10 + 5;
            const rect = bubble.getBoundingClientRect();
            sparkle.style.width = `${size}px`;
            sparkle.style.height = `${size}px`;
            sparkle.style.left = `${Math.random() * rect.width}px`;
            sparkle.style.top = `${Math.random() * rect.height}px`;

            bubble.appendChild(sparkle);
            window.setTimeout(() => sparkle.remove(), 1500);
        }, 800);
    }

    // 5. 3D Tilt for Clay elements
    document.querySelectorAll(".clay").forEach((el) => {
        if (!allowMotion) return;

        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = (e.clientX - centerX) / (rect.width / 2);
            const mouseY = (e.clientY - centerY) / (rect.height / 2);
            const maxTilt = 8;

            el.style.transform =
                `perspective(1000px) rotateX(${mouseY * -maxTilt}deg) ` +
                `rotateY(${mouseX * maxTilt}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        el.addEventListener("mouseleave", () => {
            el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
            window.setTimeout(() => {
                if (!el.matches(":hover")) el.style.transform = "";
            }, 300);
        });
    });

    // 6. Cursor tracking, coordinates damping and particle trail
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    // Canvas particle glow trail setup
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let particles = [];
    const colors = ["#14b8a6", "#a855f7"];
    let isLargeScreen = window.innerWidth >= 768;

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    window.addEventListener("resize", () => {
        isLargeScreen = window.innerWidth >= 768;
        if (isLargeScreen) {
            resizeCanvas();
        } else if (canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles = [];
        }
    });

    if (isLargeScreen) {
        resizeCanvas();
    }

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 4 + 1.5;
            this.speedX = (Math.random() - 0.5) * 1.2;
            this.speedY = (Math.random() - 0.5) * 1.2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= this.decay;
            if (this.size > 0.1) this.size -= 0.03;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let firstMove = true;

    if (allowMotion) {
        document.body.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Set global mouse vars on body for general utility styling if needed
            document.body.style.setProperty("--mouse-x", `${e.clientX}px`);
            document.body.style.setProperty("--mouse-y", `${e.clientY}px`);

            if (firstMove) {
                cursorX = mouseX;
                cursorY = mouseY;
                firstMove = false;
            }

            const target = e.target;
            if (target && target.closest) {
                if (target.closest("a, button, .choice-card, .spotlight-card, .magnetic-target")) {
                    cursor.classList.add("active");
                } else {
                    cursor.classList.remove("active");
                }
            }
        });

        const animateCursor = () => {
            if (!firstMove) {
                let dx = mouseX - cursorX;
                let dy = mouseY - cursorY;
                cursorX += dx * 0.15;
                cursorY += dy * 0.15;

                cursor.style.left = `${cursorX}px`;
                cursor.style.top = `${cursorY}px`;

                if (isLargeScreen) {
                    const dist = Math.hypot(dx, dy);
                    if (dist > 1.5) {
                        for (let i = 0; i < 2; i++) {
                            particles.push(new Particle(
                                cursorX + (Math.random() - 0.5) * 4,
                                cursorY + (Math.random() - 0.5) * 4
                            ));
                        }
                    }
                }
            }

            if (isLargeScreen) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.update();
                    if (p.alpha <= 0 || p.size <= 0.1) {
                        particles.splice(i, 1);
                    } else {
                        p.draw();
                    }
                }
            }

            requestAnimationFrame(animateCursor);
        };

        requestAnimationFrame(animateCursor);
    }

    // 6.1 Header scroll effect
    const header = document.querySelector(".topbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            header?.classList.add("scrolled");
        } else {
            header?.classList.remove("scrolled");
        }
    });

    // 7. Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navLinks = document.querySelector(".nav-links");

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.setAttribute("aria-expanded", "false");

        const setMenuState = (isOpen) => {
            navLinks.classList.toggle("active", isOpen);
            mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));

            const icon = mobileMenuBtn.querySelector("i");
            if (icon) {
                icon.setAttribute("data-lucide", isOpen ? "x" : "menu");
            }
            if (window.lucide) {
                window.lucide.createIcons();
            }
        };

        mobileMenuBtn.addEventListener("click", () => {
            setMenuState(!navLinks.classList.contains("active"));
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => setMenuState(false));
        });
    }

    // 8. FAQ accordion logic
    const accordions = document.querySelectorAll(".accordion-item");
    accordions.forEach((acc, index) => {
        const header = acc.querySelector(".accordion-header");
        const content = acc.querySelector(".accordion-content");
        if (!header || !content) return;

        const contentId = content.id || `faq-panel-${index + 1}`;
        content.id = contentId;
        header.setAttribute("aria-controls", contentId);
        header.setAttribute("aria-expanded", "false");

        header.addEventListener("click", () => {
            accordions.forEach((other) => {
                if (other === acc) return;
                other.classList.remove("active");
                other.querySelector(".accordion-header")?.setAttribute("aria-expanded", "false");
            });

            const nextState = !acc.classList.contains("active");
            acc.classList.toggle("active", nextState);
            header.setAttribute("aria-expanded", String(nextState));
        });
    });

    // 9. AI Scout Terminal Animation
    const scoutLogs = document.getElementById("scout-logs");
    if (scoutLogs && !window.__schemeScoutLiveEnabled) {
        const lines = [
            "[AGENT] Initializing autonomous research...",
            "[AGENT] Accessing national-portal.gov.in...",
            "[AGENT] Scraping regional scholarship data...",
            "[AGENT] FOUND: New Post-Matric benefit in Gujarat.",
            "[AGENT] Verifying document requirements...",
            "[AGENT] Syncing with FinScheme Central DB...",
            "[AGENT] Status: Update completed successfully.",
        ];

        let lineIdx = 0;
        window.setInterval(() => {
            const cursor = scoutLogs.querySelector(".cursor");
            if (!cursor) return;

            const line = document.createElement("div");
            line.className = "log-line";
            line.innerHTML = `<span>[AGENT]</span> ${lines[lineIdx].split("] ")[1]}`;
            scoutLogs.insertBefore(line, cursor);

            const allLines = scoutLogs.querySelectorAll(".log-line:not(.cursor)");
            if (allLines.length > 8) {
                allLines[0].remove();
            }

            lineIdx = (lineIdx + 1) % lines.length;
            scoutLogs.scrollTop = scoutLogs.scrollHeight;
        }, 3000);
    }

    // 10. Guided shortlist wizard
    const wizard = document.getElementById("schemeWizard");
    if (wizard) {
        let currentStep = 1;
        const totalSteps = 3;
        const wizardState = {
            category: "",
            query: "",
            stateLoc: "",
        };

        const steps = wizard.querySelectorAll(".form-step");
        const dots = wizard.querySelectorAll(".step-dot");
        const searchProgress = document.getElementById("searchProgress");
        const progressText = document.getElementById("progressText");
        const wizardFeedback = document.getElementById("wizardFeedback");
        const finalizeBtn = document.getElementById("finalizeWizard");
        const stateSelect = document.getElementById("wizardState");

        const setFeedback = (message, isError = false) => {
            if (!wizardFeedback) return;
            wizardFeedback.textContent = message;
            wizardFeedback.classList.toggle("is-error", isError);
        };

        const validateStep = (stepNumber) => {
            if (stepNumber === 1) return Boolean(wizardState.category);
            if (stepNumber === 2) return Boolean(wizardState.query);
            if (stepNumber === 3) return Boolean(wizardState.stateLoc);
            return true;
        };

        const updateUI = () => {
            steps.forEach((step) => {
                const isActive = Number(step.dataset.step) === currentStep;
                step.classList.toggle("active", isActive);
                step.style.display = isActive ? "block" : "none";

                if (isActive && allowMotion) {
                    step.style.opacity = "0";
                    step.style.transform = "translateY(10px)";
                    window.setTimeout(() => {
                        step.style.transition = "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
                        step.style.opacity = "1";
                        step.style.transform = "translateY(0)";
                    }, 50);
                } else if (isActive) {
                    step.style.opacity = "1";
                    step.style.transform = "translateY(0)";
                }
            });

            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index < currentStep);
            });

            if (searchProgress && progressText) {
                const percentage = Math.round((currentStep / totalSteps) * 100);
                searchProgress.style.width = `${percentage}%`;
                progressText.textContent = `${percentage}%`;
            }

            if (currentStep === 1) setFeedback("Choose the life situation that fits this search best.");
            if (currentStep === 2) setFeedback("Choose the kind of help you want FinScheme to search first.");
            if (currentStep === 3) setFeedback("Choose your state or keep it all-India to include central coverage.");
        };

        const selectChoice = (card) => {
            const stepElement = card.closest(".form-step");
            if (!stepElement) return;

            stepElement.querySelectorAll(".choice-card").forEach((choice) => {
                choice.classList.remove("selected");
                choice.setAttribute("aria-pressed", "false");
            });

            card.classList.add("selected");
            card.setAttribute("aria-pressed", "true");

            const stepNum = Number(stepElement.dataset.step);
            if (stepNum === 1) wizardState.category = card.dataset.value || "";
            if (stepNum === 2) wizardState.query = card.dataset.value || "";

            setFeedback("Looks good. Continue when you're ready.");
        };

        wizard.querySelectorAll(".choice-card").forEach((card) => {
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-pressed", "false");

            card.addEventListener("click", () => selectChoice(card));
            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectChoice(card);
                }
            });
        });

        wizard.querySelectorAll(".next-step").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (!validateStep(currentStep)) {
                    setFeedback("Please choose an option before moving to the next step.", true);
                    return;
                }
                if (currentStep < totalSteps) {
                    currentStep += 1;
                    updateUI();
                }
            });
        });

        wizard.querySelectorAll(".prev-step").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (currentStep > 1) {
                    currentStep -= 1;
                    updateUI();
                }
            });
        });

        if (stateSelect) {
            stateSelect.addEventListener("change", () => {
                wizardState.stateLoc = stateSelect.value;
                if (wizardState.stateLoc) {
                    setFeedback("State added. Build your shortlist when you are ready.");
                }
            });
        }

        if (finalizeBtn) {
            finalizeBtn.addEventListener("click", () => {
                if (stateSelect) {
                    wizardState.stateLoc = stateSelect.value;
                }

                if (!validateStep(3)) {
                    setFeedback("Please choose a state or all-India coverage before continuing.", true);
                    return;
                }

                const params = new URLSearchParams();
                if (wizardState.category) params.append("cat", wizardState.category);
                if (wizardState.query) params.append("q", wizardState.query);
                if (wizardState.stateLoc && wizardState.stateLoc !== "ALL") {
                    params.append("state", wizardState.stateLoc);
                }

                finalizeBtn.innerHTML = 'Searching... <i data-lucide="loader" class="spin"></i>';
                finalizeBtn.setAttribute("aria-busy", "true");
                if (window.lucide) {
                    window.lucide.createIcons();
                }

                window.setTimeout(() => {
                    window.location.href = `pages/find.html?${params.toString()}`;
                }, 800);
            });
        }

        updateUI();
    }

    // 11. Humanizer Typing Effect
    const humanizerBtn = document.getElementById("humanizeBtn");
    const humanizerOutput = document.getElementById("humanizerOutput");
    const humanizerPanel = document.querySelector(".humanizer-panel");

    if (humanizerBtn && humanizerOutput) {
        humanizerBtn.addEventListener("click", () => {
            if (humanizerPanel) humanizerPanel.classList.add("processing");
            
            // Simulation logic (Actual logic is in index.html, we add visual feedback)
            window.setTimeout(() => {
                if (humanizerPanel) humanizerPanel.classList.remove("processing");
                humanizerOutput.classList.add("typing");
            }, 1500);
        });
    }

    // 12. Scroll to Top
    const scrollToTopBtn = document.getElementById("scrollToTop");
    if (scrollToTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 500) {
                scrollToTopBtn.style.display = "flex";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        });

        scrollToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});
