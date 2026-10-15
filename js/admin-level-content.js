(() => {
    "use strict";
    const store = window.courseContentStore;
    const params = new URLSearchParams(location.search);
    const courseId = params.get("course"), levelId = params.get("level");
    const view = document.getElementById("level-content-view");
    const notice = document.getElementById("level-content-message");
    const list = document.getElementById("level-lessons");
    const form = document.getElementById("lesson-editor");
    const sourceForm = document.getElementById("source-editor");
    const sourceList = document.getElementById("lesson-sources");
    const sourceFields = document.getElementById("source-fields");
    let selected = null, snapshot, editingSource = null;
    const fields = { title: "edit-lesson-title", summary: "edit-lesson-summary", content: "edit-lesson-content", code: "edit-lesson-code", output: "edit-lesson-output", minutes: "edit-lesson-minutes", status: "edit-lesson-status", builtInLessonId: "edit-lesson-builtin" };
    const input = key => document.getElementById(fields[key]);
    function say(text, error = false) { notice.textContent = text; notice.classList.toggle("is-error", error); }
    function node(tag, text, cls) { const value = document.createElement(tag); value.textContent = text; if (cls) value.className = cls; return value; }
    function resetSource() { editingSource = null; sourceForm.reset(); document.getElementById("save-source").textContent = "Add source"; }
    function renderSources(lesson) {
        sourceList.replaceChildren(); resetSource(); sourceFields.disabled = !lesson;
        if (!lesson) { sourceList.append(node("p", "Save or select a lesson before adding sources.")); return; }
        if (!lesson.resources?.length) sourceList.append(node("p", "No external learning sources have been added."));
        (lesson.resources || []).forEach((resource, index) => {
            const item = node("li", "", "content-source-row");
            const a = node("a", `${resource.title} ↗`); a.href = resource.url; a.target = "_blank"; a.rel = "noopener noreferrer";
            a.setAttribute("aria-label", `${resource.title} (external source, opens in a new tab)`);
            const edit = node("button", "Edit", "button button-outline"); edit.type = "button";
            edit.addEventListener("click", () => { editingSource = index; document.getElementById("source-title").value = resource.title; document.getElementById("source-url").value = resource.url; document.getElementById("save-source").textContent = "Save source changes"; document.getElementById("source-title").focus(); });
            const remove = node("button", "Delete", "button button-outline"); remove.type = "button";
            remove.setAttribute("aria-label", `Delete source: ${resource.title}`);
            remove.addEventListener("click", () => changeSources(resources => resources.filter((_, position) => position !== index), "Source deleted. Lesson content was kept."));
            item.append(a, edit, remove); sourceList.append(item);
        });
    }
    function selectLesson(lesson) {
        selected = lesson?.id || null; snapshot = lesson ? JSON.stringify(lesson) : undefined;
        Object.entries(fields).forEach(([key]) => { input(key).value = lesson?.[key] ?? (key === "minutes" ? 10 : key === "status" ? "draft" : ""); });
        document.getElementById("lesson-editor-title").textContent = lesson ? "Edit lesson" : "Add a lesson";
        renderSources(lesson);
        document.getElementById("lesson-dirty-note").textContent = "";
    }
    function renderList() {
        const current = store.context(courseId, levelId); list.replaceChildren();
        document.getElementById("level-content-title").textContent = current.level.title;
        document.getElementById("level-content-description").textContent = current.level.description || "No level description saved.";
        document.getElementById("level-course-name").textContent = current.course.title;
        const objectives = document.getElementById("level-content-objectives"); objectives.replaceChildren();
        (Array.isArray(current.level.objectives) ? current.level.objectives : []).forEach(value => objectives.append(node("li", value)));
        document.getElementById("lesson-empty").hidden = current.lessons.length > 0;
        current.lessons.forEach(lesson => {
            const item = node("li", "", "course-level-item");
            const details = node("div", ""); details.append(node("h3", lesson.title), node("p", lesson.status === "published" ? "Available in local student preview" : "Local draft"));
            const edit = node("button", "Edit lesson & sources", "button button-outline"); edit.type = "button";
            edit.addEventListener("click", () => { selectLesson(lesson); input("title").focus(); });
            const preview = node("a", "Preview student lesson", "dashboard-text-link");
            preview.href = `../student/lesson.html?course=${encodeURIComponent(courseId)}&level=${encodeURIComponent(levelId)}&lesson=${encodeURIComponent(lesson.id)}&preview=1`;
            details.append(edit, preview); item.append(details); list.append(item);
        });
        return current;
    }
    function changeSources(transform, text) {
        if (!selected) return;
        try {
            const updated = store.updateLesson(courseId, levelId, selected, previous => ({ ...previous, resources: transform(previous.resources || []) }), snapshot);
            snapshot = JSON.stringify(updated); renderSources(updated); renderList(); say(text);
            // Keep unsaved lesson text in its editor; source operations touch resources only.
        } catch (error) { say(`${error.message} Existing records have not been replaced.`, true); }
    }
    form.addEventListener("input", () => { document.getElementById("lesson-dirty-note").textContent = "Unsaved lesson changes. Save the lesson before leaving this page."; });
    form.addEventListener("submit", event => {
        event.preventDefault(); if (!form.reportValidity()) return;
        const values = Object.fromEntries(Object.keys(fields).map(key => [key, key === "minutes" ? Number(input(key).value) : input(key).value.trim()]));
        if (!values.title || (!values.content && !values.builtInLessonId)) { say("Enter a lesson title and platform content, or link an existing Python demo lesson.", true); return; }
        const lessonId = selected || `lesson-${crypto.randomUUID()}`;
        try {
            const updated = store.updateLesson(courseId, levelId, lessonId, previous => ({ ...previous, ...values, id: lessonId, resources: previous?.resources || [], updatedAt: new Date().toISOString() }), snapshot);
            renderList(); selectLesson(updated); say("Lesson saved locally. No content was published to a server.");
        } catch (error) { say(`${error.message} Existing records have not been replaced.`, true); }
    });
    sourceForm.addEventListener("submit", event => {
        event.preventDefault(); if (!selected || !sourceForm.reportValidity()) return;
        const title = document.getElementById("source-title").value.trim();
        const url = document.getElementById("source-url").value.trim();
        if (!title || !store.externalUrl(url)) { say("Enter a source title and a complete HTTP or HTTPS URL without embedded login credentials.", true); return; }
        const sourceIndex = editingSource;
        changeSources(resources => {
            const source = { ...(sourceIndex === null ? {} : resources[sourceIndex]), title, url };
            source.id ||= `source-${crypto.randomUUID()}`;
            return sourceIndex === null ? [...resources, source] : resources.map((value, index) => index === sourceIndex ? source : value);
        }, "Learning sources saved. The rest of the lesson was kept.");
    });
    document.getElementById("cancel-source").addEventListener("click", resetSource);
    document.getElementById("new-lesson").addEventListener("click", () => { selectLesson(null); input("title").focus(); });
    try {
        const current = renderList();
        const back = document.getElementById("level-content-back"); back.href = `../admin/admin-course-content.html?id=${encodeURIComponent(courseId)}`;
        if ((current.course.language || current.course.languageId) === "python") {
            (window.pythonLessons || []).forEach(lesson => { const option = node("option", lesson.title); option.value = lesson.id; input("builtInLessonId").append(option); });
        } else input("builtInLessonId").closest(".form-field").hidden = true;
        selectLesson(null); view.hidden = false;
    } catch (error) { say(`Level content could not be loaded. ${error.message} Existing data was not changed.`, true); form.querySelector("fieldset").disabled = true; sourceFields.disabled = true; }
})();
