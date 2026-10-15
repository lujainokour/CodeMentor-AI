(() => {
if (window.learningUnavailable) return;
const projectChecks = [
    {
        title: "Add study tasks",
        description:
            "Add a task with a non-empty title and a unique ID."
    },
    {
        title: "List stored tasks",
        description:
            "Display each task's ID, title and completion status."
    },
    {
        title: "Complete a task",
        description:
            "Update the selected task and handle invalid or completed IDs."
    },
    {
        title: "Handle invalid input",
        description:
            "Reject invalid menu choices without crashing."
    },
    {
        title: "Organize the program",
        description:
            "Use the required functions and a list of task dictionaries."
    },
    {
        title: "Run and exit correctly",
        description:
            "Keep the menu running until the user chooses to exit."
    },
    {
        title: "Include submission files",
        description:
            "Provide main.py and README.md inside the project ZIP."
    }
];

const checksList = document.getElementById("evaluation-checks");

projectChecks.forEach(function (check) {
    const item = document.createElement("li");
    const content = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = check.title;

    const description = document.createElement("p");
    description.textContent = check.description;

    const status = document.createElement("span");
    status.className = "evaluation-check-status";
    status.textContent = "Not evaluated";

    content.append(title, description);
    item.append(content, status);
    checksList.append(item);
});
})();
