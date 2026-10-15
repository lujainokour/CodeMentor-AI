(() => {
if (window.learningUnavailable) return;
const parameters = new URLSearchParams(window.location.search);

const taskNames = {
    "student-profile": "Create a student profile",
    receipt: "Build a simple receipt"
};

const lessonNames = {
    variables: "Variables and values",
    "data-types": "Data types",
    "input-output": "Input and output",
    numbers: "Working with numbers"
};

const requestedTask = parameters.get("task");
const requestedLesson = parameters.get("lesson");

const taskId = Object.hasOwn(taskNames, requestedTask)
    ? requestedTask
    : null;

const lessonId = !taskId && Object.hasOwn(lessonNames, requestedLesson)
    ? requestedLesson
    : null;

const contextId = taskId || lessonId || "general";
const conversationKey = `codementor-demo-chat-${contextId}`;

const messagesContainer = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatStatus = document.getElementById("chat-status");

const clearDialog = document.getElementById("clear-dialog");
const welcomeText =
    "Welcome! This demo uses prepared explanations. " +
    "Try asking about variables, input(), numbers or range().";

let messages = [];
let storageReadable = true;

function configureContext() {
    const name = document.getElementById("context-name");
    const link = document.getElementById("context-link");

    if (taskId) {
        name.textContent = taskNames[taskId];
        link.href = `../student/workspace.html?task=${taskId}`;
        link.textContent = "Back to task";

        try {
            const saved = sessionStorage.getItem(
                `codementor-demo-code-${taskId}`
            );

            if (saved) {
                const draft = JSON.parse(saved);

                if (
                    draft?.version === 1 &&
                    draft.taskId === taskId &&
                    typeof draft.code === "string"
                ) {
                    document.getElementById("context-code-text")
                        .textContent = draft.code;

                    document.getElementById("context-code").hidden = false;

                    document.getElementById("code-context-note").textContent =
                        "Saved draft shown for reference. Demo replies do not analyse it.";
                }
            }
        } catch {
            document.getElementById("code-context-note").textContent =
                "Your saved code could not be loaded.";
        }
    } else if (lessonId) {
        name.textContent = lessonNames[lessonId];
        link.href = `../student/lesson.html?lesson=${lessonId}`;
        link.textContent = "Back to lesson";
    }
}

function appendMessage(role, text) {
    const article = document.createElement("article");
    article.className = "chat-message";

    article.classList.toggle("is-user", role === "user");

    const label = document.createElement("span");
    label.className = "chat-message-label";
    label.textContent = role === "user"
        ? "You"
        : "Mentor · Prepared demo response";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    article.append(label, paragraph);
    messagesContainer.append(article);
}

function renderConversation() {
    messagesContainer.replaceChildren();
    appendMessage("mentor", welcomeText);

    messages.forEach(function (message) {
        appendMessage(message.role, message.text);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function loadConversation() {
    try {
        const saved = sessionStorage.getItem(conversationKey);

        if (!saved) {
            return;
        }

        const parsed = JSON.parse(saved);

        if (
            !Array.isArray(parsed) ||
            parsed.length > 100 ||
            !parsed.every(function (message) {
                return (
                    ["user", "mentor"].includes(message?.role) &&
                    typeof message.text === "string" &&
                    message.text.length <= 4000
                );
            })
        ) {
            throw new Error("Invalid conversation");
        }

        messages = parsed;
    } catch {
        storageReadable = false;
        chatStatus.textContent =
            "Saved conversation could not be loaded. " +
            "New messages will not overwrite it. Clear chat to start fresh.";
    }
}

/*
    These responses do not analyse arbitrary code.
*/
function getDemoReply(question) {
    const text = question.toLowerCase();

    if (/range|loop|لوب|حلقة/.test(text)) {
        return (
            "range(start, stop) includes start but excludes stop.\n" +
            "For example, range(1, 5) produces 1, 2, 3 and 4.\n" +
            "To include 5, think about the stop value you would need."
        );
    }

    if (/input|إدخال|ادخال/.test(text)) {
        return (
            "input() returns a string.\n" +
            'If someone enters 21, the value is the text "21".\n' +
            "Use int() for whole-number input or float() for decimal input."
        );
    }

    if (/variable|متغير|متغيّر/.test(text)) {
        return (
            "A variable is a name that refers to a value.\n" +
            'Example: name = "Lujain"\n' +
            "Assigning a new value to name changes what it refers to."
        );
    }

    if (/type|نوع|أنواع|انواع/.test(text)) {
        return (
            "Common Python types include:\n" +
            "str: text\nint: whole numbers\nfloat: decimal numbers\n" +
            "bool: True or False\nUse type(value) to inspect a value’s type."
        );
    }

    if (/receipt|total|فاتورة|مجموع|number|رقم|أرقام|ارقام/.test(text)) {
        return (
            "Convert numeric input before calculating.\n" +
            "For a receipt, think about price × quantity.\n" +
            'The format f"{total:.2f}" displays two decimal places.'
        );
    }

    return (
        "This demo cannot generate a custom answer yet.\n" +
        "Try a question about variables, data types, input() or range(). " +
        "Contextual AI replies will be available after the backend connection."
    );
}

function sendMessage() {
    const text = chatInput.value.trim();

    if (!text) {
        chatStatus.textContent = "Enter a question first.";
        chatInput.focus();
        return;
    }

    if (text.length > 2000) {
        chatStatus.textContent = "Use no more than 2,000 characters.";
        return;
    }

    messages.push(
        { role: "user", text: text },
        { role: "mentor", text: getDemoReply(text) }
    );

    /* Keep the latest 50 exchanges */
    messages = messages.slice(-100);

    chatInput.value = "";
    chatStatus.textContent = "";

    renderConversation();

    if (!storageReadable) {
        chatStatus.textContent =
            "Messages shown for this visit only. Clear chat to enable saving.";
        return;
    }

    try {
        sessionStorage.setItem(
            conversationKey,
            JSON.stringify(messages)
        );
    } catch {
        chatStatus.textContent =
            "Conversation displayed, but it could not be saved.";
    }
}

chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage();
});

chatInput.addEventListener("keydown", function (event) {
    if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing
    ) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

document.querySelectorAll("[data-question]").forEach(function (button) {
    button.addEventListener("click", function () {
        chatInput.value = button.dataset.question;
        chatInput.focus();
    });
});

document.getElementById("clear-chat").addEventListener("click", function () {
    clearDialog.showModal();
});

document.getElementById("cancel-clear").addEventListener("click", function () {
    clearDialog.close();
});

document.getElementById("confirm-clear").addEventListener("click", function () {
    try {
        sessionStorage.removeItem(conversationKey);
    } catch {
        clearDialog.close();
        chatStatus.textContent =
            "Couldn’t clear the saved conversation. Try again.";
        return;
    }

    messages = [];
    storageReadable = true;
    chatStatus.textContent = "";

    renderConversation();
    clearDialog.close();
    chatInput.focus();
});

configureContext();
loadConversation();
renderConversation();
})();
