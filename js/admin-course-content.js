(() => {
    const view = document.getElementById("course-content-view");

    if (!view) return;

    const title = document.getElementById("course-content-title");
    const message = document.getElementById("course-content-message");
    const description = document.getElementById(
        "course-content-description"
    );

    const language = document.getElementById(
        "course-content-language"
    );

    const status = document.getElementById("course-content-status");
    const addLevel = document.getElementById("course-add-level");

    const levelList = document.getElementById("course-level-list");
    const emptyState = document.getElementById("course-level-empty");
    const countMessage = document.getElementById("course-level-count");

    const courseId = new URLSearchParams(location.search).get("id");

    const languageLabels = window.languageCatalog.labels;

    function readDrafts() {
        const raw = sessionStorage.getItem(
            "codementor-demo-admin-course-drafts"
        );

        if (raw === null) return [];

        const stored = JSON.parse(raw);

        if (
            stored?.version !== 1 ||
            !Array.isArray(stored.courses)
        ) {
            throw new Error("Invalid drafts.");
        }

        const valid = stored.courses.every(course => {
            return (
                course &&
                typeof course.id === "string" &&
                typeof course.title === "string" &&
                typeof course.description === "string" &&
                Object.hasOwn(languageLabels, course.language) &&
                course.status === "draft"
            );
        });

        if (!valid) throw new Error("Invalid course.");

        return stored.courses;
    }

    function readLevels(id) { const data = window.courseContentStore.readContent(); return Object.hasOwn(data.courses, id) ? data.courses[id].levels : []; }

    function renderLevels(levels) {
        const fragment = document.createDocumentFragment();

        levels.forEach((level, index) => {
            const item = document.createElement("li");
            item.className = "course-level-item";

            const number = document.createElement("span");
            number.className = "course-level-number";
            number.textContent = String(index + 1).padStart(2, "0");
            number.setAttribute("aria-hidden", "true");

            const heading = document.createElement("h3");
            heading.textContent = level.title;
            const link = document.createElement("a");
            link.className = "dashboard-text-link";
            link.textContent = "Manage lessons →";
            link.href = `../admin/admin-level-content.html?course=${encodeURIComponent(courseId)}&level=${encodeURIComponent(level.id)}`;
            const details = document.createElement("div");
            details.append(heading, link);
            item.append(number, details);
            fragment.append(item);
        });

        levelList.replaceChildren(fragment);
        emptyState.hidden = levels.length > 0;

        countMessage.textContent =
            `${levels.length} ${levels.length === 1 ? "level" : "levels"}`;
    }

    if (!courseId) {
        message.textContent =
            "Choose a course from the course list first.";
        return;
    }

    let course;

    try {
        const sampleCourses = Array.isArray(window.adminCourseData)
            ? window.adminCourseData
            : [];

        course = [
            ...readDrafts(),
            ...sampleCourses
        ].find(item => item.id === courseId);
    } catch {
        message.textContent =
            "Course data could not be read. Existing data was not changed.";
        return;
    }

    if (!course) {
        message.textContent =
            "This course could not be found. Return to the course list.";
        return;
    }

    title.textContent = course.title;
    description.textContent = course.description || "";

    language.textContent =
        course.languageName ||
        languageLabels[course.languageId] ||
        languageLabels[course.language] ||
        course.language ||
        "Not specified";

    status.textContent =
        course.status === "draft" ? "Draft" : "Not published";

    addLevel.href =
        `../admin/admin-level-create.html?id=${encodeURIComponent(courseId)}`;

    view.hidden = false;

    try {
        renderLevels(readLevels(courseId));
    } catch {
        addLevel.hidden = true;
        message.textContent =
            "Learning levels could not be read. Existing data was not changed.";
    }
})();


