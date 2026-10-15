(() => {
if (window.learningUnavailable) return;
const questions = window.placementQuestions;
const attemptKey = "codementor-demo-placement";

const title = document.getElementById("question-title");
const position = document.getElementById("question-position");
const topic = document.getElementById("question-topic");
const codeContent = document.getElementById("code-content");
const optionsContainer = document.getElementById("answer-options");
const navigation = document.getElementById("question-navigation");
const progress = document.getElementById("question-progress");
const answerCount = document.getElementById("answer-count");
const saveStatus = document.getElementById("save-status");
const message = document.getElementById("question-message");

const previousButton = document.getElementById("previous-question");
const nextButton = document.getElementById("next-question");
const reviewButton = document.getElementById("review-answers");

let attempt = null;
let savedSuccessfully = true;

function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("is-error", isError);
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

        attempt = JSON.parse(saved);

        const valid = (
            attempt?.version === 1 &&
            Array.isArray(attempt.answers) &&
            attempt.answers.length === questions.length &&
            attempt.answers.every(isValidAnswer)
        );

        if (!valid) {
            throw new Error("Invalid saved attempt");
        }

        if (attempt.status === "submitted") {
            window.location.replace("../student/placement-results.html");
            return false;
        }

        if (attempt.status !== "in-progress") {
            throw new Error("Invalid attempt status");
        }

        if (
            !Number.isInteger(attempt.currentQuestion) ||
            attempt.currentQuestion < 0 ||
            attempt.currentQuestion >= questions.length
        ) {
            throw new Error("Invalid question position");
        }

        return true;
    } catch {
        showMessage(
            "Your saved assessment could not be loaded. Return to the introduction.",
            true
        );

        previousButton.disabled = true;
        nextButton.disabled = true;
        reviewButton.disabled = true;

        return false;
    }
}

function saveAttempt() {
    try {
        sessionStorage.setItem(attemptKey, JSON.stringify(attempt));

        savedSuccessfully = true;
        saveStatus.textContent = "Answers saved in this tab.";
        showMessage("");

        return true;
    } catch {
        savedSuccessfully = false;
        saveStatus.textContent = "Changes not saved.";

        showMessage(
            "Couldn’t save your changes. Select an answer again to retry.",
            true
        );

        return false;
    }
}

function updateNavigation() {
    navigation.replaceChildren();

    questions.forEach(function (question, index) {
        const button = document.createElement("button");
        const answered = attempt.answers[index] !== null;

        button.type = "button";
        button.className = "question-number";
        button.textContent = index + 1;

        button.classList.toggle("is-answered", answered);

        button.setAttribute(
            "aria-label",
            `Question ${index + 1}, ${answered ? "answered" : "unanswered"}`
        );

        if (index === attempt.currentQuestion) {
            button.setAttribute("aria-current", "step");
        }

        button.addEventListener("click", function () {
            goToQuestion(index);
        });

        navigation.append(button);
    });

    const answered = attempt.answers.filter(function (answer) {
        return answer !== null;
    }).length;

    answerCount.textContent =
        `${answered} answered · ${questions.length - answered} unanswered`;

    reviewButton.disabled =
        answered !== questions.length || !savedSuccessfully;
}

function renderQuestion(moveFocus = false) {
    const index = attempt.currentQuestion;
    const question = questions[index];

    position.textContent = `QUESTION ${index + 1} OF ${questions.length}`;
    progress.value = index + 1;
    topic.textContent = question.topic;
    title.textContent = question.title;
    codeContent.textContent = question.code;

    optionsContainer.replaceChildren();

    const choices = [
        ...question.options.map(function (text, value) {
            return { text: text, value: value };
        }),
        { text: "I’m not sure", value: "unsure" }
    ];

    choices.forEach(function (choice, optionIndex) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        const text = document.createElement("span");

        label.className = "answer-option";
        input.type = "radio";
        input.name = "answer";
        input.value = String(choice.value);
        input.checked = attempt.answers[index] === choice.value;

        text.textContent = choice.value === "unsure"
            ? choice.text
            : `${String.fromCharCode(65 + optionIndex)} · ${choice.text}`;

        label.classList.toggle("is-selected", input.checked);

        input.addEventListener("change", function () {
            attempt.answers[index] = choice.value;

            optionsContainer.querySelectorAll(".answer-option").forEach(
                function (option) {
                    const radio = option.querySelector("input");
                    option.classList.toggle("is-selected", radio.checked);
                }
            );

            saveAttempt();
            updateNavigation();
        });

        label.append(input, text);
        optionsContainer.append(label);
    });

    previousButton.disabled = index === 0;
    nextButton.textContent = index === questions.length - 1
        ? "Review answers →"
        : "Next question →";

    updateNavigation();

    if (moveFocus) {
        title.focus();
    }
}

function goToQuestion(index) {
    attempt.currentQuestion = index;

    saveAttempt();
    renderQuestion(true);
}

function openReview() {
    const allAnswered = attempt.answers.every(function (answer) {
        return answer !== null;
    });

    if (!allAnswered) {
        showMessage(
            "Answer every question, or choose “I’m not sure”, before reviewing.",
            true
        );
        return;
    }

    if (saveAttempt()) {
        window.location.href = "../student/placement-review.html";
    }
}

previousButton.addEventListener("click", function () {
    if (attempt && attempt.currentQuestion > 0) {
        goToQuestion(attempt.currentQuestion - 1);
    }
});

nextButton.addEventListener("click", function () {
    if (!attempt) {
        return;
    }

    if (attempt.currentQuestion === questions.length - 1) {
        openReview();
    } else {
        goToQuestion(attempt.currentQuestion + 1);
    }
});

reviewButton.addEventListener("click", openReview);

window.addEventListener("pageshow", function () {
    if (loadAttempt()) {
        saveStatus.textContent = "Answers loaded.";
        renderQuestion();
    }
});
})();
