(() => {
if (window.learningUnavailable) return;
/*
    Shared progress format for the coming lesson and task pages:

    {
        version: 1,
        lessons: ["variables"],
        tasks: ["student-profile"],
        assessments: {
            "1": { score: 75 }
        }
    }

    This is demo progress, not server-verified achievement.
*/

const progressKey = "codementor-demo-learning";

const requiredLessons = [
    { id: "variables", title: "Variables and values" },
    { id: "data-types", title: "Data types" },
    { id: "input-output", title: "Input and output" },
    { id: "numbers", title: "Working with numbers" }
];

const requiredTasks = [
    { id: "student-profile", title: "Create a student profile" },
    { id: "receipt", title: "Build a simple receipt" }
];

const lessonProgress = document.getElementById("lesson-progress");
const taskProgress = document.getElementById("task-progress");
const assessmentProgress = document.getElementById("assessment-progress");

const assessmentLink = document.getElementById("assessment-link");
const lockedButton = document.getElementById("assessment-locked");
const assessmentNote = document.getElementById("assessment-note");

const requirementsDialog = document.getElementById("requirements-dialog");
const remainingList = document.getElementById("remaining-requirements");
const closeButton = document.getElementById("close-requirements");
const workspaceMessage = document.getElementById("workspace-message");

let remainingActivities = [];
let progressAvailable = true;

function readProgress() {
    const emptyProgress = {
        version: 1,
        lessons: [],
        tasks: [],
        assessments: {}
    };

    try {
        const saved = sessionStorage.getItem(progressKey);

        if (!saved) {
            return emptyProgress;
        }

        const progress = JSON.parse(saved);

        if (
            progress?.version !== 1 ||
            !Array.isArray(progress.lessons) ||
            !Array.isArray(progress.tasks) ||
            !progress.assessments ||
            typeof progress.assessments !== "object" ||
            Array.isArray(progress.assessments)
        ) {
            throw new Error("Invalid progress");
        }

        return progress;
    } catch {
        progressAvailable = false;

        workspaceMessage.textContent =
            "Saved progress could not be loaded. The assessment remains locked.";

        workspaceMessage.classList.add("is-error");

        return emptyProgress;
    }
}

function updateModule() {
    const requestedLevel = new URLSearchParams(
        window.location.search
    ).get("level");

    if (requestedLevel && requestedLevel !== "1") {
        window.location.replace("../student/learning-path.html");
        return;
    }

    progressAvailable = true;
    const progress = readProgress();

    const completedLessons = requiredLessons.filter(function (lesson) {
        return progress.lessons.includes(lesson.id);
    });

    const completedTasks = requiredTasks.filter(function (task) {
        return progress.tasks.includes(task.id);
    });

    lessonProgress.textContent =
        `Lessons: ${completedLessons.length} / ${requiredLessons.length}`;

    taskProgress.textContent =
        `Required tasks: ${completedTasks.length} / ${requiredTasks.length}`;

    document.querySelectorAll("[data-lesson-link]").forEach(function (link) {
        const completed = progress.lessons.includes(
            link.dataset.lessonLink
        );

        link.textContent = completed ? "Review" : "Start";
    });

    document.querySelectorAll("[data-task-link]").forEach(function (link) {
        const completed = progress.tasks.includes(
            link.dataset.taskLink
        );

        link.textContent = completed ? "Review task" : "Start task";
    });

    remainingActivities = [
        ...requiredLessons.filter(function (lesson) {
            return !progress.lessons.includes(lesson.id);
        }).map(function (lesson) {
            return `Lesson: ${lesson.title}`;
        }),

        ...requiredTasks.filter(function (task) {
            return !progress.tasks.includes(task.id);
        }).map(function (task) {
            return `Task: ${task.title}`;
        })
    ];

    const assessment = progress.assessments["1"];

    const hasScore = (
        typeof assessment?.score === "number" &&
        Number.isFinite(assessment.score) &&
        assessment.score >= 0 &&
        assessment.score <= 100
    );

    assessmentProgress.textContent = hasScore
        ? `Assessment: ${assessment.score}% · ${
            assessment.score >= 70 ? "Passed" : "Not passed"
        }`
        : "Assessment: Not attempted";

    const unlocked = (
        progressAvailable &&
        remainingActivities.length === 0
    );

    assessmentLink.hidden = !unlocked;
    lockedButton.hidden = unlocked;

    if (unlocked) {
        assessmentLink.textContent = hasScore
            ? assessment.score >= 70
                ? "View assessment result"
                : "Retry assessment"
            : "Start assessment";

        assessmentNote.textContent =
            "Required lessons and tasks complete. Assessment available.";
    } else {
        assessmentNote.textContent =
            "Locked until required lessons and tasks are complete.";
    }
}

lockedButton.addEventListener("click", function () {
    remainingList.replaceChildren();

    const items = progressAvailable
        ? remainingActivities
        : ["Restore access to your saved progress and reload this page."];

    items.forEach(function (text) {
        const item = document.createElement("li");
        item.textContent = text;
        remainingList.append(item);
    });

    requirementsDialog.showModal();
});

closeButton.addEventListener("click", function () {
    requirementsDialog.close();
});

window.addEventListener("pageshow", updateModule);
})();
