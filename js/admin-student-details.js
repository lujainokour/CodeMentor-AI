(() => {
    const message = document.getElementById(
        "student-details-message"
    );
    const content = document.getElementById(
        "student-details-content"
    );

    const students = window.adminStudentData;

    function showError(text) {
        content.hidden = true;
        message.textContent = text;
        message.classList.add("is-error");
    }

    if (!Array.isArray(students)) {
        showError(
            "Sample student data could not be loaded. Return to the student directory."
        );
        return;
    }

    const parameters = new URLSearchParams(window.location.search);
    const studentId = parameters.get("id");

    const student = students.find(
        item => item.id === studentId
    );

    if (!student) {
        showError(
            "Student not found. Open a student from the student directory."
        );
        return;
    }

    document.getElementById("student-page-title").textContent =
        student.name;

    document.getElementById("detail-name").textContent =
        student.name;

    document.getElementById("detail-email").textContent =
        student.email;

    document.getElementById("detail-id").textContent =
        student.id;

    document.getElementById("detail-path").textContent =
        student.learningPath;

    document.getElementById("detail-level").textContent =
        student.currentLevel;

    const status = document.getElementById("detail-status");

    status.className = `student-status is-${student.status}`;
    status.textContent =
        student.status === "enabled" ? "Enabled" : "Suspended";

    const activity = document.getElementById("detail-activity");

    activity.dateTime = student.lastActivity;
    activity.textContent = student.lastActivity;

    const accessDescription = document.getElementById(
        "detail-access-description"
    );

    const accountAction = document.getElementById(
        "detail-account-action"
    );

    const isSuspended = student.status === "suspended";

    accessDescription.textContent = isSuspended
        ? "This sample account is suspended. Restoring access would allow the student to use the platform again."
        : "This sample account is enabled. Suspending access would prevent the student from using the platform.";

    accountAction.textContent = isSuspended
        ? "Restore account access"
        : "Suspend account access";

    accountAction.href =
        `../admin/admin-account-access.html?id=${encodeURIComponent(student.id)}`;

    document.title = `${student.name} | CodeMentor AI`;

    content.hidden = false;
})();