const signupForm = document.getElementById("signup-form");

const nameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");

const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const ageError = document.getElementById("age-error");
const passwordError = document.getElementById("password-error");
const confirmError = document.getElementById("confirm-error");

const signupMessage = document.getElementById("signup-message");
const submitButton = document.getElementById("signup-submit");

function setFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
}

function showMessage(message, isError = false) {
    signupMessage.textContent = message;
    signupMessage.classList.toggle("is-error", isError);
}

/* Show or hide each password independently */
document.querySelectorAll("[data-password-target]").forEach(function (button) {
    button.addEventListener("click", function () {
        const input = document.getElementById(button.dataset.passwordTarget);
        const showPassword = input.type === "password";

        input.type = showPassword ? "text" : "password";

        button.textContent = showPassword ? "Hide" : "Show";
        button.setAttribute("aria-pressed", String(showPassword));

        const label = input === confirmInput
            ? "confirmation password"
            : "password";

        button.setAttribute(
            "aria-label",
            `${showPassword ? "Hide" : "Show"} ${label}`
        );
    });
});

/* Clear a field's error when its value changes */
const fields = [
    { input: nameInput, error: nameError },
    { input: emailInput, error: emailError },
    { input: ageInput, error: ageError },
    { input: passwordInput, error: passwordError },
    { input: confirmInput, error: confirmError }
];

fields.forEach(function (field) {
    field.input.addEventListener("input", function () {
        setFieldError(field.input, field.error, "");
        showMessage("");
    });
});

passwordInput.addEventListener("input", function () {
    setFieldError(confirmInput, confirmError, "");
});

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (submitButton.disabled) {
        return;
    }

    nameInput.value = nameInput.value.trim();
    emailInput.value = emailInput.value.trim();

    const name = nameInput.value;
    const email = emailInput.value.toLowerCase();
    const age = Number(ageInput.value);

    /* Keep passwords exactly as entered, including spaces */
    const password = passwordInput.value;
    const confirmation = confirmInput.value;

    let nameMessage = "";
    let emailMessage = "";
    let ageMessage = "";
    let passwordMessage = "";
    let confirmMessage = "";

    if (!name) {
        nameMessage = "Enter your name.";
    } else if (name.length < 2 || name.split(/\s+/u).length < 2) {
        nameMessage = "Enter your full name, including your first and last name.";
    } else if (!/\p{L}/u.test(name) || /[^\p{L}\p{M}\s.'’\-]/u.test(name)) {
        nameMessage = "Use letters, spaces, apostrophes, periods or hyphens in your full name.";
    } else if (name.length > 80) {
        nameMessage = "Use no more than 80 characters.";
    }

    if (!email) {
        emailMessage = "Enter your email address.";
    } else if (emailInput.validity.typeMismatch) {
        emailMessage = "Enter a valid email address.";
    }

    if (!password.trim()) {
        passwordMessage = "Enter a password.";
    } else if (password.length < 12) {
        passwordMessage = "Use at least 12 characters.";
    }

    if (!ageInput.value.trim() || !Number.isInteger(age) || age < 1 || age > 120) {
        ageMessage = "Enter your age as a whole number between 1 and 120.";
    }

    if (!confirmation) {
        confirmMessage = "Confirm your password.";
    } else if (confirmation !== password) {
        confirmMessage = "Passwords do not match.";
    }

    setFieldError(nameInput, nameError, nameMessage);
    setFieldError(emailInput, emailError, emailMessage);
    setFieldError(ageInput, ageError, ageMessage);
    setFieldError(passwordInput, passwordError, passwordMessage);
    setFieldError(confirmInput, confirmError, confirmMessage);
    showMessage("");

    const firstInvalidField = [
        { input: nameInput, message: nameMessage },
        { input: emailInput, message: emailMessage },
        { input: ageInput, message: ageMessage },
        { input: passwordInput, message: passwordMessage },
        { input: confirmInput, message: confirmMessage }
    ].find(function (field) {
        return Boolean(field.message);
    });

    if (firstInvalidField) {
        firstInvalidField.input.focus();
        return;
    }

    /*
       Temporary frontend demo identity only.
       No password is stored.
    */
    try {
        const previousText = sessionStorage.getItem("codementor-demo-session");
        const previous = previousText === null ? null : JSON.parse(previousText);
        if (previous !== null && (!previous || typeof previous.name !== "string" || typeof previous.email !== "string" || previous.role !== "student" || previous.isDemo !== true)) {
            throw new Error("Invalid existing identity");
        }
        if (previous && previous.email.toLowerCase() !== email) {
            showMessage("A different demo profile is active in this tab. Log out before starting another profile. Existing records were kept.", true);
            return;
        }
        sessionStorage.setItem(
            "codementor-demo-session",
            JSON.stringify({
                ...(previous || {}),
                name: name,
                email: email,
                age: age,
                role: "student",
                isDemo: true
            })
        );

        /* Preserve saved onboarding, learning and admin content records. */
    } catch {
        showMessage(
            "Your demo profile could not be saved. Storage may be unavailable or existing account data may be invalid. Existing records were kept.",
            true
        );
        return;
    }

    signupForm.reset();

    submitButton.disabled = true;
    submitButton.textContent = "Opening onboarding…";

    window.location.href = "../student/onboarding.html";
});

/* Restore the button when returning with the browser Back button */
window.addEventListener("pageshow", function () {
    submitButton.disabled = false;
    submitButton.textContent = "Continue to onboarding";
});
