(() => {
if (window.learningUnavailable) return;
const tasks = {
    "student-profile": {
        title: "Create a student profile",
        description:
            "Create three variables and display a student's details.",
        requirements: [
            'Set name to "Lujain", age to 21 and track to "Python".',
            "Print one labeled value per line.",
            "Match the expected output exactly.",
            "Do not print additional text."
        ],
        input: "",
        output: "Name: Lujain\nAge: 21\nTrack: Python",
        starter:
            "# Create the three variables\n\n" +
            "# Print the labeled values\n"
    },

    receipt: {
        title: "Build a simple receipt",
        description:
            "Read a price and quantity, then calculate the total.",
        requirements: [
            "Read the price from the first input line using float(input()).",
            "Read the quantity from the second line using int(input()).",
            "Use input() without prompt text.",
            "Print Total: followed by the result with two decimal places.",
            "Assume the inputs are valid non-negative numbers."
        ],
        input: "2.5\n3",
        output: "Total: 7.50",
        starter:
            "# Read price and quantity\n\n" +
            "# Calculate the total\n\n" +
            "# Print the formatted result\n"
    }
};

const taskId = new URLSearchParams(
    window.location.search
).get("task") || "student-profile";

const task = tasks[taskId];

const editor = document.getElementById("code-editor");
const programInput = document.getElementById("program-input");
const draftStatus = document.getElementById("draft-status");
const message = document.getElementById("workspace-message");

const saveButton = document.getElementById("save-draft");
const runButton = document.getElementById("run-code");
const submitButton = document.getElementById("submit-code");
const resetButton = document.getElementById("reset-code");

const resetDialog = document.getElementById("reset-dialog");
const cancelReset = document.getElementById("cancel-reset");
const confirmReset = document.getElementById("confirm-reset");

const draftKey = `codementor-demo-code-${taskId}`;

let saveTimer;
let hasUnsavedChanges = false;
let tabCanLeaveEditor = false;
let draftLoaded = false;

function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("is-error", isError);
}

function saveDraft(showConfirmation = false) {
    if (!task || !draftLoaded) {
        return false;
    }

    clearTimeout(saveTimer);

    try {
        sessionStorage.setItem(
            draftKey,
            JSON.stringify({
                version: 1,
                taskId: taskId,
                code: editor.value,
                input: programInput.value,
                updatedAt: new Date().toISOString()
            })
        );

        hasUnsavedChanges = false;
        draftStatus.textContent = "Draft saved";

        if (showConfirmation) {
            showMessage("Your code and input are saved in this tab.");
        }

        return true;
    } catch {
        draftStatus.textContent = "Draft not saved";

        showMessage(
            "Couldn’t save your draft. Keep this page open and try Save draft again.",
            true
        );

        return false;
    }
}

function scheduleSave() {
    hasUnsavedChanges = true;
    draftStatus.textContent = "Saving…";
    showMessage("");

    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
        saveDraft();
    }, 500);
}

function loadTask() {
    document.title = `${task.title} | CodeMentor AI`;
    document.getElementById("task-title").textContent = task.title;
    document.getElementById("task-description").textContent =
        task.description;

    const requirements = document.getElementById("task-requirements");

    task.requirements.forEach(function (text) {
        const item = document.createElement("li");
        item.textContent = text;
        requirements.append(item);
    });

    document.getElementById("example-input").textContent =
        task.input || "No input required.";

    document.getElementById("expected-output").textContent =
        task.output;

    document.getElementById("mentor-link").href =
        `../student/mentor.html?task=${encodeURIComponent(taskId)}`;

    editor.value = task.starter;
    programInput.value = task.input;

    try {
        const saved = sessionStorage.getItem(draftKey);

        if (saved) {
            const draft = JSON.parse(saved);

            if (
                draft?.version !== 1 ||
                draft.taskId !== taskId ||
                typeof draft.code !== "string" ||
                typeof draft.input !== "string"
            ) {
                throw new Error("Invalid draft");
            }

            editor.value = draft.code;
            programInput.value = draft.input;
            draftStatus.textContent = "Saved draft loaded";
        } else {
            draftStatus.textContent = "Starter code loaded";
        }

        draftLoaded = true;
    } catch {
        draftStatus.textContent = "Draft unavailable";

        editor.disabled = true;
        programInput.disabled = true;
        saveButton.disabled = true;
        runButton.disabled = true;
        submitButton.disabled = true;

        showMessage(
            "Your saved draft could not be loaded. It has not been overwritten. " +
            "Use Reset code only if you want to replace it.",
            true
        );
    }
}

