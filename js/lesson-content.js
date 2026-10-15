/* Add saved sources to original lessons, or render a namespaced local lesson preview. */
(() => {
    if (window.learningUnavailable) return;
    const params = new URLSearchParams(location.search);
    const courseId = params.get("course"), levelId = params.get("level"), lessonId = params.get("lesson");
    const store = window.courseContentStore;
    const message = document.getElementById("workspace-message");
    function node(tag, text) { const element = document.createElement(tag); element.textContent = text; return element; }
    function sourceKey(value) {
        const url = new URL(value);
        // YouTube share/watch/embed forms identify the same video; ignore tracking.
        const host = url.hostname.toLowerCase().replace(/^www\./, "");
        if (["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) {
            const id = host === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") || (url.pathname.startsWith("/embed/") ? url.pathname.slice(7) : null);
            if (id) return `youtube:${id}`;
        }
        ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(key => url.searchParams.delete(key));
        return url.href;
    }
    function sources(resources, builtInId) {
        const host = document.getElementById("lesson-external-sources"); host.replaceChildren();
        const merged = new Map();
        (window.pythonLessonSources?.[builtInId] || []).forEach(resource => {
            if (store.externalUrl(resource.url)) merged.set(sourceKey(resource.url), { ...resource, origin: "Core reference" });
        });
        resources.forEach(resource => {
            if (!store.externalUrl(resource.url)) return;
            const key = sourceKey(resource.url), core = merged.get(key);
            // Display local titles/URLs without rewriting either source record.
            merged.set(key, { ...core, ...resource, origin: core?.origin?.includes("Core") ? "Core reference + local admin source" : "Local admin source" });
        });
        if (!merged.size) { host.append(node("p", "No external learning sources have been added to this lesson.")); return; }
        const list = document.createElement("ul"); list.className = "content-source-list";
        merged.forEach(resource => {
            const item = document.createElement("li"); const a = node("a", `${resource.title} ↗`);
            a.href = resource.url; a.target = "_blank"; a.rel = "noopener noreferrer";
            a.setAttribute("aria-label", `${resource.title} (external source, opens in a new tab)`); item.append(a);
            item.append(node("p", `${resource.type || "External resource"} | ${resource.language || "Language not specified"} | ${resource.origin}`));
            list.append(item);
        }); host.append(list);
    }
    function fail(text) { message.textContent = text; message.classList.add("is-error"); }
    if (!courseId && !levelId) {
        const originalId = lessonId || "variables";
        sources([], originalId);
        try {
            const data = store.readContent(); const courses = store.readCourses(); const resources = [];
            courses.filter(course => (course.language || course.languageId) === "python").forEach(course => {
                const levels = Object.hasOwn(data.courses, course.id) ? data.courses[course.id].levels : [];
                levels.forEach(level => (level.lessons || []).filter(lesson => lesson.builtInLessonId === (lessonId || "variables") && lesson.status === "published").forEach(lesson => resources.push(...(lesson.resources || []))));
            }); sources(resources, originalId);
        } catch { fail("Saved external sources could not be read. The original lesson remains available and saved data was not changed."); }
        return;
    }
    window.savedLessonMode = true;
    const complete = document.getElementById("complete-lesson"); complete.disabled = true;
    document.getElementById("knowledge-form").closest("section").hidden = true;
    document.getElementById("lesson-mentor-link").closest("section").hidden = true;
    const back = document.querySelector(".module-back"); back.href = `../public/course.html?id=${encodeURIComponent(courseId || "")}`; back.textContent = "← Back to local course";
    try {
        const current = store.context(courseId, levelId);
        const lesson = current.lessons.find(value => value.id === lessonId);
        if (!lesson || (lesson.status !== "published" && params.get("preview") !== "1")) throw new Error("This lesson is a draft or could not be found.");
        const builtin = (current.course.language || current.course.languageId) === "python" ? window.pythonLessons.find(value => value.id === lesson.builtInLessonId) : null;
        document.getElementById("lesson-title").textContent = lesson.title;
        document.title = `${lesson.title} | CodeMentor AI`;
        document.getElementById("lesson-intro").textContent = lesson.summary || builtin?.intro || "Local lesson content.";
        document.getElementById("lesson-position").textContent = `${current.course.title} / ${current.level.title} · ${lesson.minutes || 10} MINUTES`;
        document.getElementById("concept-title").textContent = "Platform lesson content";
        const explanation = document.getElementById("lesson-explanation"); explanation.replaceChildren();
        (lesson.content ? lesson.content.split(/\n\s*\n/) : builtin?.paragraphs || ["No platform explanation has been added."]).forEach(text => explanation.append(node("p", text)));
        document.getElementById("lesson-code").textContent = lesson.code || builtin?.code || "No code example added.";
        document.getElementById("lesson-output").textContent = lesson.output || builtin?.output || "No prepared output added.";
        sources(lesson.resources || [], builtin?.id);
        const nav = document.getElementById("lesson-navigation"); nav.replaceChildren();
        current.lessons.filter(value => value.status === "published" || params.get("preview") === "1").forEach(value => {
            const a = node("a", value.title); a.href = `../student/lesson.html?course=${encodeURIComponent(courseId)}&level=${encodeURIComponent(levelId)}&lesson=${encodeURIComponent(value.id)}${params.get("preview") === "1" ? "&preview=1" : ""}`;
            if (value.id === lessonId) a.setAttribute("aria-current", "page"); nav.append(a);
        });
        const next = document.getElementById("next-activity"); next.href = back.href; next.textContent = "Back to local course";
        document.getElementById("completion-status").textContent = "Local content preview. Completion is not included in the Python demo's assessed progress.";
        complete.hidden = true;
        if (params.get("preview") === "1") fail("Admin preview of locally saved content. Drafts are not published to students or a server.");
    } catch (error) {
        document.getElementById("lesson-title").textContent = "Lesson content not available";
        document.getElementById("lesson-intro").textContent = "Return to the course to choose an available lesson.";
        document.getElementById("next-activity").hidden = true;
        fail(`${error.message} Saved records have not been changed.`);
    }
})();
