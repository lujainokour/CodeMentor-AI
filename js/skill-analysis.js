(() => {
if (window.learningUnavailable) return;
const questions = window.placementQuestions;

const content = document.getElementById("analysis-content");
const emptyState = document.getElementById("analysis-empty");
const message = document.getElementById("workspace-message");

const topicsContainer = document.getElementById("analysis-topics");
const priorityDescription = document.getElementById("priority-description");
const priorityList = document.getElementById("priority-topics");
const priorityLink = document.getElementById("priority-link");
const placementLink = document.getElementById("analysis-placement-link");

function showError(text) {
    content.hidden = true;
    emptyState.hidden = false;

    message.textContent = text;
    message.classList.add("is-error");
}

function isValidAnswer(answer, index) {
    return (
        answer === "unsure" ||
        (
            Number.isInteger(answer) &&
            answer >= 0 &&
            answer < questions[index].options.length
        )
    );
}

function renderTopics(scores) {
    topicsContainer.replaceChildren();

    scores.forEach(function (score) {
        const row = document.createElement("div");
        row.className = "topic-result";

        const heading = document.createElement("div");
        heading.className = "topic-result-heading";

        const title = document.createElement("strong");
        title.textContent = score.topic;

        const count = document.createElement("span");
        count.textContent =
            `${score.correct} / ${score.total} correct`;

        const bar = document.createElement("progress");
        bar.max = score.total;
        bar.value = score.correct;

        bar.setAttribute(
            "aria-label",
            `${score.topic}: ${score.correct} of ${score.total} correct`
        );

        const evidence = document.createElement("p");
        evidence.className = "dashboard-footnote";

        evidence.textContent =
            `${score.incorrect} incorrect · ` +
            `${score.unsure} marked “I’m not sure”`;

        heading.append(title, count);
        row.append(heading, bar, evidence);
        topicsContainer.append(row);
    });
}

function renderPriorities(scores) {
    priorityList.replaceChildren();

    const lowestRatio = Math.min(
        ...scores.map(function (score) {
            return score.correct / score.total;
        })
    );

    if (lowestRatio === 1) {
        priorityDescription.textContent =
            "You answered all placement questions correctly. " +
            "Apply that understanding in practical tasks.";

        priorityLink.href = "../student/module.html?level=1";
        priorityLink.textContent = "Continue learning";

        return;
    }

    const priorities = scores.filter(function (score) {
        return score.correct / score.total === lowestRatio;
    });

    priorityDescription.textContent =
        "These topics had the lowest correct-answer rate " +
        "in your placement assessment:";

    priorities.forEach(function (score) {
        const item = document.createElement("li");
        item.textContent = score.topic;
        priorityList.append(item);
    });

    const includesFoundations = priorities.some(function (score) {
        return score.topic === "Variables and data types";
    });

    if (includesFoundations) {
        priorityLink.href = "../student/lesson.html?lesson=data-types";
        priorityLink.textContent = "Review data types";
    } else {
        priorityLink.href = "../student/learning-path.html";
        priorityLink.textContent = "View learning path";
    }
}

function loadAnalysis() {
    content.hidden = true;
    emptyState.hidden = true;
    message.textContent = "";
    message.classList.remove("is-error");

    placementLink.textContent = "Start placement";

    try {
        const saved = sessionStorage.getItem(
            "codementor-demo-placement"
        );

        if (!saved) {
            emptyState.hidden = false;
            return;
        }

        const attempt = JSON.parse(saved);

        if (
            attempt?.version !== 1 ||
            !Array.isArray(attempt.answers) ||
            attempt.answers.length !== questions.length
        ) {
            throw new Error("Invalid placement");
        }

        if (attempt.status === "in-progress") {
            emptyState.hidden = false;
            placementLink.textContent = "Resume placement";
            return;
        }

        if (
            attempt.status !== "submitted" ||
            !attempt.answers.every(isValidAnswer)
        ) {
            throw new Error("Invalid submitted answers");
        }

        const topicMap = new Map();

        questions.forEach(function (question, index) {
            if (!topicMap.has(question.topic)) {
                topicMap.set(question.topic, {
                    topic: question.topic,
                    total: 0,
                    correct: 0,
                    incorrect: 0,
                    unsure: 0
                });
            }

            const score = topicMap.get(question.topic);
            const answer = attempt.answers[index];

            score.total++;

            if (answer === "unsure") {
                score.unsure++;
            } else if (answer === question.correct) {
                score.correct++;
            } else {
                score.incorrect++;
            }
        });

        const scores = [...topicMap.values()];

        renderTopics(scores);
        renderPriorities(scores);

        content.hidden = false;
    } catch {
        showError(
            "Your placement evidence could not be loaded. " +
            "Your saved answers have not been changed."
        );
    }
}

window.addEventListener("pageshow", loadAnalysis);
})();
