/* Version-1 content contract. Reads never migrate, reset or repair stored records. */
(() => {
    "use strict";
    const contentKey = "codementor-demo-admin-course-content";
    const draftsKey = "codementor-demo-admin-course-drafts";
    const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
    const text = value => typeof value === "string" && value.trim().length > 0;
    function externalUrl(value) {
        if (typeof value !== "string" || !/^https?:\/\//i.test(value.trim())) return false;
        try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password; } catch { return false; }
    }
    function validResource(value) { return object(value) && text(value.title) && value.title.length <= 120 && externalUrl(value.url) && value.url.length <= 2000 && (value.id === undefined || text(value.id)); }
    function validLesson(value) {
        return object(value) && text(value.id) && text(value.title) &&
            ["summary", "content", "code", "output", "builtInLessonId"].every(key => value[key] === undefined || typeof value[key] === "string") &&
            (value.minutes === undefined || (Number.isInteger(value.minutes) && value.minutes >= 1 && value.minutes <= 600)) &&
            (value.status === undefined || ["draft", "published"].includes(value.status)) &&
            (value.resources === undefined || (Array.isArray(value.resources) && value.resources.every(validResource)));
    }
    function readContent() {
        const raw = sessionStorage.getItem(contentKey);
        if (raw === null) return { version: 1, courses: {} };
        const data = JSON.parse(raw);
        if (!object(data) || data.version !== 1 || !object(data.courses) || !Object.values(data.courses).every(course =>
            object(course) && Array.isArray(course.levels) && course.levels.every(level =>
                object(level) && text(level.id) && text(level.title) &&
                (level.lessons === undefined || (Array.isArray(level.lessons) && level.lessons.every(validLesson) && new Set(level.lessons.map(lesson => lesson.id)).size === level.lessons.length))
            ) && new Set(course.levels.map(level => level.id)).size === course.levels.length
        )) throw new Error("Saved course content is invalid. Existing data has not been changed.");
        return data;
    }
    function readCourses() {
        const raw = sessionStorage.getItem(draftsKey);
        const data = raw === null ? { version: 1, courses: [] } : JSON.parse(raw);
        if (!object(data) || data.version !== 1 || !Array.isArray(data.courses) || !data.courses.every(course =>
            object(course) && text(course.id) && text(course.title) && typeof course.description === "string" && text(course.language) &&
            (!window.languageCatalog || window.languageCatalog.has(course.language)) && course.status === "draft"
        ) || new Set(data.courses.map(course => course.id)).size !== data.courses.length) throw new Error("Saved courses are invalid. Existing data has not been changed.");
        return [...data.courses, ...(window.adminCourseData || []).filter(course => !data.courses.some(draft => draft.id === course.id))];
    }
    function context(courseId, levelId, data = readContent()) {
        const course = readCourses().find(value => value.id === courseId);
        const level = Object.hasOwn(data.courses, courseId) ? data.courses[courseId].levels.find(value => value.id === levelId) : null;
        if (!course || !level) throw new Error("Course or level not found. Return to the course list.");
        return { course, level, lessons: level.lessons || [] };
    }
    function updateLesson(courseId, levelId, lessonId, transform, expected) {
        const data = readContent();
        const current = context(courseId, levelId, data);
        const previous = current.lessons.find(lesson => lesson.id === lessonId);
        if (expected !== undefined && JSON.stringify(previous) !== expected) throw new Error("This lesson changed after the editor opened. Reload before saving.");
        const next = transform(previous);
        if (!validLesson(next)) throw new Error("Check the lesson and source fields. Nothing was saved.");
        if (!previous && current.lessons.some(lesson => lesson.title.trim().toLowerCase() === next.title.trim().toLowerCase())) throw new Error("A lesson with this title already exists in the level.");
        const lessons = previous ? current.lessons.map(lesson => lesson.id === lessonId ? next : lesson) : [...current.lessons, next];
        const levels = data.courses[courseId].levels.map(level => level.id === levelId ? { ...level, lessons } : level);
        const updated = { ...data, courses: { ...data.courses, [courseId]: { ...data.courses[courseId], levels } } };
        sessionStorage.setItem(contentKey, JSON.stringify(updated));
        return next;
    }
    window.courseContentStore = Object.freeze({ readContent, readCourses, context, updateLesson, externalUrl, validResource });
})();
