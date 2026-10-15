(() => {
    const form = document.getElementById("change-password-form");
    const message = document.getElementById("password-message");

    const currentPassword = document.getElementById("current-password");
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("confirm-password");

    const inputs = [
        currentPassword,
        newPassword,
        confirmPassword
    ];

    const toggleButtons = form.querySelectorAll(
        "[data-password-target]"
    );

    function clearError(input) {
        input.removeAttribute("aria-invalid");

        document.getElementById(
            `${input.id}-error`
        ).textContent = "";
    }

    function showError(input, text) {
        input.setAttribute("aria-invalid", "true");

        document.getElementById(
            `${input.id}-error`
        ).textContent = text;
    }

    function hidePasswords() {
        toggleButtons.forEach(button => {
            const input = document.getElementById(
                button.dataset.passwordTarget
            );

            input.type = "password";
            button.textContent = "Show";
            button.setAttribute("aria-pressed", "false");
            button.setAttribute(
                "aria-label",
                button.dataset.showLabel
            );
        });
    }

    toggleButtons.forEach(button => {
        button.dataset.showLabel = button.getAttribute("aria-label");

        button.addEventListener("click", () => {
            const input = document.getElementById(
                button.dataset.passwordTarget
            );

            const showPassword = input.type === "password";

            input.type = showPassword ? "text" : "password";
            button.textContent = showPassword ? "Hide" : "Show";

            button.setAttribute(
                "aria-pressed",
                String(showPassword)
            );

            button.setAttribute(
                "aria-label",
                showPassword
                    ? button.dataset.showLabel.replace("Show", "Hide")
                    : button.dataset.showLabel
            );
        });
    });

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            clearError(input);
            message.textContent = "";
            message.classList.remove("is-error");

            if (input === newPassword) {
                clearError(confirmPassword);
            }
        });
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        inputs.forEach(clearError);
        message.textContent = "";
        message.classList.remove("is-error");

        if (currentPassword.value.length === 0) {
            showError(
                currentPassword,
                "Enter your current password."
            );
        }

        if (
            newPassword.value.trim().length === 0 ||
            newPassword.value.length < 12
        ) {
            showError(
                newPassword,
                "Use a new password with at least 12 characters."
            );
        } else if (newPassword.value === currentPassword.value) {
            showError(
                newPassword,
                "Choose a password different from your current one."
            );
        }

        if (confirmPassword.value.length === 0) {
            showError(
                confirmPassword,
                "Confirm your new password."
            );
        } else if (confirmPassword.value !== newPassword.value) {
            showError(
                confirmPassword,
                "The passwords do not match."
            );
        }

        const firstInvalid = inputs.find(
            input => input.getAttribute("aria-invalid") === "true"
        );

        if (firstInvalid) {
            message.textContent = "Please check the highlighted fields.";
            message.classList.add("is-error");
            firstInvalid.focus();
            return;
        }

        form.reset();
        hidePasswords();

        message.textContent =
            "Input checks passed. Your current password was not verified " +
            "and no password was changed. Backend connection is required.";
    });

    window.addEventListener("pagehide", () => {
        form.reset();
        hidePasswords();
        inputs.forEach(clearError);
        message.textContent = "";
    });
})();