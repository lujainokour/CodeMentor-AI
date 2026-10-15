(() => {
    "use strict";
    const catalog = window.languageCatalog, store = window.studentServicesStore;
    const lessonData = window.pythonLessons;
    const tasks = [{ id: "student-profile", title: "Create a student profile" }, { id: "receipt", title: "Build a simple receipt" }];
    const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
    const byId = id => document.getElementById(id);
    function node(tag, text, cls) { const result = document.createElement(tag); if (text !== undefined) result.textContent = text; if (cls) result.className = cls; return result; }
    function read(key) { const raw = sessionStorage.getItem(key); return raw === null ? null : JSON.parse(raw); }
    function action(title, description, label, href) {
        byId("next-title").textContent = title; byId("next-description").textContent = description;
        const link = node("a", label, "button button-primary"); link.href = href; byId("next-actions").replaceChildren(link);
    }
    function render() {
        const issues = [];
        let account = null, language = null, preferenceError = false, learning = null, learningError = false;
        try { account = store.session(); } catch { issues.push("Sign in with a valid student demo session to view private activity counts. Existing identity data was not changed."); }
        byId("dashboard-greeting").textContent = account ? `Welcome back, ${account.name.trim().split(/\s+/u)[0]}.` : "Your demo workspace.";
        try {
            const preferences = read("codementor-demo-onboarding");
            if (preferences !== null) {
                if (!object(preferences) || !catalog.has(preferences.language) || !["beginner", "basics", "practising"].includes(preferences.experience) || !["foundations", "problem-solving", "projects"].includes(preferences.goal)) throw new Error("Invalid preferences");
                language = catalog.get(preferences.language);
            }
            byId("selected-language").textContent = language?.name || "Not selected";
        } catch { preferenceError = true; byId("selected-language").textContent = "Unavailable"; issues.push("Saved learning preferences could not be read. They were not replaced."); }
        try {
            learning = read("codementor-demo-learning");
            if (learning !== null && (!object(learning) || learning.version !== 1 || !Array.isArray(learning.lessons) || !learning.lessons.every(value => typeof value === "string") || !Array.isArray(learning.tasks) || !learning.tasks.every(value => typeof value === "string") || !object(learning.assessments) || !Object.values(learning.assessments).every(value => object(value) && typeof value.score === "number" && Number.isFinite(value.score) && value.score >= 0 && value.score <= 100))) throw new Error("Invalid learning records");
        } catch { learningError = true; issues.push("Shared learning records could not be read. No progress was deleted or replaced."); }
        const done = !learningError && learning ? lessonData.filter(lesson => learning.lessons.includes(lesson.id)) : [];
        const passed = !learningError && learning ? tasks.filter(task => learning.tasks.includes(task.id)) : [];
        const assessment = !learningError ? learning?.assessments["1"] : null;
        byId("recorded-lessons").textContent = learningError ? "Unavailable" : `${done.length} / ${lessonData.length}`;
        byId("recorded-tasks").textContent = learningError ? "Task records unavailable." : `Tasks recorded: ${passed.length} / ${tasks.length}. ${learning ? "Shared tab records only." : "No learning record saved yet."}`;
        if (learning && !learningError) {
            const unknown = learning.lessons.filter(id => !lessonData.some(lesson => lesson.id === id)).length + learning.tasks.filter(id => !tasks.some(task => task.id === id)).length;
            if (unknown) issues.push("Unrecognised learning activities were excluded from these counts; saved records were kept.");
        }
        let placementState = "missing";
        const snapshot = byId("skill-snapshot"); snapshot.replaceChildren();
        const placementLink = byId("placement-link");
        if (preferenceError || !language || !language.builtInContent) {
            byId("placement-score").textContent = preferenceError ? "Unavailable" : !language ? "Choose a language" : "Content not available";
            snapshot.append(node("p", language ? `The ${language.name} full path and placement are coming soon. Stored Python results, if any, are separate shared tab history.` : "Choose valid learning preferences to see matching placement options."));
            placementLink.href = preferenceError ? "../student/profile.html" : language ? `../public/languages.html?language=${language.id}` : "../student/onboarding.html";
            placementLink.textContent = preferenceError ? "Review preferences" : language ? "View content availability" : "Choose learning preferences";
        } else {
            placementLink.href = "../student/placement-intro.html"; placementLink.textContent = "Start Python placement";
            try {
                const attempt = read("codementor-demo-placement"), questions = window.placementQuestions;
                if (attempt !== null) {
                    if (!object(attempt) || attempt.version !== 1 || !["in-progress", "submitted"].includes(attempt.status) || !Array.isArray(attempt.answers) || attempt.answers.length !== questions.length || !attempt.answers.every((answer, index) => (answer === null && attempt.status === "in-progress") || answer === "unsure" || (Number.isInteger(answer) && answer >= 0 && answer < questions[index].options.length)) || (attempt.status === "in-progress" && (!Number.isInteger(attempt.currentQuestion) || attempt.currentQuestion < 0 || attempt.currentQuestion >= questions.length))) throw new Error("Invalid placement");
                    placementState = attempt.status;
                    if (placementState === "in-progress") {
                        const answered = attempt.answers.filter(value => value !== null).length;
                        byId("placement-score").textContent = `${answered} / ${questions.length} answered`;
                        snapshot.append(node("p", "A shared Python placement attempt is in progress.")); placementLink.textContent = "Resume Python placement";
                    } else {
                        const correct = attempt.answers.filter((answer, index) => answer === questions[index].correct).length;
                        byId("placement-score").textContent = `${correct} / ${questions.length} correct`;
                        const topics = new Map();
                        questions.forEach((question, index) => { const value = topics.get(question.topic) || { correct: 0, total: 0 }; value.total++; if (attempt.answers[index] === question.correct) value.correct++; topics.set(question.topic, value); });
                        topics.forEach((value, topic) => snapshot.append(node("p", `${topic}: ${value.correct} / ${value.total}`)));
                        placementLink.href = "../student/placement-results.html"; placementLink.textContent = "View shared placement result";
                    }
                } else { byId("placement-score").textContent = "No saved attempt"; snapshot.append(node("p", "No Python placement attempt has been saved in this tab.")); }
            } catch {
                placementState = "unavailable"; byId("placement-score").textContent = "Unavailable";
                snapshot.append(node("p", "Saved placement evidence could not be read. Existing answers were kept.")); placementLink.textContent = "Review placement storage issue";
                issues.push("Shared placement data is unavailable; no result was inferred.");
            }
        }
        const levels = byId("dashboard-levels"); levels.replaceChildren();
        const pathLink = byId("path-link"); pathLink.href = language ? `../public/languages.html?language=${language.id}` : "../public/languages.html"; pathLink.textContent = "Browse matching content";
        if (!language || !language.builtInContent) levels.append(node("li", preferenceError ? "Saved path unavailable." : language ? `${language.name}: full path coming soon.` : "No learning language selected."));
        else {
            const levelDone = done.length === lessonData.length && passed.length === tasks.length && assessment?.score >= 70;
            levels.append(node("li", `Python Level 01 — ${learningError ? "records unavailable" : levelDone ? "recorded prerequisites and pass mark met (demo only)" : learning ? "recorded activities available" : "no activities recorded"}`));
            if (assessment) levels.append(node("li", `Level 01 quiz: ${assessment.score}% (saved local result, not verified).`));
            levels.append(node("li", "Later levels and final project path: content not available."));
            pathLink.href = "../student/learning-path.html"; pathLink.textContent = "Review Python demo roadmap";
        }
        if (preferenceError) action("Preferences unavailable", "Your saved preferences could not be read. No Python path was selected automatically.", "Review profile settings", "../student/profile.html");
        else if (!language) action("Choose a learning language", "Select your preferences before starting a language-specific activity.", "Choose preferences", "../student/onboarding.html");
        else if (!language.builtInContent) action(`${language.name}: coming soon`, "The full learning path is not available. Browse any locally authored lessons separately.", "Browse language catalogue", `../public/languages.html?language=${language.id}`);
        else if (learningError) action("Learning records unavailable", "Saved progress could not be read. No starting state was inferred and no records were replaced.", "Review shared progress", "../student/progress.html");
        else if (placementState === "in-progress") action("Resume Python placement", "Continue the shared placement attempt saved in this tab.", "Resume placement", "../student/placement-intro.html");
        else if (!done.length && !passed.length && !assessment && placementState !== "submitted") action(placementState === "unavailable" ? "Placement evidence unavailable" : "Find your starting point", "Placement is a local Python demo. Existing tab history is not a verified account record.", placementState === "unavailable" ? "Review placement issue" : "Open Python placement", "../student/placement-intro.html");
        else {
            const nextLesson = lessonData.find(lesson => !done.some(value => value.id === lesson.id));
            const nextTask = tasks.find(task => !passed.some(value => value.id === task.id));
            if (nextLesson) action(`Continue with ${nextLesson.title}`, "This suggestion uses shared Python tab records, not account-owned achievements.", "Open next recorded lesson", `../student/lesson.html?lesson=${encodeURIComponent(nextLesson.id)}`);
            else if (nextTask) action(`Practise: ${nextTask.title}`, "Save and review your code locally. Required task tests are not connected, so this action cannot award a pass.", "Open practice task", `../student/workspace.html?task=${nextTask.id}`);
            else if (!assessment || assessment.score < 70) action("Python Level 01 quiz", "Existing shared records contain the required lessons and task passes. The quiz rechecks those records; the dashboard never creates them.", "Review local assessment", "../student/level-assessment.html?level=1");
            else action("Review the recorded Python result", "The shared Level 01 records meet the demo pass mark. Later level content remains unavailable.", "Review shared progress", "../student/progress.html");
        }
        ["booking", "request", "draft"].forEach(type => {
            const count = byId(`${type}-count`);
            if (!account) { count.textContent = "Sign in"; return; }
            try { count.textContent = String(store.ownRecords(type, account.email).length); }
            catch { count.textContent = "Unavailable"; issues.push(`Your ${type} records could not be read. They were not deleted or replaced.`); }
        });
        byId("dashboard-message").textContent = issues.join(" "); byId("dashboard-message").classList.toggle("is-error", issues.length > 0);
    }
    render(); window.addEventListener("pageshow", render);
})();
