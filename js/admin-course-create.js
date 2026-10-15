(() => {
    const form = document.getElementById("course-create-form");

    if (!form) return;

    const titleInput = document.getElementById("course-title");
    const languageInput = document.getElementById("course-language");
    const descriptionInput = document.getElementById(
        "course-description"
    );

    const submitButton = document.getElementById(
        "course-create-submit"
    );

    const message = document.getElementById(
        "course-create-message"
    );

    const storageKey = "codementor-demo-admin-course-drafts";

    const languages = window.languageCatalog.labels;

    window.languageCatalog.populateSelect(languageInput);
    languageInput.value = "";
    const placeholder = document.createElement("option"); placeholder.value = ""; placeholder.textContent = "Select a language"; languageInput.prepend(placeholder); languageInput.value = "";
    let saved = false;

    function readDrafts() {
        const raw = sessionStorage.getItem(storageKey);

        if (raw === null) return [];

        const stored = JSON.parse(raw);

        if (
            stored?.version !== 1 ||
            !Array.isArray(stored.courses)
        ) {
            throw new Error("Invalid draft storage.");
        }

        const valid = stored.courses.every(course => {
            return (
                course &&
                typeof course.id === "string" &&
                typeof course.title === "string" &&
                typeof course.description === "string" &&
                Object.hasOwn(languages, course.language) &&
                course.status === "draft"
            );
        });

        if (!valid) {
            throw new Error("Invalid course data.");
        }

        return stored.courses;
    }

    function createId(existingCourses) {
        let id;

        do {
            const token = window.crypto?.randomUUID
                ? window.crypto.randomUUID()
                : `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}`;

            id = `course-${token}`;
        } while (existingCourses.some(course => course.id === id));

        return id;
    }

    titleInput.addEventListener("input", () => {
        titleInput.setCustomValidity("");
        if (!saved) message.textContent = "";
    });

    descriptionInput.addEventListener("input", () => {
        descriptionInput.setCustomValidity("");
        if (!saved) message.textContent = "";
    });

    languageInput.addEventListener("change", () => {
        languageInput.setCustomValidity("");
        if (!saved) message.textContent = "";
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (saved) return;

        titleInput.setCustomValidity("");
        languageInput.setCustomValidity("");
        descriptionInput.setCustomValidity("");

        const title = titleInput.value.trim();
        const language = languageInput.value;
        const description = descriptionInput.value.trim();

        if (!title) {
            titleInput.setCustomValidity("Enter a course name.");
        } else if (title.length > 80) {
            titleInput.setCustomValidity(
                "Use no more than 80 characters."
            );
        }

        if (!Object.hasOwn(languages, language)) {
            languageInput.setCustomValidity(
                "Select a supported language."
            );
        }

        if (!description) {
            descriptionInput.setCustomValidity(
                "Enter a course description."
            );
        } else if (description.length > 600) {
            descriptionInput.setCustomValidity(
                "Use no more than 600 characters."
            );
        }

        if (!form.reportValidity()) return;

        let draft;

        try {
            const courses = readDrafts();

            const duplicate = courses.some(course => {
                return (
                    course.language === language &&
                    course.title.trim().toLowerCase() ===
                        title.toLowerCase()
                );
            });

            if (duplicate) {
                message.textContent =
                    "A draft with this name and language already exists.";

                titleInput.focus();
                return;
            }

            draft = {
                id: createId(courses),
                title,
                language,
                languageLabel: languages[language],
                description,
                status: "draft",
                createdAt: new Date().toISOString()
            };

            sessionStorage.setItem(
                storageKey,
                JSON.stringify({
                    version: 1,
                    courses: [...courses, draft]
                })
            );
        } catch {
            message.textContent =
                "The draft could not be saved. " +
                "Existing data was left unchanged. Please try again.";

            return;
        }

        saved = true;

        titleInput.readOnly = true;
        languageInput.disabled = true;
        descriptionInput.readOnly = true;

        submitButton.disabled = true;
        submitButton.textContent = "Draft created";

        message.textContent =
            `"${title}" was saved as a local draft. ` +
            "It is not published to students. ";

        const contentLink = document.createElement("a");

        contentLink.href =
            `../admin/admin-course-content.html?id=${encodeURIComponent(draft.id)}`;

        contentLink.className = "dashboard-text-link";
        contentLink.textContent = "Open course content →";

        message.append(contentLink);
    });
})();
