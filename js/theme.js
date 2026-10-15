/* Loaded synchronously in <head>, before CSS: select the palette before first paint. */
(() => {
    "use strict";
    const key = "codementor-ui-theme";
    const system = matchMedia("(prefers-color-scheme: dark)");
    const valid = value => value === "light" || value === "dark";
    let preference = null;
    try { const saved = localStorage.getItem(key); if (valid(saved)) preference = saved; } catch { /* Device preference remains usable. */ }
    let current;
    function apply(value) {
        current = value;
        document.documentElement.dataset.theme = value;
        window.dispatchEvent(new CustomEvent("codementor:themechange", { detail: value }));
    }
    apply(preference || (system.matches ? "dark" : "light"));
    window.codeMentorTheme = Object.freeze({
        get: () => current,
        set(value) {
            if (!valid(value)) return false;
            preference = value; apply(value);
            try { localStorage.setItem(key, value); return true; } catch { return false; }
        }
    });
    system.addEventListener("change", () => { if (preference === null) apply(system.matches ? "dark" : "light"); });
    window.addEventListener("storage", event => {
        if (event.key !== key && event.key !== null) return;
        if (event.newValue !== null && !valid(event.newValue)) return;
        preference = event.newValue;
        apply(preference || (system.matches ? "dark" : "light"));
    });
    window.addEventListener("pageshow", event => {
        if (!event.persisted) return;
        try {
            const saved = localStorage.getItem(key);
            if (valid(saved)) { preference = saved; apply(saved); }
            else if (saved === null && preference === null) apply(system.matches ? "dark" : "light");
        } catch { /* Never block navigation when preference storage is unavailable. */ }
    });
})();
