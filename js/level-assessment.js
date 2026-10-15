(() => {
    if (window.learningUnavailable) return;
    const form = document.getElementById("level-assessment-form"), result = document.getElementById("assessment-result"), notice = document.getElementById("assessment-message");
    const questions = window.pythonLessons, key = "codementor-demo-learning", requiredTasks = ["student-profile", "receipt"];
    const object = value => value && typeof value === "object" && !Array.isArray(value);
    const node = (tag, text, cls) => { const element = document.createElement(tag); if (text) element.textContent = text; if (cls) element.className = cls; return element; };
    function read() {
        const raw = sessionStorage.getItem(key);
        const value = raw === null ? { version: 1, lessons: [], tasks: [], assessments: {} } : JSON.parse(raw);
        if (!object(value) || value.version !== 1 || !Array.isArray(value.lessons) || !value.lessons.every(item => typeof item === "string") || !Array.isArray(value.tasks) || !value.tasks.every(item => typeof item === "string") || !object(value.assessments) || !Object.values(value.assessments).every(item => object(item) && typeof item.score === "number" && Number.isFinite(item.score) && item.score >= 0 && item.score <= 100)) throw new Error("Saved progress could not be read. Existing records have not been changed.");
        return value;
    }
    function unlocked(progress) { return questions.every(question => progress.lessons.includes(question.id)) && requiredTasks.every(task => progress.tasks.includes(task)); }
    function showResult(score) { result.textContent = `Saved local demo result: ${score}% · ${score >= 70 ? "Pass mark reached" : "Below the 70% pass mark"}. This is a browser quiz result, not server-verified assessment or code evaluation.`; }
    function prepare() {
        form.hidden = true;
        try {
            const level = new URLSearchParams(location.search).get("level") || "1";
            if (level !== "1") { notice.textContent = "Content not available. Only the Python Level 01 demo quiz has prepared questions."; return; }
            const progress = read();
            if (!unlocked(progress)) { notice.textContent = "Assessment locked. Complete the four Python Level 01 lessons and both required tasks first. Code execution and required task testing are not connected in this frontend demo; this page cannot award task passes."; return; }
            notice.textContent = "Prepared Python demo questions. Answers are checked locally only. No code is executed and no official result or certificate is issued.";
            if (progress.assessments["1"]) showResult(progress.assessments["1"].score);
            form.replaceChildren();
            questions.forEach((question, index) => {
                const fieldset = node("fieldset", "", "question-options"); fieldset.append(node("legend", `${index + 1}. ${question.question}`));
                const example = node("pre", "", "question-code"); example.append(node("code", question.code)); fieldset.append(example);
                question.options.forEach((answer, position) => {
                    const label = node("label", "", "answer-option"), input = node("input"); input.type = "radio"; input.name = `question-${index}`; input.value = position; input.required = true;
                    label.append(input, node("span", answer)); fieldset.append(label);
                }); form.append(fieldset);
            });
            const submit = node("button", "Save local demo result", "button button-primary"); submit.type = "submit"; form.append(submit); form.hidden = false;
        } catch (error) { notice.textContent = error.message; notice.classList.add("is-error"); }
    }
    form.addEventListener("submit", event => {
        event.preventDefault(); if (!form.reportValidity()) return;
        try {
            const progress = read(); if (!unlocked(progress)) throw new Error("Required activity records changed. The assessment remains locked.");
            const answers = questions.map((question, index) => Number(new FormData(form).get(`question-${index}`)));
            const score = Math.round(answers.filter((answer, index) => answer === questions[index].correct).length / questions.length * 100);
            const previous = progress.assessments["1"] || {};
            const updated = { ...progress, assessments: { ...progress.assessments, "1": { ...previous, score, answers, kind: "local-quiz-demo", submittedAt: new Date().toISOString() } } };
            sessionStorage.setItem(key, JSON.stringify(updated)); showResult(score); notice.textContent = "Local quiz result saved. Existing lesson, task and unrelated assessment records were kept.";
        } catch (error) { notice.textContent = `${error.message} Nothing was overwritten.`; notice.classList.add("is-error"); }
    });
    prepare();
})();
