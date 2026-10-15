(() => {
    if (!document.body.classList.contains("cm-home")) return;

    const header = document.querySelector(".cm-header");
    const menuButton = document.querySelector(".cm-menu");
    const navigation = document.getElementById("cm-navigation");

    const heroVideo = document.getElementById("cm-hero-video");
    const motionButton = document.getElementById("cm-motion");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let paused = reducedMotion.matches;

    document.getElementById("cm-year").textContent =
        new Date().getFullYear();

    // قياس النافبار بدل التخمين بارتفاعه.
    function updateHeaderHeight() {
        document.body.style.setProperty(
            "--cm-header-height",
            `${header.getBoundingClientRect().height}px`
        );
    }

    updateHeaderHeight();

    if ("ResizeObserver" in window) {
        new ResizeObserver(updateHeaderHeight).observe(header);
    } else {
        window.addEventListener("resize", updateHeaderHeight);
    }

    // قائمة الهاتف.
    function closeMenu() {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
    }

    menuButton.addEventListener("click", () => {
        const open = navigation.classList.toggle("is-open");

        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute(
            "aria-label",
            open ? "Close navigation" : "Open navigation"
        );
    });

    navigation.addEventListener("click", event => {
        if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            navigation.classList.contains("is-open")
        ) {
            closeMenu();
            menuButton.focus();
        }
    });

    window.matchMedia("(min-width: 901px)")
        .addEventListener("change", event => {
            if (event.matches) closeMenu();
        });

    // خطوات تفاعلية، وليست نتائج تعلم وهمية.
    const steps = [
        {
            label: "MAKE IT PERSONAL",
            title: "Start where you are.",
            description:
                "Choose your learning goal and share your experience. " +
                "Your journey begins with a starting point that fits you."
        },
        {
            label: "FIND YOUR STARTING POINT",
            title: "Discover what comes next.",
            description:
                "Complete the placement assessment at your own pace. " +
                "Use the result to identify concepts you need to practise."
        },
        {
            label: "LEARN BY DOING",
            title: "Give your knowledge a workout.",
            description:
                "Work through lessons, coding tasks and assessments. " +
                "Use mentor hints to understand your approach and mistakes."
        },
        {
            label: "BRING IT ALL TOGETHER",
            title: "Create something useful.",
            description:
                "Combine your skills in a final project. Complete the " +
                "requirements and project evaluation before certification."
        }
    ];

    const stepButtons = document.querySelectorAll(".cm-step");
    const preview = document.getElementById("cm-step-preview");

    stepButtons.forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.step);
            const step = steps[index];

            stepButtons.forEach(item => {
                const active = item === button;

                item.classList.toggle("is-active", active);
                item.setAttribute("aria-pressed", String(active));
            });

            preview.querySelector(".cm-preview-number").textContent =
                String(index + 1).padStart(2, "0");

            document.getElementById("cm-step-label").textContent =
                step.label;

            document.getElementById("cm-step-title").textContent =
                step.title;

            document.getElementById("cm-step-description").textContent =
                step.description;

            preview.classList.remove("cm-preview-enter");
            void preview.offsetWidth;
            preview.classList.add("cm-preview-enter");
        });
    });

    // نسخ مثال الكود.
    document.getElementById("cm-copy-code")
        .addEventListener("click", async () => {
            const status = document.getElementById("cm-copy-status");
            const code = document.getElementById(
                "cm-example-code"
            ).textContent;

            try {
                await navigator.clipboard.writeText(code);
                status.textContent = "Code copied.";
            } catch {
                status.textContent =
                    "Select the code and copy it manually.";
            }
        });

    // ظهور العناصر عند التمرير.
    const revealElements = document.querySelectorAll(".cm-reveal");
    let observer;

    function revealAll() {
        revealElements.forEach(element => {
            element.classList.add("cm-visible");
        });

        observer?.disconnect();
    }

    if (
        !reducedMotion.matches &&
        "IntersectionObserver" in window
    ) {
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("cm-visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.08
        });

        revealElements.forEach(element => {
            if (element.getBoundingClientRect().top < innerHeight) {
                return;
            }

            const siblings = Array.from(
                element.parentElement.children
            );

            element.style.setProperty(
                "--cm-delay",
                `${Math.min(siblings.indexOf(element), 3) * 80}ms`
            );

            element.classList.add("cm-pending");
            observer.observe(element);
        });
    }

    document.addEventListener("focusin", event => {
        const element = event.target.closest(".cm-reveal");

        if (element) {
            element.classList.add("cm-visible");
            observer?.unobserve(element);
        }
    });

    // تحكم واحد بالحركة والفيديوهات.
    function updateMotion() {
        document.body.classList.toggle("cm-paused", paused);

        motionButton.textContent =
            paused ? "Play visuals" : "Pause visuals";

        motionButton.setAttribute("aria-pressed", String(paused));

        const videos = [
            heroVideo,
            ...document.querySelectorAll("#smoke-video-layer video")
        ];

        videos.forEach(video => {
            if (paused || document.hidden) {
                video.pause();
            } else {
                video.muted = true;
                video.play().catch(() => {
                    // إذا منع المتصفح التشغيل، يمكن المحاولة بالزر.
                });
            }
        });
    }

    motionButton.addEventListener("click", () => {
        paused = !paused;
        updateMotion();
    });

    reducedMotion.addEventListener("change", event => {
        paused = event.matches;

        if (event.matches) revealAll();

        updateMotion();
    });

    document.addEventListener("visibilitychange", updateMotion);

    heroVideo.addEventListener("loadeddata", updateMotion);

    // انتظار فيديو الدخان الذي ينشئه ملفه الحالي.
    const smokeObserver = new MutationObserver(() => {
        const smokeVideo = document.querySelector(
            "#smoke-video-layer video"
        );

        if (smokeVideo) {
            smokeVideo.addEventListener("loadeddata", updateMotion);
            updateMotion();
            smokeObserver.disconnect();
        }
    });

    smokeObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    updateMotion();
})();
// منع ظهور مربع الصورة المكسورة.
document.querySelectorAll(".cm-brand img").forEach(image => {
    function showFallback() {
        const fallback = document.createElement("span");

        fallback.className = "cm-logo-fallback";
        fallback.textContent = "CMA";
        fallback.setAttribute("aria-hidden", "true");

        image.replaceWith(fallback);
    }

    image.addEventListener("error", showFallback, { once: true });

    if (image.complete && image.naturalWidth === 0) {
        showFallback();
    }
});