editor.addEventListener("input", scheduleSave);
programInput.addEventListener("input", scheduleSave);

editor.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        tabCanLeaveEditor = true;
        return;
    }

    if (event.key === "Tab") {
        if (tabCanLeaveEditor || event.shiftKey) {
            tabCanLeaveEditor = false;
            return;
        }

        event.preventDefault();

        editor.setRangeText(
            "    ",
            editor.selectionStart,
            editor.selectionEnd,
            "end"
        );

        scheduleSave();
        return;
    }

    tabCanLeaveEditor = false;
});

editor.addEventListener("blur", function () {
    tabCanLeaveEditor = false;
});

saveButton.addEventListener("click", function () {
    saveDraft(true);
});

runButton.addEventListener("click", function () {
    if (saveDraft()) {
        showMessage(
            "Your draft is saved. Python execution is not connected yet; " +
            "no code has been run."
        );
    }
});

submitButton.addEventListener("click", function () {
    if (!editor.value.trim()) {
        showMessage("Write your solution before submitting.", true);
        editor.focus();
        return;
    }

    if (saveDraft()) {
        showMessage(
            "Your draft is saved. Required tests are not connected yet, " +
            "so this task has not been submitted or marked complete."
        );
    }
});

resetButton.addEventListener("click", function () {
    if (task) {
        resetDialog.showModal();
    }
});

cancelReset.addEventListener("click", function () {
    resetDialog.close();
});

confirmReset.addEventListener("click", function () {
    try {
        sessionStorage.setItem(
            draftKey,
            JSON.stringify({
                version: 1,
                taskId: taskId,
                code: task.starter,
                input: task.input,
                updatedAt: new Date().toISOString()
            })
        );
    } catch {
        resetDialog.close();
        showMessage("Couldn’t reset your saved draft. Try again.", true);
        return;
    }

    clearTimeout(saveTimer);

    editor.value = task.starter;
    programInput.value = task.input;
    editor.disabled = false;
    programInput.disabled = false;

    saveButton.disabled = false;
    runButton.disabled = false;
    submitButton.disabled = false;

    draftLoaded = true;
    hasUnsavedChanges = false;
    draftStatus.textContent = "Starter code saved";

    document.getElementById("program-output").textContent =
        "Your program output will appear here after execution.";

    resetDialog.close();
    showMessage("Your code has been reset.");
    editor.focus();
});

window.addEventListener("beforeunload", function (event) {
    if (!hasUnsavedChanges) {
        return;
    }

    if (!saveDraft()) {
        event.preventDefault();
        event.returnValue = "";
    }
});

if (task) {
    loadTask();
} else {
    document.getElementById("task-title").textContent = "Task not found";
    draftStatus.textContent = "Unknown task";

    editor.disabled = true;
    programInput.disabled = true;

    [saveButton, runButton, submitButton, resetButton].forEach(
        function (button) {
            button.disabled = true;
        }
    );

    showMessage(
        "Return to Python Foundations and choose an available task.",
        true
    );
    const reviewLink = document.getElementById("open-code-review");

reviewLink.href =
    `../student/code-review.html?task=${encodeURIComponent(taskId)}`;

reviewLink.addEventListener("click", function (event) {
    if (!saveDraft()) {
        event.preventDefault();
    }
});
}
})();
