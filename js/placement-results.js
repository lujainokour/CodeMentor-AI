(() => {
if (window.learningUnavailable) return;
const questions = window.placementQuestions;
const attemptKey = "codementor-demo-placement";

const resultsContent = document.getElementById("results-content");
const resultsMessage = document.getElementById("results-message");

const percentageElement = document.getElementById("score-percentage");
const countElement = document.getElementById("score-count");
const responseSummary = document.getElementById("response-summary");

const topicResults = document.getElementById("topic-results");
const practiceSuggestion = document.getElementById("practice-suggestion");
const submittedAnswers = document.getElementById("submitted-answers");

function showError(text) {
    resultsContent.hidden = true;
    resultsMessage.textContent = text;
    resultsMessage.classList.add("is-error");
}

function isValidSubmittedAnswer(answer, index) {
    return (
        answer === "unsure" ||
        (
            Number.isInteger(answer) &&
            answer >= 0 &&
            answer < questions[index].options.length
        )
    );
}

function loadResults() {
    let attempt;

    try {
        const saved = sessionStorage.getItem(attemptKey);

        if (!saved) {
            window.location.replace("../student/placement-intro.html");
            return;
        }

        attempt = JSON.parse(saved);

        const valid = (
            attempt?.version === 1 &&
            Array.isArray(attempt.answers) &&
            attempt.answers.length === questions.length
        );

        if (!valid) {
            throw new Error("Invalid attempt");
        }

        if (attempt.status === "in-progress") {
            window.location.replace("../student/placement-question.html");
            return;
        }

        if (
            attempt.status !== "submitted" ||
            !attempt.answers.every(isValidSubmittedAnswer)
        ) {
            throw new Error("Invalid submitted answers");
        }
    } catch {
        showError(
            "Your results could not be loaded. Return to the placement introduction."
        );
        return;
    }

    const topicScores = new Map();
    let correctCount = 0;
    let unsureCount = 0;

    questions.forEach(function (question, index) {
        const answer = attempt.answers[index];
        const isCorrect = answer === question.correct;

        if (isCorrect) {
            correctCount++;
        }

        if (answer === "unsure") {
            unsureCount++;
        }

        if (!topicScores.has(question.topic)) {
            topicScores.set(question.topic, {
                topic: question.topic,
                correct: 0,
                total: 0
            });
        }

        const score = topicScores.get(question.topic);
        score.total++;

        if (isCorrect) {
            score.correct++;
        }
    });

    const percentage = Math.round(
        correctCount / questions.length * 100
    );

    percentageElement.textContent = `${percentage}%`;
    countElement.textContent =
        `${correctCount} of ${questions.length} correct`;

    responseSummary.textContent =
        `${questions.length - unsureCount} options selected · ` +
        `${unsureCount} marked “I’m not sure”`;

    renderTopicScores([...topicScores.values()]);
    renderSubmittedAnswers(attempt.answers);

    resultsMessage.textContent = "";
    resultsMessage.classList.remove("is-error");
    resultsContent.hidden = false;
}

function renderTopicScores(scores) {
    topicResults.replaceChildren();

    scores.forEach(function (score) {
        const row = document.createElement("div");
        row.className = "topic-result";

        const heading = document.createElement("div");
        heading.className = "topic-result-heading";

        const topicName = document.createElement("strong");
        topicName.textContent = score.topic;

        const count = document.createElement("span");
        count.textContent = `${score.correct} / ${score.total} correct`;

        const progress = document.createElement("progress");
        progress.max = score.total;
        progress.value = score.correct;
        progress.setAttribute(
            "aria-label",
            `${score.topic}: ${score.correct} of ${score.total} correct`
        );

        heading.append(topicName, count);
        row.append(heading, progress);
        topicResults.append(row);
    });

    const minimumRatio = Math.min(
        ...scores.map(function (score) {
            return score.correct / score.total;
        })
    );

    if (minimumRatio === 1) {
        practiceSuggestion.textContent =
            "You answered all placement questions correctly. " +
            "Apply that understanding in the learning tasks and final project.";
        return;
    }

    const priorityTopics = scores.filter(function (score) {
        return score.correct / score.total === minimumRatio;
    }).map(function (score) {
        return score.topic;
    });

    practiceSuggestion.textContent =
        `Give extra attention to ${priorityTopics.join(" and ")}. ` +
        "These topics had the lowest correct-answer rate in this short assessment. " +
        "Continue through the learning path to practise them.";
}

function renderSubmittedAnswers(answers) {
    submittedAnswers.replaceChildren();

    questions.forEach(function (question, index) {
        const answer = answers[index];

        const article = document.createElement("article");
        article.className = "submitted-answer";

        const title = document.createElement("h3");
        title.textContent = `${index + 1}. ${question.title}`;

        const code = document.createElement("pre");
        code.className = "question-code";

        const codeText = document.createElement("code");
        codeText.textContent = question.code;
        code.append(codeText);

        const chosen = document.createElement("p");
        chosen.textContent = answer === "unsure"
            ? "Your response: I’m not sure"
            : `Your answer: ${question.options[answer]}`;

        const correct = document.createElement("p");
        correct.textContent =
            `Correct answer: ${question.options[question.correct]}`;

        const result = document.createElement("span");
        result.className = "answer-result";

        result.textContent = answer === "unsure"
            ? "Not sure · 0 points"
            : answer === question.correct
                ? "Correct"
                : "Incorrect";

        article.append(title, code, chosen, correct, result);
        submittedAnswers.append(article);
    });
}

window.addEventListener("pageshow", loadResults);
})();
