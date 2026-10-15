(() => {
    const form = document.getElementById("onboarding-form"), select = document.getElementById("onboarding-language");
    const status = document.getElementById("onboarding-message"), button = document.getElementById("continue-button");
    const key = "codementor-demo-onboarding", catalog = window.languageCatalog;
    catalog.populateSelect(select, true);
    const valid = value => value && catalog.has(value.language) && ["beginner", "basics", "practising"].includes(value.experience) && ["foundations", "problem-solving", "projects"].includes(value.goal);
    function say(text, error = false) { status.textContent = text; status.classList.toggle("is-error", error); }
    function values() { const data = new FormData(form); return { language: data.get("language"), experience: data.get("experience"), goal: data.get("goal") }; }
    function read() { const raw = sessionStorage.getItem(key); const value = raw === null ? null : JSON.parse(raw); if (value !== null && !valid(value)) throw new Error("Invalid saved preferences"); return value; }
    function save() {
        try {
            const previous = read(), next = values();
            if (!valid(next)) { say("Choose a language, your experience and your learning goal.", true); return false; }
            sessionStorage.setItem(key, JSON.stringify({ ...previous, ...next })); say("Preferences saved in this tab."); return true;
        } catch { say("Saved preferences could not be read or saved. Existing records have not been replaced.", true); return false; }
    }
    function label() { button.textContent = catalog.get(select.value)?.builtInContent ? "Continue to Python placement →" : "View content availability →"; }
    form.addEventListener("change", () => { label(); save(); });
    form.addEventListener("submit", event => {
        event.preventDefault(); if (!form.reportValidity() || !save()) return;
        location.href = catalog.get(select.value).builtInContent ? "../student/placement-intro.html" : `../public/languages.html?language=${encodeURIComponent(select.value)}`;
    });
    document.getElementById("save-exit").addEventListener("click", () => { if (save()) location.href = "../../index.html"; });
    try {
        const saved = read();
        if (saved) {
            select.value = saved.language;
            ["experience", "goal"].forEach(name => { const choice = [...form.querySelectorAll(`input[name="${name}"]`)].find(input => input.value === saved[name]); if (choice) choice.checked = true; });
        }
    } catch { say("Saved preferences could not be loaded. They have not been deleted or replaced.", true); }
    try {
        const account = JSON.parse(sessionStorage.getItem("codementor-demo-session") || "null");
        if (typeof account?.name === "string") document.getElementById("welcome-message").textContent = `Welcome, ${account.name}. Choose your learning preferences.`;
    } catch { /* Preference errors above remain visible. */ }
    label();
})();
