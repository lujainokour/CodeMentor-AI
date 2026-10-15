(() => {
if (window.learningUnavailable) return;
const questions = window.placementQuestions;
const attemptKey = "codementor-demo-placement";

const reviewList = document.getElementById("review-list");
const selectedCount = document.getElementById("selected-count");
const unsureCount = document.getElementById("unsure-count");
const unansweredCount = document.getElementById("unanswered-count");
const reviewMessage = document.getElementById("review-message");

const openSubmitButton = document.getElementById("open-submit");
const submitDialog = document.getElementById("submit-dialog");
const cancelSubmitButton = document.getElementById("cancel-submit");
const confirmSubmitButton = document.getElementById("confirm-submit");
const submitError = document.getElementById("submit-error");

let attempt = null;

function showMessage(text, isError = false) {
    reviewMessage.textContent = text;
    reviewMessage.classList.toggle("is-error", isError);
}

function isValidAnswer(answer, index) {
    return (
        answer === null ||
        answer === "unsure" ||
        (
            Number.isInteger(answer) &&
            answer >= 0 &&
            answer < questions[index].options.length
        )
    );
}

function loadAttempt() {
    try {
        const saved = sessionStorage.getItem(attemptKey);

        if (!saved) {
            window.location.replace("../student/placement-intro.html");
            return false;
        }

        const parsed = JSON.parse(saved);

        const valid = (
            parsed?.version === 1 &&
            Array.isArray(parsed.answers) &&
            parsed.answers.length === questions.length &&
            parsed.answers.every(isValidAnswer)
        );

        if (!valid) {
            throw new Error("Invalid attempt");
        }

        if (parsed.status === "submitted") {
            window.location.replace("../student/placement-results.html");
            return false;
        }

        if (parsed.status !== "in-progress") {
            throw new Error("Invalid status");
        }

        attempt = parsed;
        return true;
    } catch {
        attempt = null;
        openSubmitButton.disabled = true;

        showMessage(
            "Your saved answers could not be loaded. Return to the assessment introduction.",
            true
        );

        return false;
    }
}

function editQuestion(index) {
    attempt.currentQuestion = index;

    try {
        sessionStorage.setItem(attemptKey, JSON.stringify(attempt));
        window.location.href = "../student/placement-question.html";
    } catch {
        showMessage(
            "Couldn’t save your question position. Try again.",
            true
        );
    }
}

function renderReview() {
    reviewList.replaceChildren();

    questions.forEach(function (question, index) {
        const answer = attempt.answers[index];

        const row = document.createElement("article");
        row.className = "review-row";

        const number = document.createElement("span");
        number.className = "review-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const content = document.createElement("div");

        const heading = document.createElement("h3");
        heading.className = "review-question";
        heading.textContent = question.title;

        const answerText = document.createElement("p");
        answerText.className = "review-answer";

        if (answer === null) {
            answerText.textContent = "Unanswered";
        } else if (answer === "unsure") {
            answerText.textContent = "Your response: I’m not sure";
        } else {
            const letter = String.fromCharCode(65 + answer);

            answerText.textContent =
                `Your answer: ${letter} · ${question.options[answer]}`;
        }

        const topic = document.createElement("span");
        topic.className = "review-topic";
        topic.textContent = question.topic;

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "button button-outline review-edit";
        editButton.textContent = "Edit";
        editButton.setAttribute(
            "aria-label",
            `Edit answer to question ${index + 1}`
        );

        editButton.addEventListener("click", function () {
            editQuestion(index);
        });

        content.append(heading, answerText, topic);
        row.append(number, content, editButton);
        reviewList.append(row);
    });

    const unsure = attempt.answers.filter(function (answer) {
        return answer === "unsure";
    }).length;

    const unanswered = attempt.answers.filter(function (answer) {
        return answer === null;
    }).length;

    selectedCount.textContent =
        questions.length - unsure - unanswered;

    unsureCount.textContent = unsure;
    unansweredCount.textContent = unanswered;

    openSubmitButton.disabled = unanswered > 0;

    showMessage(
        unanswered > 0
            ? "Answer every question, or choose “I’m not sure”, before submitting."
            : "All questions answered. Your assessment is ready to submit."
    );
}

openSubmitButton.addEventListener("click", function () {
    if (!loadAttempt()) {
        return;
    }

    renderReview();

    if (attempt.answers.some(function (answer) {
        return answer === null;
    })) {
        return;
    }

    submitError.textContent = "";
    submitDialog.showModal();
});

cancelSubmitButton.addEventListener("click", function () {
    submitDialog.close();
});

/* Escape closes the dialog normally, except during submission */
submitDialog.addEventListener("cancel", function (event) {
    if (confirmSubmitButton.disabled) {
        event.preventDefault();
    }
});

confirmSubmitButton.addEventListener("click", function () {
    if (!attempt || confirmSubmitButton.disabled) {
        return;
    }

    confirmSubmitButton.disabled = true;
    cancelSubmitButton.disabled = true;
    confirmSubmitButton.textContent = "Submitting…";
    submitError.textContent = "";

    const submittedAttempt = {
        ...attempt,
        status: "submitted",
        submittedAt: new Date().toISOString()
    };

    try {
        sessionStorage.setItem(
            attemptKey,
            JSON.stringify(submittedAttempt)
        );
    } catch {
        confirmSubmitButton.disabled = false;
        cancelSubmitButton.disabled = false;
        confirmSubmitButton.textContent = "Submit";

        submitError.textContent =
            "Couldn’t submit your assessment. Try again.";

        return;
    }

    attempt = submittedAttempt;

    window.location.href = "../student/placement-results.html";
});

window.addEventListener("pageshow", function () {
    confirmSubmitButton.disabled = false;
    cancelSubmitButton.disabled = false;
    confirmSubmitButton.textContent = "Submit";

    if (submitDialog.open) {
        submitDialog.close();
    }

    if (loadAttempt()) {
        renderReview();
    }
});
})();
