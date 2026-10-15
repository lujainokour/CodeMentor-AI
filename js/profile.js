(() => {
    const sessionKey = "codementor-demo-session";
    const preferencesKey = "codementor-demo-onboarding";

    const form = document.getElementById("profile-form");
    const fields = document.getElementById("profile-fields");

    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const languageInput = document.getElementById("profile-language");
    const experienceInput = document.getElementById("profile-experience");
    const goalInput = document.getElementById("profile-goal");

    const nameError = document.getElementById("profile-name-error");
    const message = document.getElementById("profile-message");
    const cancelButton = document.getElementById("profile-cancel");

    const accountName = document.getElementById("account-name");
    const accountInitials = document.getElementById("account-initials");

    window.languageCatalog.populateSelect(languageInput, true);
    const experiences = ["beginner", "basics", "practising"];
    const goals = ["foundations", "problem-solving", "projects"];

    let savedSession;
    let savedPreferences;

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.classList.toggle("is-error", isError);
    }

    function clearNameError() {
        nameError.textContent = "";
        nameInput.removeAttribute("aria-invalid");
    }

    function fillForm() {
        nameInput.value = savedSession.name;
        emailInput.value = savedSession.email;
        languageInput.value = savedPreferences.language;
        experienceInput.value = savedPreferences.experience;
        goalInput.value = savedPreferences.goal;

        clearNameError();
    }

    function updateAccountDisplay(name) {
        accountName.textContent = name;

        accountInitials.textContent = name
            .trim()
            .split(/\s+/u)
            .slice(0, 2)
            .map(part => Array.from(part)[0])
            .join("")
            .toUpperCase();
    }

    function isValidSession(value) {
        return value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            typeof value.name === "string" &&
            value.name.trim().length > 0 &&
            typeof value.email === "string" &&
            value.email.trim().length > 0 &&
            value.role === "student" &&
            value.isDemo === true;
    }

    function isValidPreferences(value) {
        return value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            window.languageCatalog.has(value.language) &&
            experiences.includes(value.experience) &&
            goals.includes(value.goal);
    }

    function loadProfile() {
        try {
            const sessionText = sessionStorage.getItem(sessionKey);

            if (!sessionText) {
                showMessage(
                    "Please log in to a student demo account to edit your profile.",
                    true
                );
                return;
            }

            const session = JSON.parse(sessionText);

            if (!isValidSession(session)) {
                showMessage(
                    "Your demo account data could not be loaded. Please log in again.",
                    true
                );
                return;
            }

            const preferencesText =
                sessionStorage.getItem(preferencesKey);

            const preferences = preferencesText
                ? JSON.parse(preferencesText)
                : {
                    language: "python",
                    experience: "beginner",
                    goal: "foundations"
                };

            if (!isValidPreferences(preferences)) {
                showMessage(
                    "Your learning preferences could not be loaded. Profile editing is unavailable.",
                    true
                );
                return;
            }

            savedSession = session;
            savedPreferences = preferences;

            fillForm();
            updateAccountDisplay(savedSession.name);
            fields.disabled = false;
        } catch {
            showMessage(
                "Profile data could not be read from this browser tab.",
                true
            );
        }
    }

    nameInput.addEventListener("input", clearNameError);

    cancelButton.addEventListener("click", () => {
        fillForm();
        showMessage("Unsaved changes have been discarded.");
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (fields.disabled) {
            return;
        }

        clearNameError();

        const name = nameInput.value.trim();

        if (name.length < 2 || name.length > 80) {
            nameError.textContent =
                "Enter a name between 2 and 80 characters.";

            nameInput.setAttribute("aria-invalid", "true");
            showMessage("Please check your name.", true);
            nameInput.focus();
            return;
        }

        if (
            !window.languageCatalog.has(languageInput.value) ||
            !experiences.includes(experienceInput.value) ||
            !goals.includes(goalInput.value)
        ) {
            showMessage("Choose valid learning preferences.", true);
            return;
        }

        let previousSessionText;
        let previousPreferencesText;
        let sessionWritten = false;

        try {
            previousSessionText = sessionStorage.getItem(sessionKey);
            previousPreferencesText =
                sessionStorage.getItem(preferencesKey);

            const currentSession = previousSessionText
                ? JSON.parse(previousSessionText)
                : null;

            if (
                !isValidSession(currentSession) ||
                currentSession.email !== savedSession.email
            ) {
                fields.disabled = true;
                showMessage(
                    "Your demo session has changed. Reload this page or log in again.",
                    true
                );
                return;
            }

            const currentPreferences = previousPreferencesText
                ? JSON.parse(previousPreferencesText)
                : {};

            if (
                previousPreferencesText &&
                !isValidPreferences(currentPreferences)
            ) {
                showMessage(
                    "Your saved preferences could not be read. Changes were not saved.",
                    true
                );
                return;
            }

            const updatedSession = {
                ...currentSession,
                name
            };

            const updatedPreferences = {
                ...currentPreferences,
                language: languageInput.value,
                experience: experienceInput.value,
                goal: goalInput.value
            };

            sessionStorage.setItem(
                sessionKey,
                JSON.stringify(updatedSession)
            );

            sessionWritten = true;

            sessionStorage.setItem(
                preferencesKey,
                JSON.stringify(updatedPreferences)
            );

            savedSession = updatedSession;
            savedPreferences = updatedPreferences;

            fillForm();
            updateAccountDisplay(name);

            showMessage("Profile changes saved in this browser tab.");
        } catch {
            let restored = !sessionWritten;

            if (sessionWritten) {
                try {
                    sessionStorage.setItem(
                        sessionKey,
                        previousSessionText
                    );

                    if (previousPreferencesText === null) {
                        sessionStorage.removeItem(preferencesKey);
                    } else {
                        sessionStorage.setItem(
                            preferencesKey,
                            previousPreferencesText
                        );
                    }

                    restored = true;
                } catch {
                    restored = false;
                }
            }

            showMessage(
                restored
                    ? "Changes could not be saved. Your previous profile was kept."
                    : "Saving failed and some changes may remain. Reload the page to check your profile.",
                true
            );
        }
    });

    loadProfile();
})();
