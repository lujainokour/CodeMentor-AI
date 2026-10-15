(() => {
if (window.learningUnavailable) return;
const taskNames = {
    "student-profile": "Create a student profile",
    receipt: "Build a simple receipt"
};

const taskId = new URLSearchParams(
    window.location.search
).get("task") || "student-profile";

const taskName = document.getElementById("review-task-name");
const codeElement = document.getElementById("review-code");
const mentorLink = document.getElementById("review-mentor-link");
const workspaceLink = document.getElementById("review-workspace-link");
const message = document.getElementById("workspace-message");

function loadDraft() {
    if (!Object.hasOwn(taskNames, taskId)) {
        taskName.textContent = "Task not found.";
        codeElement.textContent = "Choose a task from Python Foundations.";

        workspaceLink.href = "../student/module.html?level=1";
        workspaceLink.textContent = "Choose a task";
        mentorLink.href = "../student/mentor.html";

        return;
    }

    taskName.textContent = taskNames[taskId];

    workspaceLink.href =
        `../student/workspace.html?task=${encodeURIComponent(taskId)}`;

    mentorLink.href =
        `../student/mentor.html?task=${encodeURIComponent(taskId)}`;

    try {
        const saved = sessionStorage.getItem(
            `codementor-demo-code-${taskId}`
        );

        if (!saved) {
            codeElement.textContent =
                "No saved draft yet. Open the workspace to write your solution.";
            return;
        }

        const draft = JSON.parse(saved);

        if (
            draft?.version !== 1 ||
            draft.taskId !== taskId ||
            typeof draft.code !== "string"
        ) {
            throw new Error("Invalid draft");
        }

        codeElement.textContent = draft.code || "# Your draft is empty";
    } catch {
        codeElement.textContent = "Saved draft unavailable.";

        message.textContent =
            "Your draft could not be loaded. It has not been changed.";

        message.classList.add("is-error");
    }
}

window.addEventListener("pageshow", loadDraft);
})();
