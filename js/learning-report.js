(() => {
    "use strict";
    const report = document.getElementById("learning-report");
    const status = document.getElementById("report-message");
    const print = document.getElementById("print-report");
    const labels = window.languageCatalog.labels;
    const lessons = { variables: "Variables and values", "data-types": "Data types", "input-output": "Input and output", numbers: "Working with numbers" };
    const tasks = { "student-profile": "Create a student profile", receipt: "Build a simple receipt" };
    const object = value => value && typeof value === "object" && !Array.isArray(value);
    function read(key) {
        const raw = sessionStorage.getItem(key);
        return raw === null ? null : JSON.parse(raw);
    }
    function add(tag, value, parent = report) { const node = document.createElement(tag); node.textContent = value; parent.append(node); return node; }
    function list(title, values, empty) {
        add("h2", title);
        if (!values.length) { add("p", empty); return; }
        const ul = add("ul", ""); values.forEach(value => add("li", value, ul));
    }
    function load() {
        report.hidden = true; print.disabled = true; report.replaceChildren(); status.textContent = ""; status.classList.remove("is-error");
        try {
            const session = read("codementor-demo-session");
            if (!object(session) || session.role !== "student" || session.isDemo !== true || typeof session.name !== "string" || !session.name.trim()) {
                status.textContent = "Sign in to a student demo account to view your learning report."; return;
            }
            const preferences = read("codementor-demo-onboarding");
            if (preferences !== null && (!object(preferences) || !Object.hasOwn(labels, preferences.language))) throw new Error("Invalid preferences");
            const learning = read("codementor-demo-learning");
            if (learning !== null && (!object(learning) || learning.version !== 1 || !Array.isArray(learning.lessons) || !learning.lessons.every(value => typeof value === "string") || !Array.isArray(learning.tasks) || !learning.tasks.every(value => typeof value === "string") || !object(learning.assessments))) throw new Error("Invalid learning data");
            if (learning && !Object.values(learning.assessments).every(value => object(value) && typeof value.score === "number" && Number.isFinite(value.score) && value.score >= 0 && value.score <= 100)) throw new Error("Invalid assessment data");
            add("p", "CODEMENTOR AI · FRONTEND DEMO", report).className = "eyebrow";
            add("h1", "Learning Report"); add("p", `Student: ${session.name.trim()}`);
            add("p", `Selected path: ${preferences ? labels[preferences.language] : "Not selected"}`);
            add("p", `Prepared: ${new Date().toLocaleString("en-GB")}`);
            add("p", "This report contains browser-tab demo records, which may be manually changed and are not verified achievements. It is not an official certificate.").className = "services-notice";
            add("p", "Learning records currently use the Python demo's shared storage. They are not linked to a verified account or a per-language course history.");
            const done = learning ? Object.keys(lessons).filter(id => learning.lessons.includes(id)) : [];
            const passed = learning ? Object.keys(tasks).filter(id => learning.tasks.includes(id)) : [];
            add("h2", "Available progress");
            if (!learning) add("p", "No learning progress has been saved in this tab.");
            else {
                add("p", `Python Level 01 lessons recorded: ${done.length} of ${Object.keys(lessons).length}. Tasks recorded as passed: ${passed.length} of ${Object.keys(tasks).length}. These counts do not represent overall path completion.`);
                list("Recorded lessons", done.map(id => lessons[id]), "No completed lessons recorded.");
                list("Recorded tasks", passed.map(id => tasks[id]), "No passed tasks recorded.");
                const known = ["1", "2", "3"];
                list("Saved assessment results", known.filter(id => Object.hasOwn(learning.assessments, id)).map(id => `Level ${id}: ${learning.assessments[id].score}% (saved demo result)`), "No assessment scores recorded.");
                const unknown = learning.lessons.filter(id => !Object.hasOwn(lessons, id)).length + learning.tasks.filter(id => !Object.hasOwn(tasks, id)).length;
                if (unknown) add("p", `${unknown} unrecognised activity records were excluded from this summary. Saved data was not changed.`);
            }
            list("Skills and topics studied", done.map(id => `${lessons[id]} — based on a recorded Python lesson, not verified proficiency`), "No completed lesson evidence is available to summarise skills.");
            add("h2", "Projects");
            add("p", "No submitted project records are available. The current project page selects files locally and does not save a submission or evaluation. Public showcase examples and freelance drafts are not learning achievements.");
            add("h2", "Report scope");
            add("p", "Source: demo identity, selected learning path and saved learning activities in this tab. Age, email, password and private requests are excluded. No certificates or unsaved project achievements are inferred.");
            report.hidden = false; print.disabled = false;
        } catch {
            report.replaceChildren();
            status.textContent = "Your saved report data could not be read. No records were deleted or replaced. Check your profile and progress before trying again.";
            status.classList.add("is-error");
        }
    }
    print.addEventListener("click", () => { if (!print.disabled) window.print(); });
    window.addEventListener("pageshow", load);
})();

