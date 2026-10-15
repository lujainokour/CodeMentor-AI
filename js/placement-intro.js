(() => {
if (window.learningUnavailable) return;
const greeting = document.getElementById("placement-greeting");
const languageSummary = document.getElementById("summary-language");
const experienceSummary = document.getElementById("summary-experience");
const goalSummary = document.getElementById("summary-goal");

const startButton = document.getElementById("start-assessment");
const placementMessage = document.getElementById("placement-message");

const preferencesKey = "codementor-demo-onboarding";
const attemptKey = "codementor-demo-placement";

const experienceLabels = {
    beginner: "Just starting",
    basics: "Know the basics",
    practising: "Have some practice"
};

const goalLabels = {
    foundations: "Build foundations",
    "problem-solving": "Solve problems",
    projects: "Build projects"
};

let preferences = null;
let attemptStatus = "new";
let storageAvailable = true;

function showMessage(message, isError = false) {
    placementMessage.textContent = message;
    placementMessage.classList.toggle("is-error", isError);
}

function hasValidPreferences() {
    return Boolean(
        preferences &&
        preferences.language === "python" &&
        Object.hasOwn(experienceLabels, preferences.experience) &&
        Object.hasOwn(goalLabels, preferences.goal)
    );
}

function loadPageData() {
    preferences = null;
    attemptStatus = "new";
    storageAvailable = true;
    startButton.disabled = false;
    startButton.textContent = "Start assessment →";
    showMessage("");

    try {
        const sessionText = sessionStorage.getItem(
            "codementor-demo-session"
        );

        if (sessionText) {
            try {
                const session = JSON.parse(sessionText);

                if (typeof session?.name === "string" && session.name.trim()) {
                    const firstName = session.name.trim().split(/\s+/)[0];

                    greeting.textContent =
                        `Ready for the challenge, ${firstName}?`;
                }
            } catch {
                /* Keep the default greeting */
            }
        }

        const savedPreferences = sessionStorage.getItem(preferencesKey);

        if (savedPreferences) {
            try {
                preferences = JSON.parse(savedPreferences);
            } catch {
                preferences = null;
            }
        }

        const savedAttempt = sessionStorage.getItem(attemptKey);

        if (savedAttempt !== null) {
            try {
                const attempt = JSON.parse(savedAttempt);
                const questions = window.placementQuestions;

                if (
                    attempt?.version === 1 &&
                    Array.isArray(attempt.answers) &&
                    attempt.answers.length === questions.length &&
                    ["in-progress", "submitted"].includes(attempt.status) &&
                    attempt.answers.every((answer, index) =>
                        (answer === null && attempt.status === "in-progress") || answer === "unsure" ||
                        (Number.isInteger(answer) && answer >= 0 && answer < questions[index].options.length)
                    ) && (attempt.status === "submitted" ||
                        (Number.isInteger(attempt.currentQuestion) && attempt.currentQuestion >= 0 && attempt.currentQuestion < questions.length))
                ) {
                    if (attempt.status === "in-progress") {
                        attemptStatus = "in-progress";
                    } else if (attempt.status === "submitted") {
                        attemptStatus = "submitted";
                    }
                } else throw new Error("Invalid placement attempt");
            } catch {
                storageAvailable = false;
                showMessage("Your saved placement attempt could not be read. It has not been deleted or replaced.", true);
            }
        }
    } catch {
        storageAvailable = false;
        showMessage(
            "Browser storage is unavailable. Enable it to save your assessment.",
            true
        );
    }

    languageSummary.textContent = "Python";

    experienceSummary.textContent = hasValidPreferences()
        ? experienceLabels[preferences.experience]
        : "Not selected";

    goalSummary.textContent = hasValidPreferences()
        ? goalLabels[preferences.goal]
        : "Not selected";

    if (!storageAvailable) {
        startButton.disabled = true;
        return;
    }

    if (!hasValidPreferences()) {
        startButton.textContent = "Complete preferences →";
        showMessage("Choose your experience and goal before starting.");
        return;
    }

    if (attemptStatus === "in-progress") {
        startButton.textContent = "Resume assessment →";
        showMessage("Your saved assessment is ready to resume.");
    } else if (attemptStatus === "submitted") {
        startButton.textContent = "View results →";
        showMessage("You have already submitted this assessment.");
    }
}

startButton.addEventListener("click", function () {
    if (!storageAvailable || startButton.disabled) return;
    if (!hasValidPreferences()) {
        window.location.href = "../student/onboarding.html";
        return;
    }

    if (attemptStatus === "submitted") {
        window.location.href = "../student/placement-results.html";
        return;
    }

    if (attemptStatus === "new") {
        const attempt = {
            version: 1,
            status: "in-progress",
            currentQuestion: 0,
            answers: Array(window.placementQuestions.length).fill(null),
            startedAt: new Date().toISOString()
        };

        try {
            if (sessionStorage.getItem(attemptKey) !== null) {
                showMessage("The saved placement attempt changed. Reload this page before continuing. Existing records were kept.", true);
                return;
            }
            sessionStorage.setItem(attemptKey, JSON.stringify(attempt));
        } catch {
            showMessage(
                "Couldn’t save your assessment. Check browser storage and try again.",
                true
            );
            return;
        }
    }

    startButton.disabled = true;
    startButton.textContent = "Opening assessment…";

    window.location.href = "../student/placement-question.html";
});

window.addEventListener("pageshow", loadPageData);
})();
