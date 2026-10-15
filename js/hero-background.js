(() => {
    const video = document.getElementById("hero-background-video");
    const button = document.getElementById("hero-motion-toggle");

    if (!video || !button) {
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let wantsPlayback = !reducedMotion.matches;

    video.muted = true;
    button.hidden = false;
function updateButton() {
    button.textContent = video.paused
        ? "Play animation"
        : "Pause animation";

    document.body.classList.toggle(
        "ambient-paused",
        video.paused
    );
}

    async function playVideo() {
        try {
            await video.play();
        } catch {
            updateButton();
        }
    }

    button.addEventListener("click", () => {
        if (video.paused) {
            wantsPlayback = true;
            playVideo();
        } else {
            wantsPlayback = false;
            video.pause();
        }
    });

    video.addEventListener("play", updateButton);
    video.addEventListener("pause", updateButton);

    video.addEventListener("error", () => {
        wantsPlayback = false;
        button.hidden = true;
    });

    const source = video.querySelector("source");

    if (source) {
        source.addEventListener("error", () => {
            wantsPlayback = false;
            button.hidden = true;
        });
    }

    reducedMotion.addEventListener("change", event => {
        wantsPlayback = !event.matches;

        if (wantsPlayback && !document.hidden) {
            playVideo();
        } else {
            video.pause();
        }
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            video.pause();
        } else if (wantsPlayback) {
            playVideo();
        }
    });

    updateButton();

    if (wantsPlayback) {
        playVideo();
    }
})();