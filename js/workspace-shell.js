/* One shared shell, using the existing sidebar/topbar markup and styles. */
(() => {
    "use strict";
    const appRoot = new URL('../', document.currentScript.src);
    const routes = {"admin-courses.html":"pages/admin/admin-courses.html","index.html":"index.html","placement-question.html":"pages/student/placement-question.html","virtual-internship.html":"pages/student/virtual-internship.html","code-review.html":"pages/student/code-review.html","service-details.html":"pages/services/service-details.html","placement-intro.html":"pages/student/placement-intro.html","peer-mentoring.html":"pages/services/peer-mentoring.html","local-portfolio.html":"pages/student/local-portfolio.html","dashboard.html":"pages/student/dashboard.html","admin-analytics.html":"pages/admin/admin-analytics.html","learning-report.html":"pages/student/learning-report.html","change-password.html":"pages/auth/change-password.html","admin-account-access.html":"pages/admin/admin-account-access.html","placement-results.html":"pages/student/placement-results.html","forgot-password.html":"pages/auth/forgot-password.html","admin-level-content.html":"pages/admin/admin-level-content.html","languages.html":"pages/public/languages.html","course.html":"pages/public/course.html","progress.html":"pages/student/progress.html","mentor.html":"pages/student/mentor.html","learning-path.html":"pages/student/learning-path.html","mentoring-details.html":"pages/services/mentoring-details.html","project-evaluation.html":"pages/student/project-evaluation.html","showcase.html":"pages/services/showcase.html","onboarding.html":"pages/student/onboarding.html","certificates.html":"pages/student/certificates.html","placement-review.html":"pages/student/placement-review.html","service-draft.html":"pages/services/service-draft.html","community.html":"pages/services/community.html","module.html":"pages/student/module.html","login.html":"pages/auth/login.html","admin-dashboard.html":"pages/admin/admin-dashboard.html","signup.html":"pages/auth/signup.html","reset-password.html":"pages/auth/reset-password.html","skill-analysis.html":"pages/student/skill-analysis.html","workspace.html":"pages/student/workspace.html","demo.html":"pages/public/demo.html","student-public-profile.html":"pages/services/student-public-profile.html","practice.html":"pages/student/practice.html","level-assessment.html":"pages/student/level-assessment.html","requests.html":"pages/student/requests.html","admin-students.html":"pages/admin/admin-students.html","admin-course-create.html":"pages/admin/admin-course-create.html","freelance-services.html":"pages/services/freelance-services.html","admin-level-create.html":"pages/admin/admin-level-create.html","admin-course-content.html":"pages/admin/admin-course-content.html","project.html":"pages/student/project.html","admin-student-details.html":"pages/admin/admin-student-details.html","lesson.html":"pages/student/lesson.html","profile.html":"pages/student/profile.html"};
    const route = value => new URL(routes[value] || value, appRoot).href;
    const filename = location.pathname.split("/").pop() || "index.html";
    const admin = filename.startsWith("admin-");
    const logoPath = "assets/images/Burgundy CMA cherry monogram logo.png";
    const studentLinks = [
        ["dashboard.html", "Dashboard"], ["learning-path.html", "Learning path"], ["languages.html", "Language catalogue"],
        ["practice.html", "Practice tasks"], ["mentor.html", "AI Mentor demo"], ["progress.html", "My progress"],
        ["project.html", "Projects"], ["virtual-internship.html", "Virtual Internship"], ["local-portfolio.html", "My local portfolio"], ["certificates.html", "Certificates"], ["workspace.html", "Coding workspace"],
        ["skill-analysis.html", "Skill analysis"], ["community.html", "Student Community"], ["peer-mentoring.html", "Peer Mentoring"],
        ["showcase.html", "Student Showcase"], ["freelance-services.html", "Student services"], ["requests.html", "My local requests"]
    ];
    const adminLinks = [["admin-dashboard.html", "Dashboard"], ["admin-students.html", "Students"], ["admin-courses.html", "Learning paths"], ["admin-analytics.html", "Analytics"]];
    const activeMap = { "lesson.html": "learning-path.html", "module.html": "learning-path.html", "level-assessment.html": "learning-path.html", "learning-report.html": "progress.html", "student-public-profile.html": "showcase.html", "mentoring-details.html": "peer-mentoring.html", "service-details.html": "freelance-services.html", "service-draft.html": "freelance-services.html", "course.html": "languages.html", "admin-course-create.html": "admin-courses.html", "admin-course-content.html": "admin-courses.html", "admin-level-create.html": "admin-courses.html", "admin-level-content.html": "admin-courses.html", "admin-student-details.html": "admin-students.html", "admin-account-access.html": "admin-students.html" };
    function el(tag, text, cls) { const node = document.createElement(tag); if (text) node.textContent = text; if (cls) node.className = cls; return node; }
    function a(text, href, cls) { const node = el("a", text, cls); node.href = route(href); return node; }
    Object.assign(activeMap, { "onboarding.html": "learning-path.html", "placement-intro.html": "learning-path.html", "placement-question.html": "learning-path.html", "placement-results.html": "learning-path.html", "placement-review.html": "learning-path.html", "change-password.html": "profile.html" });
    let account = null, identityError = "";
    function readAccount() {
        try {
            const raw = sessionStorage.getItem("codementor-demo-session");
            if (raw === null) return null;
            const value = JSON.parse(raw);
            if (!value || value.role !== "student" || value.isDemo !== true || typeof value.name !== "string" || !value.name.trim() || typeof value.email !== "string" || !value.email.trim()) throw new Error("Invalid identity");
            return value;
        } catch { identityError = "Saved demo identity could not be read. No data has been changed."; return null; }
    }
    account = readAccount();
    const flexiblePage = document.body.classList.contains("services-page") || filename.startsWith("placement-") || filename === "onboarding.html";
    const needsShell = admin || document.body.classList.contains("workspace-page") || filename === "workspace.html" || (flexiblePage && account !== null);
    function brand(node) {
        node.href = route("index.html"); node.classList.add("site-brand"); node.setAttribute("aria-label", "CodeMentor AI - Home");
        let img = node.querySelector("img");
        if (!img) { img = document.createElement("img"); node.prepend(img); }
        img.src = route(logoPath); img.alt = "CodeMentor AI cherry logo"; img.width = 44; img.height = 44;
        if (!node.querySelector("span")) {
            [...node.childNodes].filter(child => child.nodeType === Node.TEXT_NODE).forEach(child => child.remove());
            node.append(el("span", "CodeMentor AI"));
        }
    }
    if (needsShell) {
        window.workspaceShellManaged = true;
        document.body.classList.add("workspace-page", "shell-active");
        if (admin) document.body.classList.add("admin-page");
        let sidebar = document.getElementById("workspace-sidebar");
        if (!sidebar) { sidebar = el("aside", "", "workspace-sidebar"); sidebar.id = "workspace-sidebar"; document.body.prepend(sidebar); }
        sidebar.replaceChildren();
        sidebar.append(a("CodeMentor AI", "index.html", "logo"), el("p", admin ? "ADMIN PREVIEW" : account ? "STUDENT WORKSPACE" : "STUDENT DEMO PREVIEW", "sidebar-label"));
        const nav = el("nav", "", "workspace-navigation"); nav.setAttribute("aria-label", admin ? "Admin navigation" : "Student navigation");
        const active = activeMap[filename] || filename;
        (admin ? adminLinks : studentLinks).forEach(([href, label]) => { const item = a(label, href); if (active === href) item.setAttribute("aria-current", "page"); nav.append(item); });
        sidebar.append(nav);
        const bottom = el("div", "", "sidebar-bottom");
        bottom.append(a(admin ? "View website" : "Profile settings", admin ? "index.html" : "profile.html"));
        if (!admin && (filename === "profile.html" || filename === "change-password.html")) bottom.firstElementChild.setAttribute("aria-current", "page");
        const exit = el("button", admin ? "Exit admin preview" : "Log out"); exit.type = "button"; exit.id = admin ? "admin-exit-button" : "logout-button"; bottom.append(exit); sidebar.append(bottom);
        let body = document.querySelector(".workspace-body");
        if (!body) {
            body = el("div", "", "workspace-body");
            const main = document.querySelector("main");
            if (main) {
                const oldHeader = document.querySelector(".services-header"); oldHeader?.remove();
                main.before(body);
                const contextHeader = document.querySelector(".onboarding-header"); if (contextHeader) body.append(contextHeader);
                body.append(main);
                const footer = document.querySelector(".services-footer, .onboarding-footer"); if (footer) body.append(footer);
                if (main.classList.contains("services-main")) { main.classList.remove("container"); main.classList.add("workspace-main"); }
            } else document.body.append(body);
        }
        let topbar = document.querySelector(".workspace-topbar");
        if (!topbar) { topbar = el("header", "", "workspace-topbar"); body.prepend(topbar); }
        topbar.replaceChildren();
        const left = el("div", "", "workspace-topbar-left");
        const toggle = el("button", "\u2630", "workspace-menu-toggle"); toggle.type = "button"; toggle.id = "workspace-menu-toggle"; toggle.setAttribute("aria-label", "Open navigation"); toggle.setAttribute("aria-controls", sidebar.id); toggle.setAttribute("aria-expanded", "false");
        const title = document.title.split("|")[0].trim();
        left.append(toggle, a("CodeMentor AI", "index.html", "logo shell-mobile-brand"), el("span", `${admin ? "Admin preview" : "Student workspace"} / ${title}`)); topbar.append(left);
        if (admin) topbar.append(el("span", "Frontend admin preview", "admin-preview-label"));
        else {
            const pill = a("", "profile.html", "account-pill"); const initials = el("span", "S", "account-initials"); initials.id = "account-initials";
            const name = el("span", account?.name || "Student preview"); name.id = "account-name";
            if (account) initials.textContent = account.name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join("").toUpperCase(); pill.append(initials, name); topbar.append(pill);
        }
        const shellMessage = el("p", identityError, "form-message shell-message"); shellMessage.id = "shell-message"; shellMessage.setAttribute("role", "status"); topbar.after(shellMessage);
        function close(focus = false) { sidebar.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Open navigation"); if (focus) toggle.focus(); }
        toggle.addEventListener("click", () => { const open = sidebar.classList.toggle("is-open"); toggle.setAttribute("aria-expanded", String(open)); toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation"); });
        document.addEventListener("keydown", event => { if (event.key === "Escape" && sidebar.classList.contains("is-open")) close(true); });
        document.addEventListener("click", event => { if (!sidebar.contains(event.target) && !toggle.contains(event.target)) close(); });
        sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => close()));
        matchMedia("(min-width: 901px)").addEventListener("change", () => close());
        exit.addEventListener("click", () => {
            if (admin) { location.href = route("index.html"); return; }
            try { sessionStorage.removeItem("codementor-demo-session"); location.href = route("login.html"); } catch { shellMessage.textContent = "The demo session could not be cleared. Your records were kept."; }
        });
    } else if (identityError) {
        const main = document.querySelector("main"); if (main) main.prepend(el("p", identityError, "services-notice"));
    }
    if (!needsShell) {
        const nav = document.getElementById("navigation");
        if (nav && document.body.classList.contains("services-page") && ![...nav.querySelectorAll('a')].find(link => new URL(link.href).pathname.split('/').pop() === 'languages.html')) nav.prepend(a("Languages", "languages.html"));
        nav?.querySelectorAll("a").forEach(link => { if (new URL(link.href).pathname.split("/").pop() === (activeMap[filename] || filename)) link.setAttribute("aria-current", "page"); });
    }
    document.querySelectorAll("a.logo, a.brand-logo").forEach(brand);
    if (window.codeMentorTheme && !document.querySelector(".theme-toggle")) {
        const toggle = el("button", "", "theme-toggle"); toggle.type = "button";
        // Constant, decorative SVG artwork; no user data is inserted as HTML.
        toggle.innerHTML = `<span class="theme-word theme-word-day" aria-hidden="true">DAY</span><span class="theme-word theme-word-night" aria-hidden="true">NIGHT</span><span class="theme-thumb" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><defs><radialGradient id="cm-cherry-glaze" cx=".3" cy=".2" r=".85"><stop stop-color="#a65159"/><stop offset=".4" stop-color="#70151c"/><stop offset="1" stop-color="#260204"/></radialGradient></defs><g class="theme-cherry-art"><path d="M14 28C17 18 22 12 28 7M32 30C29 19 26 13 28 7" fill="none" stroke="#260204" stroke-width="1.8" stroke-linecap="round"/><path d="M28 9C37 8 41 14 40 19C33 19 28 15 28 9Z" fill="#70151c" stroke="#260204" stroke-width=".8"/><path d="m29 10 9 7" fill="none" stroke="#b1d4e1" stroke-opacity=".5" stroke-width=".7"/><path d="M14 27C8 23 4 28 5 34C6 41 12 44 17 40C22 43 26 36 23 30C21 26 17 26 14 27Z" fill="url(#cm-cherry-glaze)" stroke="#260204" stroke-width=".8"/><path d="M32 29C26 25 23 30 24 36C25 43 31 46 36 42C41 44 45 36 42 32C40 28 35 28 32 29Z" fill="url(#cm-cherry-glaze)" stroke="#260204" stroke-width=".8"/><path d="M8 30q1-3 5-1M27 32q1-3 5-1" fill="none" stroke="#daeaf0" stroke-width="1.6" stroke-linecap="round" opacity=".9"/></g></svg></span>`;
        const status = el("span", "", "theme-save-status"); status.setAttribute("role", "status");
        function syncToggle() {
            const dark = window.codeMentorTheme.get() === "dark";
            toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
            toggle.setAttribute("aria-pressed", String(dark));
            toggle.title = dark ? "Light mode" : "Dark mode";
        }
        toggle.addEventListener("click", () => {
            const saved = window.codeMentorTheme.set(window.codeMentorTheme.get() === "dark" ? "light" : "dark");
            status.textContent = saved ? "" : "Theme changed. Browser storage is unavailable; this choice may not persist.";
        });
        window.addEventListener("codementor:themechange", syncToggle); syncToggle();
        const host = document.querySelector(".workspace-topbar, .nav-actions, .onboarding-header");
        if (host) host.append(toggle, status);
        else {
            const toolbar = el("div", "", "theme-toolbar"); toolbar.append(toggle, status);
            (document.querySelector(".auth-panel, main") || document.body).prepend(toolbar);
        }
    }
    window.addEventListener("pageshow", event => {

        if (event.persisted && !admin && (flexiblePage || needsShell)) {
            const current = readAccount();
            if (current?.email !== account?.email || current?.name !== account?.name) location.reload();
        }
    });
})();

