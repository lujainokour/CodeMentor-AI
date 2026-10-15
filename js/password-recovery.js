(() => {
    const key = "codementor-demo-password-recovery", form = document.getElementById("recovery-form"), message = document.getElementById("recovery-message");
    const resetPage = document.body.dataset.recovery === "reset";
    function say(text, error = false) { message.textContent = text; message.classList.toggle("is-error", error); }
    function read() {
        const raw = sessionStorage.getItem(key); if (raw === null) return null;
        const value = JSON.parse(raw);
        if (!value || value.version !== 1 || typeof value.email !== "string" || !value.email.trim() || typeof value.nonce !== "string" || !value.nonce || !Number.isFinite(value.createdAt) || !["prepared", "completed"].includes(value.status)) throw new Error("Invalid saved recovery data");
        return value;
    }
    function validReset() {
        const record = read(), token = new URLSearchParams(location.search).get("demo");
        if (!record || record.nonce !== token || record.status !== "prepared" || Date.now() - record.createdAt > 20 * 60 * 1000 || record.createdAt > Date.now() + 1000) throw new Error("This local demo link is missing, expired or already used. Prepare a new simulation from Forgot password.");
        return record;
    }
    if (resetPage) {
        try { validReset(); } catch (error) { say(`${error.message} Existing records have not been changed.`, true); form.querySelector("fieldset").disabled = true; }
    }
    document.querySelectorAll("[data-password-target]").forEach(button => button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.passwordTarget), show = input.type === "password";
        input.type = show ? "text" : "password"; button.textContent = show ? "Hide" : "Show"; button.setAttribute("aria-pressed", String(show)); button.setAttribute("aria-label", show ? "Hide password" : "Show password");
    }));
    form.addEventListener("submit", event => {
        event.preventDefault(); if (!form.reportValidity()) { say("Complete the highlighted fields.", true); return; }
        try {
            if (resetPage) {
                const record = validReset(), password = document.getElementById("new-password"), confirm = document.getElementById("confirm-password");
                if (password.value.length < 12 || !password.value.trim()) { say("Use at least 12 characters for the new password.", true); password.focus(); return; }
                if (password.value !== confirm.value) { say("Passwords do not match.", true); confirm.focus(); return; }
                // Never store the password, change sample credentials, or claim to reset an account.
                sessionStorage.setItem(key, JSON.stringify({ ...record, status: "completed", completedAt: Date.now() }));
                form.reset(); form.querySelector("fieldset").disabled = true;
                say("Password reset simulation completed. No real password or account was changed, and no password was stored. Sample sign-in credentials remain unchanged.");
            } else {
                read(); // Block corrupt storage rather than replacing it.
                const email = document.getElementById("recovery-email").value.trim();
                if (!email || document.getElementById("recovery-email").validity.typeMismatch) { say("Enter a valid email address.", true); return; }
                const record = { version: 1, email, nonce: crypto.randomUUID(), createdAt: Date.now(), status: "prepared" };
                sessionStorage.setItem(key, JSON.stringify(record));
                say("Local reset simulation prepared. No email was sent and no real account was checked. This demo link works in this tab for 20 minutes.");
                const host = document.getElementById("recovery-next"); host.replaceChildren();
                const link = document.createElement("a"); link.className = "button button-outline"; link.href = `../auth/reset-password.html?demo=${encodeURIComponent(record.nonce)}`; link.textContent = "Open local reset simulation"; host.append(link);
            }
        } catch (error) { say(`${error.message} The simulation could not continue. Existing records were not deleted or replaced.`, true); }
    });
})();
