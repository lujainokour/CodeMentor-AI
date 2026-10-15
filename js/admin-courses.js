(() => {
    let courses = window.adminCourseData;
    const languageLabels = window.languageCatalog.labels;

    const form = document.getElementById("course-filter-form");
    const searchInput = document.getElementById("course-search");
    const languageFilter = document.getElementById(
        "course-language-filter"
    );
    const statusFilter = document.getElementById(
        "course-status-filter"
    );
    const clearButton = document.getElementById(
        "course-clear-filters"
    );

    const courseList = document.getElementById("course-list");
    const emptyState = document.getElementById("course-empty-state");
    const message = document.getElementById(
        "course-results-message"
    );

    if (!Array.isArray(courses)) {
        message.textContent =
            "Learning path data could not be loaded.";

        message.classList.add("is-error");

        searchInput.disabled = true;
        languageFilter.disabled = true;
        statusFilter.disabled = true;
        clearButton.disabled = true;
        return;
    }

    // Adapt local drafts for display without changing either storage contract.
    try {
        const raw = sessionStorage.getItem("codementor-demo-admin-course-drafts");
        const stored = raw === null ? { version: 1, courses: [] } : JSON.parse(raw);
        if (stored?.version !== 1 || !Array.isArray(stored.courses) || !stored.courses.every(course =>
            course && typeof course.id === "string" && typeof course.title === "string" &&
            typeof course.description === "string" && Object.hasOwn(languageLabels, course.language) && course.status === "draft"
        )) throw new Error("Invalid draft data");
        const drafts = stored.courses.map(course => ({
            ...course, languageId: course.language,
            languageName: languageLabels[course.language], isLocalDraft: true
        }));
        if (new Set(drafts.map(course => course.id)).size !== drafts.length) throw new Error("Duplicate draft ids");
        courses = [...drafts, ...courses.filter(course => !drafts.some(draft => draft.id === course.id))];
    } catch {
        message.textContent = "Saved course drafts could not be read. No records were deleted or replaced. Course listing is unavailable until the saved data can be read.";
        message.classList.add("is-error");
        searchInput.disabled = true; languageFilter.disabled = true; statusFilter.disabled = true; clearButton.disabled = true;
        return;
    }

    function populateLanguages() {
        const languages = new Map();

        courses.forEach(course => {
            languages.set(course.languageId, course.languageName);
        });

        languages.forEach((name, id) => {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = name;
            languageFilter.append(option);
        });
    }

    function createCourseCard(course) {
        const card = document.createElement("article");
        card.className = "course-management-card";

        const top = document.createElement("div");
        top.className = "course-card-top";

        const language = document.createElement("span");
        language.className = "course-language-label";
        language.textContent = course.languageName;

        const status = document.createElement("span");
        status.className =
            `course-publication-status is-${course.status}`;

        status.textContent =
            course.status === "published" ? "Published" : "Draft";

        top.append(language, status);

        const title = document.createElement("h3");
        title.textContent = course.title;

        const description = document.createElement("p");
        description.textContent = course.description;

        const version = document.createElement("p");
        version.className = "dashboard-footnote";
        version.textContent =
            course.isLocalDraft ? "Local draft · Not published to students" : `Version ${course.version} · Sample learning path`;

        const link = document.createElement("a");
        link.className = "dashboard-text-link";
        link.textContent = "Manage content →";

        link.href =
            `../admin/admin-course-content.html?id=${encodeURIComponent(course.id)}`;

        link.setAttribute(
            "aria-label",
            `Manage content for ${course.title}`
        );

        card.append(top, title, description, version, link);

        return card;
    }

    function renderCourses() {
        const search = searchInput.value.trim().toLowerCase();
        const selectedLanguage = languageFilter.value;
        const selectedStatus = statusFilter.value;

        const filteredCourses = courses.filter(course => {
            const matchesSearch =
                course.title.toLowerCase().includes(search) ||
                course.languageName.toLowerCase().includes(search);

            const matchesLanguage =
                selectedLanguage === "all" ||
                course.languageId === selectedLanguage;

            const matchesStatus =
                selectedStatus === "all" ||
                course.status === selectedStatus;

            return matchesSearch && matchesLanguage && matchesStatus;
        });

        const fragment = document.createDocumentFragment();

        filteredCourses.forEach(course => {
            fragment.append(createCourseCard(course));
        });

        courseList.replaceChildren(fragment);
        emptyState.hidden = filteredCourses.length > 0;

        message.textContent =
            `Showing ${filteredCourses.length} of ${courses.length} learning paths (samples and local drafts).`;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        renderCourses();
    });

    searchInput.addEventListener("input", renderCourses);
    languageFilter.addEventListener("change", renderCourses);
    statusFilter.addEventListener("change", renderCourses);

    clearButton.addEventListener("click", () => {
        form.reset();
        renderCourses();
        searchInput.focus();
    });

    populateLanguages();
    renderCourses();
})();

