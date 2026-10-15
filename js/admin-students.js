(() => {
    const students = window.adminStudentData;

    const form = document.getElementById("student-filter-form");
    const searchInput = document.getElementById("student-search");
    const statusFilter = document.getElementById(
        "student-status-filter"
    );
    const clearButton = document.getElementById(
        "student-clear-filters"
    );

    const tableBody = document.getElementById("student-table-body");
    const emptyState = document.getElementById("student-empty-state");
    const resultsMessage = document.getElementById(
        "student-results-message"
    );

    if (!Array.isArray(students)) {
        resultsMessage.textContent =
            "Student data could not be loaded. Please refresh the page.";

        resultsMessage.classList.add("is-error");
        searchInput.disabled = true;
        statusFilter.disabled = true;
        clearButton.disabled = true;
        return;
    }

    function createCell(text) {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
    }

    function createStudentRow(student) {
        const row = document.createElement("tr");

        const identityCell = document.createElement("td");
        identityCell.className = "student-identity";

        const name = document.createElement("strong");
        name.textContent = student.name;

        const email = document.createElement("span");
        email.textContent = student.email;

        identityCell.append(name, email);

        const statusCell = document.createElement("td");
        const status = document.createElement("span");

        status.className = `student-status is-${student.status}`;
        status.textContent =
            student.status === "enabled" ? "Enabled" : "Suspended";

        statusCell.append(status);

        const activityCell = document.createElement("td");
        const activityDate = document.createElement("time");

        activityDate.dateTime = student.lastActivity;
        activityDate.textContent = student.lastActivity;

        activityCell.append(activityDate);

        const actionCell = document.createElement("td");
        const detailsLink = document.createElement("a");

        detailsLink.className = "dashboard-text-link";
        detailsLink.href =
            `../admin/admin-student-details.html?id=${encodeURIComponent(student.id)}`;

        detailsLink.textContent = "View details →";
        detailsLink.setAttribute(
            "aria-label",
            `View details for ${student.name}`
        );

        actionCell.append(detailsLink);

        row.append(
            identityCell,
            createCell(student.learningPath),
            createCell(student.currentLevel),
            statusCell,
            activityCell,
            actionCell
        );

        return row;
    }

    function renderStudents() {
        const search = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;

        const filteredStudents = students.filter(student => {
            const matchesSearch =
                student.name.toLowerCase().includes(search) ||
                student.email.toLowerCase().includes(search);

            const matchesStatus =
                selectedStatus === "all" ||
                student.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        const fragment = document.createDocumentFragment();

        filteredStudents.forEach(student => {
            fragment.append(createStudentRow(student));
        });

        tableBody.replaceChildren(fragment);
        emptyState.hidden = filteredStudents.length > 0;

        resultsMessage.textContent =
            `Showing ${filteredStudents.length} of ${students.length} sample students.`;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        renderStudents();
    });

    searchInput.addEventListener("input", renderStudents);
    statusFilter.addEventListener("change", renderStudents);

    clearButton.addEventListener("click", () => {
        form.reset();
        renderStudents();
        searchInput.focus();
    });

    renderStudents();
})();