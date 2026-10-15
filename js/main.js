const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.getElementById("navigation");

function closeMenu() {
    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
}

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", function () {
        const isOpen = navigation.classList.toggle("is-open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );
    });

    navigation.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            navigation.classList.contains("is-open")
        ) {
            closeMenu();
            menuToggle.focus();
        }
    });

    document.addEventListener("click", function (event) {
        if (
            !navigation.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMenu();
        }
    });

    const desktopScreen = window.matchMedia("(min-width: 901px)");

    desktopScreen.addEventListener("change", function (event) {
        if (event.matches) {
            closeMenu();
        }
    });
}

const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}