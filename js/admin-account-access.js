(() => {
    const message = document.getElementById("access-message");
    const content = document.getElementById("access-content");
    const actionButton = document.getElementById(
        "access-action-button"
    );

    const dialog = document.getElementById("access-confirm-dialog");
    const confirmTitle = document.getElementById(
        "access-confirm-title"
    );
    const confirmDescription = document.getElementById(
        "access-confirm-description"
    );
    const confirmButton = document.getElementById(
        "access-confirm-button"
    );

    const store = window.adminStudentStore;
    const parameters = new URLSearchParams(window.location.search);
    const studentId = parameters.get("id");

    let student;
    let pendingStatus = null;

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.classList.toggle("is-error", isError);
    }

    function renderStudent() {
        student = window.adminStudentData.find(
            item => item.id === studentId
        );

        const isSuspended = student.status === "suspended";

        document.getElementById("access-page-title").textContent =
            isSuspended
                ? "Restore account access."
                : "Suspend account access.";

        document.getElementById("access-student-name").textContent =
            student.name;

        document.getElementById("access-student-email").textContent =
            student.email;

        const status = document.getElementById(
            "access-current-status"
        );

        status.className = `student-status is-${student.status}`;
        status.textContent = isSuspended ? "Suspended" : "Enabled";

        document.getElementById(
            "access-action-description"
        ).textContent = isSuspended
            ? "Restore this sample account to the enabled status."
            : "Change this sample account to the suspended status.";

        actionButton.textContent = isSuspended
            ? "Restore sample account"
            : "Suspend sample account";

        document.getElementById("access-back-link").href =
            `../admin/admin-student-details.html?id=${encodeURIComponent(student.id)}`;

        content.hidden = false;
    }

    if (
        !Array.isArray(window.adminStudentData) ||
        !store
    ) {
        showMessage("Sample account data could not be loaded.", true);
        return;
    }

    student = window.adminStudentData.find(
        item => item.id === studentId
    );

    if (!student) {
        showMessage(
            "Student not found. Open an account from the student directory.",
            true
        );
        return;
    }

    renderStudent();

    if (store.loadError) {
        showMessage(store.loadError, true);
        actionButton.disabled = true;
    }

    actionButton.addEventListener("click", () => {
        pendingStatus = student.status === "suspended"
            ? "enabled"
            : "suspended";

        const restoring = pendingStatus === "enabled";

        confirmTitle.textContent = restoring
            ? "Restore sample account?"
            : "Suspend sample account?";

        confirmDescription.textContent =
            `${student.name}'s sample account will be marked as ` +
            `${pendingStatus} in this browser tab. ` +
            "No real account access will change.";

        confirmButton.textContent = restoring
            ? "Confirm restore"
            : "Confirm suspension";

        dialog.returnValue = "";
        dialog.showModal();
    });

    dialog.addEventListener("close", () => {
        if (
            dialog.returnValue !== "confirm" ||
            pendingStatus === null
        ) {
            pendingStatus = null;
            return;
        }

        try {
            store.setStatus(student.id, pendingStatus);
            renderStudent();

            showMessage(
                `Sample account status saved as ${student.status}. ` +
                "Real account access was not changed."
            );
        } catch {
            showMessage(
                "The sample status could not be saved. No change was applied.",
                true
            );
        }

        pendingStatus = null;
    });
})();