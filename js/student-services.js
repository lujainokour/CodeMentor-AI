(() => {
    "use strict";
    const data = window.studentServicesData;
    const root = document.getElementById("service-content");
    if (!root || !data) return;
    const page = document.body.dataset.servicePage;
    const id = new URLSearchParams(location.search).get("id");
    const languages = window.languageCatalog.names;
    function el(tag, text, cls) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (cls) node.className = cls;
        return node;
    }
    function link(text, href, cls = "button button-outline") {
        const a = el("a", text, cls); a.href = href; return a;
    }
    function note(text) { return el("p", text, "services-notice"); }
    function tags(values) {
        const list = el("ul", undefined, "services-tags");
        values.forEach(value => list.append(el("li", value))); return list;
    }
    function person(studentId) { return data.students.find(student => student.id === studentId); }
    function publicProfile(studentId) { return `../services/student-public-profile.html?id=${encodeURIComponent(studentId)}`; }
    const { session, readRecords, save } = window.studentServicesStore;
    function field(form, label, name, options = {}) {
        const wrap = el("div", undefined, "form-field");
        const input = document.createElement(options.tag || "input");
        input.id = name; input.name = name;
        const caption = el("label", label); caption.htmlFor = name;
        if (input.tagName === "INPUT") input.type = options.type || "text";
        input.required = true;
        if (options.maxLength) input.maxLength = options.maxLength;
        if (options.min !== undefined) input.min = String(options.min);
        if (options.max !== undefined) input.max = String(options.max);
        if (options.step) input.step = options.step;
        if (options.tag === "textarea") input.rows = 4;
        wrap.append(caption, input); form.append(wrap); return input;
    }
    function option(select, label, value) { const item = el("option", label); item.value = value; select.append(item); }
    function message(form) { const node = el("p", "", "form-message"); node.setAttribute("role", "status"); node.setAttribute("aria-live", "polite"); form.append(node); return node; }
    function result(node, value, error = false) { node.textContent = value; node.classList.toggle("is-error", error); }
    function requireOwner(host) {
        try { return session().email; } catch (error) {
            host.append(note(error.message), link("Sign in to the demo", "../auth/login.html")); return null;
        }
    }
    function filters(items, makeCard, includeSkill = false) {
        const form = el("form", undefined, "services-filters");
        form.setAttribute("role", "search");
        const query = field(form, "Search by name, topic or skill", "services-search", { type: "search" }); query.required = false;
        const language = field(form, "Language", "services-language", { tag: "select" });
        option(language, "All languages", "all"); languages.forEach(value => option(language, value, value));
        let skill;
        if (includeSkill) {
            skill = field(form, "Skill", "services-skill", { tag: "select" });
            option(skill, "All skills", "all");
            [...new Set(items.flatMap(item => item.skills))].sort().forEach(value => option(skill, value, value));
        }
        const reset = el("button", "Clear filters", "button button-outline"); reset.type = "reset"; form.append(reset);
        const count = el("p", "", "services-results"); count.setAttribute("role", "status");
        const list = el("div", undefined, "services-grid");
        function render() {
            const search = query.value.trim().toLowerCase();
            const matches = items.filter(item => {
                const owner = item.studentId ? person(item.studentId).name : item.name;
                const haystack = [owner, item.title, item.topic, item.bio, item.description, ...item.skills, ...(item.learning || [])].join(" ").toLowerCase();
                return haystack.includes(search) && (language.value === "all" || item.language === language.value || item.learning?.includes(language.value)) && (!skill || skill.value === "all" || item.skills.includes(skill.value));
            });
            count.textContent = `${matches.length} demo ${matches.length === 1 ? "result" : "results"}`;
            list.replaceChildren(...matches.map(makeCard));
            if (!matches.length) list.append(note("No matches. Try a different search or clear the filters."));
        }
        form.addEventListener("submit", event => { event.preventDefault(); render(); });
        form.addEventListener("input", render); form.addEventListener("change", render);
        form.addEventListener("reset", () => setTimeout(render, 0));
        root.append(form, count, list); render();
    }
    function card(title, subtitle, description, skills) {
        const node = el("article", undefined, "services-card");
        node.append(el("p", "SAMPLE DATA", "eyebrow"), el("h2", title), el("p", subtitle, "services-meta"), el("p", description), tags(skills)); return node;
    }
    function mentoring() {
        root.append(note("Paid peer sessions are a proposed service. All providers, prices and appointments below are demo data. Eligibility is a sample admin approval, not a result of completing a learning path."));
        filters(data.mentors.filter(item => item.demoAdminApproved === true), item => {
            const student = person(item.studentId);
            const node = card(item.topic, `${student.name} · ${item.language}`, item.description, item.skills);
            node.append(el("p", `${item.duration} minutes · ${item.price} ${item.currency} (demo price)`, "services-price"), el("p", "Demo admin-approved peer mentor", "services-meta"), link("View session & request a demo booking", `../services/mentoring-details.html?id=${item.id}`, "button button-primary")); return node;
        });
    }
    function slotsFor(mentor) {
        return [1, 2, 3].map(offset => {
            const date = new Date(); date.setDate(date.getDate() + offset); date.setHours(16, 0, 0, 0);
            return { value: `${mentor.id}:${date.toISOString()}`, date };
        });
    }
    function mentoringDetails() {
        const item = data.mentors.find(mentor => mentor.id === id && mentor.demoAdminApproved === true);
        if (!item) { root.append(note("Session not found. Choose a session from Peer Mentoring."), link("Browse sessions", "../services/peer-mentoring.html")); return; }
        const student = person(item.studentId);
        const detail = card(item.topic, `${student.name} · ${item.language}`, item.description, item.skills);
        detail.append(el("p", `${item.duration} minutes · ${item.price} ${item.currency} (demo price)`, "services-price"), note("Demo admin-approved eligibility. Completion of a course alone does not establish teaching eligibility."), link("View public student profile", publicProfile(student.id)));
        root.append(detail, note("Local booking simulation only. No payment is collected, no meeting is created, and slot availability is not guaranteed. These are illustrative appointments, not a real mentor calendar."));
        const host = el("section", undefined, "services-panel"); host.append(el("h2", "Request a demo booking")); root.append(host);
        const owner = requireOwner(host); if (!owner) return;
        const form = el("form"); form.noValidate = true;
        const select = field(form, "Demo appointment (your browser's local time)", "booking-slot", { tag: "select" });
        option(select, "Choose a demo appointment", "");
        const slots = slotsFor(item);
        slots.forEach(slot => option(select, slot.date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" }), slot.value));
        form.append(el("p", `Time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}. Appointments may not be available.`, "field-help"));
        const notes = field(form, "What would you like help with?", "booking-notes", { tag: "textarea", maxLength: 1000 });
        const submit = el("button", "Save demo booking request", "button button-primary"); submit.type = "submit"; form.append(submit);
        const status = message(form);
        const historyLink = link("View my local requests", "../student/requests.html"); historyLink.hidden = true; form.append(historyLink);
        form.addEventListener("submit", event => {
            event.preventDefault();
            if (!form.reportValidity()) { result(status, "Choose an appointment and describe what you need help with.", true); return; }
            try {
                const slot = slots.find(value => value.value === select.value);
                if (!slot || slot.date <= new Date()) throw new Error("Choose a future demo appointment. Reload to refresh the sample slots.");
                const record = save("booking", { mentorId: item.id, slot: slot.value, notes: notes.value.trim(), status: "local-simulation" }, owner);
                historyLink.href = `../student/requests.html#booking-${encodeURIComponent(record.id)}`; historyLink.hidden = false;
                result(status, "Demo request saved in this browser tab only. No mentor was contacted, no payment was made and no meeting was booked.");
            } catch (error) { result(status, error.message || "Local storage is unavailable. Nothing was sent.", true); }
        }); host.append(form);
    }
    function showcase() {
        root.append(note("These are fictional public demo profiles and project concepts. Private account details, age and email are never imported here."));
        filters(data.students, item => {
            const node = card(item.name, `Learning ${item.learning.join(" & ")}`, item.bio, item.skills);
            node.prepend(el("div", item.initials, "services-avatar"));
            node.append(el("p", `Project concept: ${item.projects[0].title}`), link("View public profile", publicProfile(item.id), "button button-primary")); return node;
        }, true);
    }
    function profile() {
        const student = data.students.find(item => item.id === id);
        if (!student) { root.append(note("Public student profile not found."), link("Browse showcase", "../services/showcase.html")); return; }
        const node = card(student.name, `Learning ${student.learning.join(" & ")}`, student.bio, student.skills);
        node.prepend(el("div", student.initials, "services-avatar")); root.append(node, note("Fictional demo profile. Public display data is separate from private account information."));
        const projects = el("section", undefined, "services-panel"); projects.append(el("h2", "Projects"));
        student.projects.forEach(project => projects.append(el("h3", project.title), el("p", project.description)));
        projects.append(el("h2", "Work links"));
        if (!student.links.length) projects.append(el("p", "No public work links have been added to this demo profile."));
        student.links.forEach(item => {
            const url = new URL(item.url);
            if (url.protocol !== "https:") return;
            const a = link(item.label, url.href); a.target = "_blank"; a.rel = "noopener noreferrer"; projects.append(a);
        }); root.append(projects);
    }
    function freelance() {
        root.append(note("Students offer programming services here. This is a sample catalogue, with illustrative prices and delivery times. Requests are local simulations; no payment or delivery takes place."), link("Create my local service draft", "../services/service-draft.html", "button button-primary"));
        filters(data.services, item => {
            const student = person(item.studentId);
            const node = card(item.title, `${student.name} · ${item.language}`, item.description, item.skills);
            node.append(el("p", `From ${item.price} ${item.currency} · ${item.days} days (demo estimates)`, "services-price"), link("View service & make a demo request", `../services/service-details.html?id=${item.id}`, "button button-primary")); return node;
        });
    }
    function serviceDetails() {
        const item = data.services.find(service => service.id === id);
        if (!item) { root.append(note("Service not found. Local drafts are private and are not published here."), link("Browse student services", "../services/freelance-services.html")); return; }
        const student = person(item.studentId);
        const detail = card(item.title, `${student.name} · ${item.language}`, item.description, item.skills);
        detail.append(el("p", `Starting at ${item.price} ${item.currency} · ${item.days} days (demo estimates)`, "services-price"), el("h3", "Example deliverables"), tags(item.deliverables), link("View student's public profile", publicProfile(student.id)));
        root.append(detail, note("Demo request only. It stays in this browser tab and is not sent to another person. No payment, agreement, delivery or availability is confirmed."));
        const host = el("section", undefined, "services-panel"); host.append(el("h2", "Describe your demo request")); root.append(host);
        const owner = requireOwner(host); if (!owner) return;
        const form = el("form"); form.noValidate = true;
        const brief = field(form, "Project brief (do not include sensitive information)", "service-brief", { tag: "textarea", maxLength: 1200 });
        const submit = el("button", "Save demo service request", "button button-primary"); submit.type = "submit"; form.append(submit);
        const status = message(form);
        const historyLink = link("View my local requests", "../student/requests.html"); historyLink.hidden = true; form.append(historyLink);
        form.addEventListener("submit", event => {
            event.preventDefault();
            if (submit.disabled) return;
            if (!form.reportValidity()) { result(status, "Describe what you would like the service to cover.", true); return; }
            try {
                const record = save("request", { serviceId: item.id, brief: brief.value.trim(), status: "local-simulation" }, owner);
                historyLink.href = `../student/requests.html#request-${encodeURIComponent(record.id)}`; historyLink.hidden = false;
                result(status, "Demo request saved in this tab only. It was not sent to the student. No payment or delivery has been arranged.");
                submit.disabled = true;
            } catch (error) { result(status, error.message || "Local storage is unavailable. Nothing was sent.", true); }
        }); host.append(form);
    }
    function drafts() {
        root.append(note("Create a private local draft of a service you could offer. It is not published or sent to anyone. Do not include contact details or sensitive information."));
        const owner = requireOwner(root); if (!owner) return;
        const form = el("form", undefined, "services-panel"); form.noValidate = true;
        const title = field(form, "Service title", "draft-title", { maxLength: 80 });
        const language = field(form, "Programming language", "draft-language", { tag: "select" }); languages.forEach(value => option(language, value, value));
        const description = field(form, "What will you offer?", "draft-description", { tag: "textarea", maxLength: 1000 });
        const skills = field(form, "Relevant skills (separate with commas)", "draft-skills", { maxLength: 200 });
        const price = field(form, "Starting price (JOD, demo estimate)", "draft-price", { type: "number", min: 0.01, max: 10000, step: "0.01" });
        const days = field(form, "Estimated delivery (days)", "draft-days", { type: "number", min: 1, max: 180, step: "1" });
        const submit = el("button", "Save local draft", "button button-primary"); submit.type = "submit"; form.append(submit);
        const status = message(form);
        const list = el("section", undefined, "services-panel");
        function render() {
            list.replaceChildren(el("h2", "My local drafts"));
            const records = readRecords("draft").records.filter(record => record.owner === owner);
            if (!records.length) list.append(el("p", "No saved service drafts yet."));
            records.forEach(record => {
                const node = card(record.title, `${record.language} · Private local draft`, record.description, record.skills.split(",").map(value => value.trim()).filter(Boolean));
                node.append(el("p", `From ${record.price} JOD · ${record.days} days (your estimate)`)); list.append(node);
            });
        }
        form.addEventListener("submit", event => {
            event.preventDefault(); if (!form.reportValidity()) { result(status, "Complete all fields with a valid price and delivery time.", true); return; }
            try {
                save("draft", { title: title.value.trim(), language: language.value, description: description.value.trim(), skills: skills.value.trim(), price: Number(price.value), days: Number(days.value), status: "draft" }, owner);
                form.reset(); render(); result(status, "Draft saved privately in this tab. It has not been published.");
            } catch (error) { result(status, error.message || "The draft could not be saved. Existing records have not been changed.", true); }
        }); root.append(form, list);
        try { render(); } catch (error) { result(status, error.message, true); }
    }
    function history() {
        function render() {
            root.replaceChildren(note("Private records for the active student demo session in this tab only. Local simulation — not sent, confirmed, paid or booked with another person."));
            let owner;
            try { owner = session().email; } catch (error) { root.append(note(error.message), link("Sign in to the demo", "../auth/login.html")); return; }
            root.append(link("View my private service drafts", "../services/service-draft.html"));
            [["booking", "My local booking requests"], ["request", "My local service requests"]].forEach(([type, title]) => {
                const section = el("section", undefined, "services-panel"); section.id = `${type}-history`; section.append(el("h2", title)); root.append(section);
                try {
                    const records = window.studentServicesStore.ownRecords(type, owner).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
                    if (!records.length) { section.append(el("p", "No saved requests of this type for your current demo account."), link(type === "booking" ? "Browse peer sessions" : "Browse student services", type === "booking" ? "../services/peer-mentoring.html" : "../services/freelance-services.html")); return; }
                    records.forEach(record => {
                        const item = type === "booking" ? data.mentors.find(value => value.id === record.mentorId) : data.services.find(value => value.id === record.serviceId);
                        const provider = item ? person(item.studentId) : null;
                        const article = el("article", undefined, "services-card request-record"); article.id = `${type}-${record.id}`;
                        article.append(el("h3", item ? (item.topic || item.title) : "Saved request — listing no longer available"), el("p", "Local simulation · Not sent or confirmed", "services-tag"));
                        const date = el("time", new Date(record.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })); date.dateTime = record.createdAt;
                        const created = el("p", "Created: "); created.append(date); article.append(created);
                        article.append(el("p", `Reference: ${record.id}`), el("p", `Saved listing ID: ${type === "booking" ? record.mentorId : record.serviceId}`));
                        if (provider) article.append(el("p", `Current demo provider: ${provider.name} · ${item.language}`));
                        if (type === "booking") {
                            const prefix = `${record.mentorId}:`, raw = record.slot.startsWith(prefix) ? record.slot.slice(prefix.length) : "";
                            const validDate = raw && Number.isFinite(Date.parse(raw));
                            article.append(el("p", `Requested demo appointment: ${validDate ? new Date(raw).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" }) : record.slot}`), el("p", `Your saved notes: ${record.notes}`, "request-text"));
                        } else article.append(el("p", `Your saved brief: ${record.brief}`, "request-text"));
                        if (item) article.append(link("View current demo listing", type === "booking" ? `../services/mentoring-details.html?id=${encodeURIComponent(item.id)}` : `../services/service-details.html?id=${encodeURIComponent(item.id)}`));
                        section.append(article);
                    });
                } catch { section.append(note("These saved requests could not be read. They have not been deleted or replaced. Other readable sections remain available.")); }
            });
            try { const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (target && root.contains(target)) target.scrollIntoView({ block: "start" }); } catch { /* An invalid fragment never changes records. */ }
        }
        render(); window.addEventListener("pageshow", event => { if (event.persisted) render(); });
    }
    const pages = { mentoring, "mentoring-details": mentoringDetails, showcase, profile, freelance, "service-details": serviceDetails, drafts, history };
    try { pages[page]?.(); } catch { root.append(note("This page could not load its demo data. Existing browser records have not been changed.")); }
})();



