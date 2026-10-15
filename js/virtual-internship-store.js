/* Independent, owner-scoped simulation. No changes to learning or public fixtures. */
(() => {
    "use strict";
    const key = "codementor-demo-virtual-internship";
    const projectId = "school-manager-csharp";
    const tasks = [
        { id: "plan", title: "Plan the school model", detail: "List Student, Teacher, ClassGroup and Enrollment fields, unique IDs and validation rules. Sketch the console menus." },
        { id: "students", title: "Manage students and teachers", detail: "Implement create, list, update and delete for students and teachers. Reject empty names and duplicate IDs; handle missing records." },
        { id: "classes", title: "Manage classes and enrollments", detail: "Assign a teacher to a class, enroll students and list a class roster. Prevent duplicate enrollment and define safe deletion behavior." },
        { id: "storage", title: "Persist data locally in your C# app", detail: "Save and load JSON using System.Text.Json. Handle a missing file and report invalid data without silently overwriting it. Use fictional school data only." },
        { id: "verify", title: "Check requirements and document delivery", detail: "Manually test valid and invalid input, duplicate IDs, enrollment rules and restart persistence. Add README setup steps, sample data and known limitations." }
    ];
    const states = ["To Do", "In Progress", "Done"];
    const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
    function githubUrl(value) {
        if (typeof value !== "string" || value.length > 500) return null;
        try {
            const url = new URL(value.trim());
            if (url.protocol !== "https:" || !["github.com", "www.github.com"].includes(url.hostname) || url.username || url.password || url.port || url.search || url.hash) return null;
            const parts = url.pathname.replace(/\/$/, "").split("/").slice(1);
            if (parts.length !== 2 || !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(parts[0]) || !/^[a-zA-Z0-9_.-]{1,100}$/.test(parts[1]) || [".", ".."].includes(parts[1])) return null;
            return `https://github.com/${parts.join("/")}`;
        } catch { return null; }
    }
    const date = value => typeof value === "string" && Number.isFinite(Date.parse(value));
    function valid(record) {
        return object(record) && typeof record.owner === "string" && record.owner.trim() && record.owner.length <= 254 && record.projectId === projectId &&
            date(record.createdAt) && date(record.updatedAt) && object(record.tasks) && tasks.every(task => states.includes(record.tasks[task.id])) &&
            typeof record.showInPortfolio === "boolean" &&
            (record.submission === null || (object(record.submission) && githubUrl(record.submission.url) && typeof record.submission.notes === "string" && record.submission.notes.length <= 3000 && date(record.submission.savedAt))) &&
            (!record.showInPortfolio || record.submission !== null);
    }
    function read() {
        let data;
        try {
            const raw = sessionStorage.getItem(key);
            data = raw === null ? { version: 1, records: [] } : JSON.parse(raw);
        } catch { throw new Error("Internship storage could not be read. Existing data has not been changed."); }
        if (!object(data) || data.version !== 1 || !Array.isArray(data.records) || !data.records.every(valid) || new Set(data.records.map(record => record.owner)).size !== data.records.length) {
            throw new Error("Saved internship records are invalid. Existing data has not been changed.");
        }
        return data;
    }
    function session(expectedOwner) {
        const account = window.studentServicesStore.session();
        if (expectedOwner !== undefined && expectedOwner !== account.email) throw new Error("Your demo account changed. Reload before continuing.");
        return account;
    }
    function own(expectedOwner) {
        const owner = session(expectedOwner).email;
        return read().records.find(record => record.owner === owner) || null;
    }
    function update(owner, expected, patch) {
        session(owner);
        const data = read(), previous = data.records.find(record => record.owner === owner) || null;
        if (JSON.stringify(previous) !== expected) throw new Error("This internship changed after the page opened. Reload before saving. Your records were kept.");
        const now = new Date().toISOString();
        const initial = previous || { owner, projectId, createdAt: now, tasks: Object.fromEntries(tasks.map(task => [task.id, "To Do"])), submission: null, showInPortfolio: false };
        const next = { ...initial, ...patch, owner, projectId, updatedAt: now };
        if (!valid(next)) throw new Error("Check the internship values. Nothing was saved.");
        sessionStorage.setItem(key, JSON.stringify({ ...data, records: previous ? data.records.map(record => record.owner === owner ? next : record) : [...data.records, next] }));
        return next;
    }
    window.virtualInternshipStore = Object.freeze({ tasks, states, githubUrl, own, update, session });
})();
