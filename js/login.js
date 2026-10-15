const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const loginMessage = document.getElementById("login-message");

const submitButton = document.getElementById("login-submit");
const passwordToggle = document.getElementById("password-toggle");
const fillDemoButton = document.getElementById("fill-demo");

/* Public sample credentials for the frontend demo only */
const demoEmail = "student@example.com";
const demoPassword = "DemoStudent123!";

function setFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
}

function showMessage(message, isError = false) {
    loginMessage.textContent = message;
    loginMessage.classList.toggle("is-error", isError);
}

passwordToggle.addEventListener("click", function () {
    const showPassword = passwordInput.type === "password";

    passwordInput.type = showPassword ? "text" : "password";
    passwordToggle.textContent = showPassword ? "Hide" : "Show";
    passwordToggle.setAttribute("aria-pressed", String(showPassword));
    passwordToggle.setAttribute(
        "aria-label",
        showPassword ? "Hide password" : "Show password"
    );
});

fillDemoButton.addEventListener("click", function () {
    emailInput.value = demoEmail;
    passwordInput.value = demoPassword;

    setFieldError(emailInput, emailError, "");
    setFieldError(passwordInput, passwordError, "");
    showMessage("Demo details filled. Select Sign in to continue.");

    submitButton.focus();
});

emailInput.addEventListener("input", function () {
    setFieldError(emailInput, emailError, "");
    showMessage("");
});

passwordInput.addEventListener("input", function () {
    setFieldError(passwordInput, passwordError, "");
    showMessage("");
});

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    emailInput.value = emailInput.value.trim();

    const email = emailInput.value.toLowerCase();
    const password = passwordInput.value;

    let emailMessage = "";
    let passwordMessage = "";

    if (!email) {
        emailMessage = "Enter your email address.";
    } else if (emailInput.validity.typeMismatch) {
        emailMessage = "Enter a valid email address.";
    }

    if (!password) {
        passwordMessage = "Enter your password.";
    }

    setFieldError(emailInput, emailError, emailMessage);
    setFieldError(passwordInput, passwordError, passwordMessage);
    showMessage("");

    if (emailMessage || passwordMessage) {
        if (emailMessage) {
            emailInput.focus();
        } else {
            passwordInput.focus();
        }

        return;
    }

    if (email !== demoEmail || password !== demoPassword) {
        showMessage(
            "This frontend demo accepts the sample account shown below.",
            true
        );

        return;
    }

    /*
       Save demo identity only.
       This is not a real authentication session.
       Never save the password in browser storage.
    */
    try {
        const previousText = sessionStorage.getItem("codementor-demo-session");
        const previous = previousText === null ? null : JSON.parse(previousText);
        if (previous !== null && (!previous || typeof previous.name !== "string" || typeof previous.email !== "string" || previous.role !== "student" || previous.isDemo !== true)) {
            showMessage("Existing demo account data could not be read. It has not been replaced.", true);
            return;
        }
        if (previous && previous.email.toLowerCase() !== demoEmail) {
            showMessage("A different demo profile is active. Log out from the student workspace before using the sample account. Your records have been kept.", true);
            return;
        }
        sessionStorage.setItem(
            "codementor-demo-session",
            JSON.stringify({
                ...(previous || {}),
                name: previous?.name || "Lujain Okour",
                email: demoEmail,
                role: "student",
                isDemo: true
            })
        );
    } catch {
        showMessage(
            "Storage is unavailable or existing demo data could not be read. Your saved records have not been replaced.",
            true
        );

        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Opening demo…";

    window.location.href = "../student/onboarding.html";
});
