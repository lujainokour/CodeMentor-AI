(() => {
    const catalog = window.languageCatalog, store = window.courseContentStore;
    const root = document.getElementById("service-content");
    function el(tag, text, cls) { const node = document.createElement(tag); if (text) node.textContent = text; if (cls) node.className = cls; return node; }
    function link(label, href) { const a = el("a", label, "button button-outline"); a.href = href; return a; }
    const params = new URLSearchParams(location.search), id = params.get("id");
    function publicLessons(course, content) {
        const levels = Object.hasOwn(content.courses, course.id) ? content.courses[course.id].levels : [];
        return levels.map(level => ({ ...level, lessons: (level.lessons || []).filter(lesson => lesson.status === "published" && (lesson.content?.trim() || ((course.language || course.languageId) === "python" && lesson.builtInLessonId))) })).filter(level => level.lessons.length);
    }
    try {
        const courses = store.readCourses(), content = store.readContent();
        if (document.body.dataset.servicePage === "course") {
            const course = courses.find(item => item.id === id);
            if (!course) { root.append(el("p", "Course not found. Saved data was not changed.", "services-notice"), link("Browse languages", "../public/languages.html")); return; }
            const language = catalog.get(course.language || course.languageId);
            document.querySelector(".services-heading h1").textContent = course.title;
            root.append(el("p", `${language?.name || "Unknown language"} · Locally saved course content`, "eyebrow"), el("p", course.description));
            const levels = publicLessons(course, content);
            if (!levels.length) root.append(el("p", "Content not available. There are no locally available lessons in this course yet.", "services-notice"));
            levels.forEach(level => {
                const card = el("section", undefined, "services-panel"); card.append(el("h2", level.title));
                const list = el("ul"); level.lessons.forEach(lesson => {
                    const row = el("li"); const a = link(lesson.title, `../student/lesson.html?course=${encodeURIComponent(course.id)}&level=${encodeURIComponent(level.id)}&lesson=${encodeURIComponent(lesson.id)}`); row.append(a); list.append(row);
                }); card.append(list); root.append(card);
            });
            root.append(el("p", "Local lesson visibility does not publish content to a server or create an assessed learning path.", "services-notice"), link("Back to languages", `../public/languages.html?language=${encodeURIComponent(language?.id || "")}`)); return;
        }
        const controls = el("form", undefined, "services-filters"); controls.setAttribute("role", "search");
        const wrapper = el("div", undefined, "form-field"), label = el("label", "Find a programming language"); label.htmlFor = "language-search";
        const search = el("input"); search.type = "search"; search.id = "language-search"; wrapper.append(label, search); controls.append(wrapper);
        const count = el("p", "", "services-results"); count.setAttribute("role", "status"); const grid = el("div", undefined, "services-grid");
        const requested = params.get("language");
        if (requested) {
            const language = catalog.get(requested);
            root.append(el("p", language ? `${language.name}: ${language.builtInContent ? "Python demo available" : "Full learning path coming soon. No placement test is connected for this language."}` : "This language is not in the catalogue. No Python activity has been opened.", "services-notice"));
        }
        function render() {
            const entries = catalog.entries.filter(entry => `${entry.name} ${entry.description}`.toLowerCase().includes(search.value.trim().toLowerCase()));
            grid.replaceChildren(); count.textContent = `${entries.length} programming languages`;
            entries.forEach(entry => {
                const card = el("article", undefined, "services-card");
                const matching = courses.filter(course => (course.language || course.languageId) === entry.id);
                const available = matching.filter(course => publicLessons(course, content).length > 0);
                card.append(el("p", entry.builtInContent ? "PYTHON FRONTEND DEMO" : available.length ? "LOCAL LESSON CONTENT" : "COMING SOON", "eyebrow"), el("h2", entry.name), el("p", entry.description));
                if (entry.builtInContent) {
                    const choose = el("button", "Choose the Python demo path", "button button-primary"); choose.type = "button";
                    choose.addEventListener("click", () => {
                        try {
                            const raw = sessionStorage.getItem("codementor-demo-onboarding"); const previous = raw === null ? {} : JSON.parse(raw);
                            if (!previous || typeof previous !== "object" || Array.isArray(previous) || (raw !== null && (!catalog.has(previous.language) || !["beginner", "basics", "practising"].includes(previous.experience) || !["foundations", "problem-solving", "projects"].includes(previous.goal)))) throw new Error("Invalid preferences");
                            sessionStorage.setItem("codementor-demo-onboarding", JSON.stringify({ experience: "beginner", goal: "foundations", ...previous, language: entry.id }));
                            location.href = "../student/learning-path.html";
                        } catch { root.prepend(el("p", "Preferences could not be saved. Existing data was not replaced.", "services-notice")); }
                    }); card.append(choose);
                } else card.append(el("p", "Full path and assessment: coming soon. No automatic enrolment or Python redirect."));
                available.forEach(course => card.append(link(`View local lessons: ${course.title}`, `../public/course.html?id=${encodeURIComponent(course.id)}`)));
                grid.append(card);
            });
            if (!entries.length) grid.append(el("p", "No languages match your search."));
        }
        controls.addEventListener("submit", event => event.preventDefault()); search.addEventListener("input", render); root.append(controls, count, grid); render();
    } catch { root.append(el("p", "Saved course data could not be read. Existing data was not changed. The catalogue cannot determine local content availability.", "services-notice")); }
})();
