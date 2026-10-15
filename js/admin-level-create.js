(() => {
    const form = document.getElementById("level-create-form");

    if (!form) return;

    const view = document.getElementById("level-create-view");
    const backLink = document.getElementById("level-back-link");
    const context = document.getElementById("level-course-context");
    const loadMessage = document.getElementById("level-load-message");
    const position = document.getElementById("level-position");

    const titleInput = document.getElementById("level-title");
    const descriptionInput = document.getElementById("level-description");
    const objectivesInput = document.getElementById("level-objectives");

    const submitButton = document.getElementById("level-create-submit");
    const message = document.getElementById("level-create-message");

    const draftKey = "codementor-demo-admin-course-drafts";
    const contentKey = "codementor-demo-admin-course-content";

    const courseId = new URLSearchParams(window.location.search).get("id");

    const languages = window.languageCatalog.labels;

    let saved = false;
    let course;

    function isObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function readDrafts() {
        const raw = sessionStorage.getItem(draftKey);

        if (raw === null) return [];

        const stored = JSON.parse(raw);

        if (
            stored?.version !== 1 ||
            !Array.isArray(stored.courses)
        ) {
            throw new Error("Invalid draft storage.");
        }

        const valid = stored.courses.every(item => {
            return (
                isObject(item) &&
                typeof item.id === "string" &&
                typeof item.title === "string" &&
                typeof item.description === "string" &&
                Object.hasOwn(languages, item.language) &&
                item.status === "draft"
            );
        });

        if (!valid) {
            throw new Error("Invalid course data.");
        }

        return stored.courses;
    }

    function readContent() { return window.courseContentStore.readContent(); }

    function getLevels(content) {
        return Object.hasOwn(content.courses, courseId)
            ? content.courses[courseId].levels
            : [];
    }

    function createId(content) {
        const existingIds = new Set(
            Object.values(content.courses).flatMap(entry =>
                entry.levels.map(level => level.id)
            )
        );

        let id;

        do {
            const token = window.crypto?.randomUUID
                ? window.crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

            id = `level-${token}`;
        } while (existingIds.has(id));

        return id;
    }

    function initialize() {
        if (!courseId) {
            context.textContent = "No course selected.";
            loadMessage.textContent =
                "Open a course and choose Add level.";
            return;
        }

        try {
            const drafts = readDrafts();

            const baseCourses = Array.isArray(window.adminCourseData)
                ? window.adminCourseData
                : [];

            course = [...drafts, ...baseCourses].find(item =>
                item.id === courseId
            );

            if (!course) {
                context.textContent = "Course unavailable.";
                loadMessage.textContent =
                    "This course could not be found. Return to the course list.";
                return;
            }

            const content = readContent();
            const levels = getLevels(content);

            backLink.href =
                `../admin/admin-course-content.html?id=${encodeURIComponent(courseId)}`;

            backLink.textContent = "← Back to course content";
            context.textContent = `Creating a level for ${course.title}.`;

            position.textContent =
                `Level ${String(levels.length + 1).padStart(2, "0")}`;

            view.hidden = false;
        } catch {
            context.textContent = "Course content could not be loaded.";
            loadMessage.textContent =
                "The saved data could not be read. Existing data was left unchanged.";
        }
    }

    [titleInput, descriptionInput, objectivesInput].forEach(input => {
        input.addEventListener("input", () => {
            input.setCustomValidity("");

            if (!saved) message.textContent = "";
        });
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (saved || !course) return;

        titleInput.setCustomValidity("");
        descriptionInput.setCustomValidity("");
        objectivesInput.setCustomValidity("");

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        const objectives = objectivesInput.value
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);

        if (!title) {
            titleInput.setCustomValidity("Enter a level name.");
        } else if (title.length > 80) {
            titleInput.setCustomValidity(
                "Use no more than 80 characters."
            );
        }

        if (!description) {
            descriptionInput.setCustomValidity(
                "Enter a level description."
            );
        } else if (description.length > 600) {
            descriptionInput.setCustomValidity(
                "Use no more than 600 characters."
            );
        }

        if (objectives.length === 0) {
            objectivesInput.setCustomValidity(
                "Enter at least one learning objective."
            );
        } else if (objectives.length > 8) {
            objectivesInput.setCustomValidity(
                "Use no more than 8 learning objectives."
            );
        } else if (objectives.some(objective => objective.length > 150)) {
            objectivesInput.setCustomValidity(
                "Use no more than 150 characters per objective."
            );
        } else if (objectivesInput.value.length > 1200) {
            objectivesInput.setCustomValidity(
                "Use no more than 1200 characters in total."
            );
        }

        if (!form.reportValidity()) return;

        try {
            const content = readContent();
            const levels = getLevels(content);

            const duplicate = levels.some(level =>
                level.title.trim().toLowerCase() === title.toLowerCase()
            );

            if (duplicate) {
                message.textContent =
                    "A level with this name already exists in this course.";

                titleInput.focus();
                return;
            }

            const level = {
                id: createId(content),
                title,
                description,
                objectives,
                status: "draft",
                lessons: [],
                createdAt: new Date().toISOString()
            };

            const existingEntry = Object.hasOwn(content.courses, courseId)
                ? content.courses[courseId]
                : {};

            const updated = {
                ...content,
                courses: {
                    ...content.courses,
                    [courseId]: {
                        ...existingEntry,
                        levels: [...levels, level]
                    }
                }
            };

            sessionStorage.setItem(contentKey, JSON.stringify(updated));
        } catch {
            message.textContent =
                "The level could not be saved. Existing data was left unchanged. Please try again.";
            return;
        }

        saved = true;

        titleInput.readOnly = true;
        descriptionInput.readOnly = true;
        objectivesInput.readOnly = true;

        submitButton.disabled = true;
        submitButton.textContent = "Level created";

        const contentLink = document.createElement("a");

        contentLink.href =
            `../admin/admin-course-content.html?id=${encodeURIComponent(courseId)}`;

        contentLink.className = "dashboard-text-link";
        contentLink.textContent = "View course content →";

        message.replaceChildren(
            document.createTextNode(
                `"${title}" was saved as a local draft. `
            ),
            contentLink
        );
    });

    initialize();
})();

