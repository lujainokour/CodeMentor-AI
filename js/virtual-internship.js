(() => {
    "use strict";
    const store = window.virtualInternshipStore, root = document.getElementById("internship-content"), message = document.getElementById("internship-message");
    const portfolio = document.body.dataset.internshipView === "portfolio";
    let owner, snapshot;
    function el(tag, text, cls) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (cls) node.className = cls; return node; }
    function link(text, href) { const a = el("a", text); a.href = href; return a; }
    function status(text, error = false) { message.textContent = text; message.classList.toggle("is-error", error); }
    function external(url) { const a = link(url, url); a.target = "_blank"; a.rel = "noopener noreferrer"; a.setAttribute("aria-label", "Open saved GitHub link in a new tab (repository not verified)"); return a; }
    function time(parent, label, value) { const p = el("p", `${label}: `), date = el("time", new Date(value).toLocaleString()); date.dateTime = value; p.append(date); parent.append(p); }
    function save(patch) {
        try { store.update(owner, snapshot, patch); render(); status("Saved in this tab for your demo account only. Nothing was sent, checked or published."); }
        catch (error) {
            try { store.session(owner); } catch { root.replaceChildren(el("p", "Your session is unavailable or changed. Reload before continuing.")); }
            status(error.message || "Saving failed. Your previous records were kept.", true);
        }
    }
    function render() {
        root.replaceChildren(); status("");
        try {
            owner = store.session().email;
            const record = store.own(owner); snapshot = JSON.stringify(record);
            if (portfolio) {
                if (!record?.showInPortfolio) { root.append(el("p", "No projects included in your local portfolio yet. Save a solution and explicitly choose to include it from the internship page.", "services-panel")); return; }
                const card = el("article", undefined, "services-panel"); card.id = "internship-portfolio-card";
                card.append(el("h2", "Virtual internship project — Self-reported"), el("h3", "School Management System in C#"), el("p", "Cedar School Systems (fictional brief). Private local display; not verified, graded or publicly published."), external(record.submission.url));
                const notes = el("p", record.submission.notes || "No student notes added.", "internship-notes"); card.append(notes); time(card, "Solution link last saved", record.submission.savedAt);
                card.append(link("Update solution or remove from this portfolio", "../student/virtual-internship.html#submission")); root.append(card); return;
            }
            root.append(el("p", record ? "Your saved local internship is loaded. Task labels are self-reported, not checked." : "No internship record saved yet. Start by saving a task status or your solution link. Nothing is sent to the fictional company.", "services-notice"));
            if (record) { time(root, "Record created", record.createdAt); time(root, "Last local change", record.updatedAt); }
            const board = el("section", undefined, "services-panel"); board.append(el("h2", "Task board"), el("p", "Move tasks between To Do, In Progress and Done, then save. Done is your own label; it does not pass a learning task or unlock an assessment."));
            const boardForm = el("form"); boardForm.id = "internship-tasks";
            const columns = el("div", undefined, "internship-board"), selects = {};
            store.states.forEach(state => {
                const column = el("section", undefined, "services-card"); column.append(el("h3", state));
                const inColumn = store.tasks.filter(task => (record?.tasks[task.id] || "To Do") === state);
                if (!inColumn.length) column.append(el("p", "No tasks in this column."));
                inColumn.forEach(task => {
                    const card = el("div", undefined, "internship-task"); card.append(el("h4", task.title), el("p", task.detail));
                    const label = el("label", `Status: ${task.title}`), select = el("select"); select.id = `task-${task.id}`; label.htmlFor = select.id;
                    store.states.forEach(value => { const option = el("option", value); option.value = value; select.append(option); }); select.value = state; selects[task.id] = select;
                    card.append(label, select); column.append(card);
                }); columns.append(column);
            });
            const taskButton = el("button", "Save task statuses", "button button-primary"); taskButton.type = "submit"; boardForm.append(columns, taskButton);
            boardForm.addEventListener("submit", event => { event.preventDefault(); save({ tasks: { ...(record?.tasks || {}), ...Object.fromEntries(store.tasks.map(task => [task.id, selects[task.id].value])) } }); }); board.append(boardForm); root.append(board);
            const panel = el("section", undefined, "services-panel"); panel.id = "submission"; panel.append(el("h2", "Save or update your solution link"), el("p", "Only a GitHub repository link and your notes are stored. No files are uploaded; no code is fetched, read or sent to a company. Revisit the requirements and Sample review before updating."));
            if (!record?.submission) panel.append(el("p", "No solution link saved yet."));
            else { panel.append(el("p", "Local link saved — unverified; not submitted to an employer."), external(record.submission.url)); time(panel, "Solution link saved", record.submission.savedAt); }
            const form = el("form"); form.id = "internship-submission"; form.noValidate = true;
            function field(id, caption, tag) { const wrap = el("div", undefined, "form-field"), label = el("label", caption), input = el(tag); input.id = id; label.htmlFor = id; wrap.append(label, input); form.append(wrap); return input; }
            const url = field("internship-url", "GitHub repository URL (https://github.com/owner/repository)", "input"); url.type = "url"; url.required = true; url.maxLength = 500; url.value = record?.submission?.url || "";
            const notes = field("internship-notes", "Your notes and known limitations (optional, up to 3000 characters)", "textarea"); notes.maxLength = 3000; notes.rows = 5; notes.value = record?.submission?.notes || "";
            const checkbox = el("input"); checkbox.id = "internship-share"; checkbox.type = "checkbox"; checkbox.checked = record?.showInPortfolio || false;
            const label = el("label", undefined, "internship-consent"); label.append(checkbox, document.createTextNode(" Show in my local portfolio as Virtual internship project — Self-reported. This does not publish it publicly or verify my skills.")); form.append(label);
            const submit = el("button", record?.submission ? "Update local solution" : "Save local solution", "button button-primary"); submit.type = "submit"; form.append(submit);
            form.addEventListener("submit", event => {
                event.preventDefault(); const canonical = store.githubUrl(url.value);
                if (!canonical || notes.value.length > 3000) { status("Enter a valid HTTPS GitHub repository URL with owner and repository only (no credentials, query or fragment), and notes up to 3000 characters.", true); url.focus(); return; }
                save({ submission: { ...(record?.submission || {}), url: canonical, notes: notes.value.trim(), savedAt: new Date().toISOString() }, showInPortfolio: checkbox.checked });
            }); panel.append(form, link("View my local portfolio", "../student/local-portfolio.html")); root.append(panel);
        } catch (error) { root.replaceChildren(link("Sign in to a student demo account", "../auth/login.html")); status(error.message || "Local data is unavailable. Nothing has been changed.", true); }
    }
    render(); window.addEventListener("pageshow", event => { if (event.persisted) render(); });
})();
