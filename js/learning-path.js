(() => {
if (window.learningUnavailable) return;
const unlockDialog = document.getElementById("unlock-dialog");
const unlockTitle = document.getElementById("unlock-title");
const unlockDescription = document.getElementById("unlock-description");
const closeUnlockButton = document.getElementById("close-unlock");

const levelNames = {
    1: "Python Foundations",
    2: "Logic and Control Flow",
    3: "Functions and Collections",
    4: "Final Project"
};

document.querySelectorAll("[data-locked-level]").forEach(function (button) {
    button.addEventListener("click", function () {
        const level = Number(button.dataset.lockedLevel);
        const previousLevel = level - 1;

        unlockTitle.textContent =
            `Level ${String(level).padStart(2, "0")} is locked`;

        unlockDescription.textContent =
            `To unlock ${levelNames[level]}, complete all required ` +
            `lessons and tasks in Level ${String(previousLevel).padStart(2, "0")}: ` +
            `${levelNames[previousLevel]}, and score at least 70% ` +
            "in its assessment. Only Level 01 content is available in this frontend demo. " +
            "Later levels remain unavailable even if local prerequisite records are complete.";

        unlockDialog.showModal();
    });
});

closeUnlockButton.addEventListener("click", function () {
    unlockDialog.close();
});
})();
