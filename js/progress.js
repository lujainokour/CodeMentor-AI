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

const message = document.getElementById("workspace-message");
const activitiesList = document.getElementById("completed-activities");

const nextDescription = document.getElementById("next-step-description");
const nextLink = document.getElementById("next-step-link");

function readProgress() {
    const saved = sessionStorage.getItem("codementor-demo-learning");

    if (!saved) {
        return {
            version: 1,
            lessons: [],
            tasks: [],
            assessments: {}
        };
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
}

function addActivity(type, title, href) {
    const item = document.createElement("li");

    const label = document.createElement("span");
    label.className = "activity-type";
    label.textContent = type;

    const link = document.createElement("a");
    link.textContent = title;
    link.href = href;

    item.append(label, link);
    activitiesList.append(item);
}

function updateProgress() {
    let progress;

    try {
        progress = readProgress();
    } catch {
        message.textContent =
            "Saved progress could not be loaded. Your records have not been changed.";

        message.classList.add("is-error");

        nextDescription.textContent =
            "Return to your level to check your saved progress.";

        return;
    }

    const completedLessons = requiredLessons.filter(function (lesson) {
        return progress.lessons.includes(lesson.id);
    });

    const completedTasks = requiredTasks.filter(function (task) {
        return progress.tasks.includes(task.id);
    });

    const lessonsDone = completedLessons.length;
    const tasksDone = completedTasks.length;

    const assessment = progress.assessments["1"];

    const hasAssessment = (
        typeof assessment?.score === "number" &&
        Number.isFinite(assessment.score) &&
        assessment.score >= 0 &&
        assessment.score <= 100
    );

    const activitiesComplete = (
        lessonsDone === requiredLessons.length &&
        tasksDone === requiredTasks.length
    );

    const levelComplete = (
        activitiesComplete &&
        hasAssessment &&
        assessment.score >= 70
    );

    document.getElementById("completed-lessons").textContent =
        `${lessonsDone} / ${requiredLessons.length}`;

    document.getElementById("completed-tasks").textContent =
        `${tasksDone} / ${requiredTasks.length}`;

    document.getElementById("level-status").textContent = levelComplete
        ? "Completed"
        : lessonsDone || tasksDone || hasAssessment
            ? "In progress"
            : "Not started";

    document.getElementById("lesson-count").textContent =
        `${lessonsDone} / ${requiredLessons.length}`;

    document.getElementById("task-count").textContent =
        `${tasksDone} / ${requiredTasks.length}`;

    document.getElementById("lesson-bar").value = lessonsDone;
    document.getElementById("task-bar").value = tasksDone;

    const assessmentStatus = document.getElementById("assessment-status");

    if (hasAssessment) {
        assessmentStatus.textContent =
            `${assessment.score}% · ${
                assessment.score >= 70 ? "Passed" : "Not passed"
            }`;
    } else {
        assessmentStatus.textContent = activitiesComplete
            ? "Available · Pass mark: 70%"
            : "Locked until required lessons and tasks are complete.";
    }

    activitiesList.replaceChildren();

    completedLessons.forEach(function (lesson) {
        addActivity(
            "LESSON COMPLETED",
            lesson.title,
            `../student/lesson.html?lesson=${lesson.id}`
        );
    });

    completedTasks.forEach(function (task) {
        addActivity(
            "TASK PASSED",
            task.title,
            `../student/code-review.html?task=${task.id}`
        );
    });

    if (hasAssessment) {
        addActivity(
            "ASSESSMENT RESULT",
            `Level 01 · ${assessment.score}%`,
            "../student/level-assessment.html?level=1"
        );
    }

    if (!activitiesList.children.length) {
        const empty = document.createElement("li");
        empty.textContent =
            "No completed activities yet. Start with your first lesson.";
        activitiesList.append(empty);
    }

    const nextLesson = requiredLessons.find(function (lesson) {
        return !progress.lessons.includes(lesson.id);
    });

    const nextTask = requiredTasks.find(function (task) {
        return !progress.tasks.includes(task.id);
    });

    if (nextLesson) {
        nextDescription.textContent =
            `Continue with ${nextLesson.title}.`;

        nextLink.textContent = "Open lesson";
        nextLink.href = `../student/lesson.html?lesson=${nextLesson.id}`;
    } else if (nextTask) {
        nextDescription.textContent =
            `Practise your skills in ${nextTask.title}. ` +
            "Task testing will become available after the backend connection.";

        nextLink.textContent = "Open task";
        nextLink.href = `../student/workspace.html?task=${nextTask.id}`;
    } else if (!levelComplete) {
        nextDescription.textContent =
            "Complete your level assessment with at least 70%.";

        nextLink.textContent = "Open assessment";
        nextLink.href = "../student/level-assessment.html?level=1";
    } else {
        nextDescription.textContent =
            "You have completed Level 01. Review your learning roadmap.";

        nextLink.textContent = "View learning path";
        nextLink.href = "../student/learning-path.html";
    }
}

window.addEventListener("pageshow", updateProgress);