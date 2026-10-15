(() => {
if (window.learningUnavailable) return;
const progressKey = "codementor-demo-learning";

const statusTitle = document.getElementById("project-status-title");
const statusDescription = document.getElementById(
    "project-status-description"
);

const uploadFields = document.getElementById("project-upload-fields");
const form = document.getElementById("project-form");
const fileInput = document.getElementById("project-file");
const selectedFile = document.getElementById("selected-file");

const uploadMessage = document.getElementById("project-upload-message");
const workspaceMessage = document.getElementById("workspace-message");

const maxFileSize = 10 * 1024 * 1024;

/*
    Level 03 content and its completion writer have not been built yet.

    When they are ready, project access will require:
    progress.levels["3"].completed === true

    This browser value is a demo state only.
    The backend must independently verify real project access.
*/
function isProjectUnlocked() {
    const saved = sessionStorage.getItem(progressKey);

    if (!saved) {
        return false;
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

    return progress.levels?.["3"]?.completed === true;
}

function updateProjectAccess() {
    uploadFields.disabled = true;

    try {
        const unlocked = isProjectUnlocked();

        uploadFields.disabled = !unlocked;

        statusTitle.textContent = unlocked
            ? "Project available"
            : "Project locked";

        statusDescription.textContent = unlocked
            ? "You can prepare your project ZIP. Upload and evaluation are not connected yet."
            : "Complete Level 03 to unlock submission. You can read the project brief now.";
    } catch {
        statusTitle.textContent = "Project access unavailable";

        statusDescription.textContent =
            "Your saved progress could not be checked. Submission remains locked.";

        workspaceMessage.textContent =
            "Saved progress has not been changed.";

        workspaceMessage.classList.add("is-error");
    }
}

function showUploadMessage(text, isError = false) {
    uploadMessage.textContent = text;
    uploadMessage.classList.toggle("is-error", isError);
}

function validateFile(file) {
    if (!file) {
        return "Choose your project ZIP.";
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
        return "Choose a file with the .zip extension.";
    }

    if (file.size === 0) {
        return "The selected file is empty.";
    }

    if (file.size > maxFileSize) {
        return "Choose a ZIP no larger than 10 MB.";
    }

    return "";
}

fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    const error = validateFile(file);

    selectedFile.textContent = "";
    showUploadMessage("");

    if (error) {
        fileInput.value = "";
        showUploadMessage(error, true);
        return;
    }

    selectedFile.textContent =
        `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
});

form.addEventListener("submit", function (event) {
    event.preventDefault();

    try {
        if (!isProjectUnlocked()) {
            updateProjectAccess();
            showUploadMessage("Complete Level 03 before submitting.", true);
            return;
        }
    } catch {
        updateProjectAccess();
        return;
    }

    const file = fileInput.files[0];
    const error = validateFile(file);

    if (error) {
        showUploadMessage(error, true);
        return;
    }

    showUploadMessage(
        "File selected locally. The upload service is not connected, " +
        "so no project has been submitted or evaluated. " +
        "ZIP contents will also need validation."
    );
});

window.addEventListener("pageshow", updateProjectAccess);
})();
