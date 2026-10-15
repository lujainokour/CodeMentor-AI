(() => {
    if (window.workspaceShellManaged) return;
    const sidebar = document.getElementById("workspace-sidebar");
    const menuButton = document.getElementById(
        "workspace-menu-toggle"
    );
    const exitButton = document.getElementById("admin-exit-button");

    const mobileScreen = window.matchMedia("(max-width: 900px)");

    function setMenuOpen(isOpen) {
        sidebar.classList.toggle("is-open", isOpen);

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );
    }

    if (sidebar && menuButton) {
        menuButton.addEventListener("click", () => {
            const isOpen = menuButton.getAttribute(
                "aria-expanded"
            ) === "true";

            setMenuOpen(!isOpen);
        });

        document.addEventListener("click", event => {
            if (
                mobileScreen.matches &&
                !sidebar.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        });

        document.addEventListener("keydown", event => {
            if (
                event.key === "Escape" &&
                menuButton.getAttribute("aria-expanded") === "true"
            ) {
                setMenuOpen(false);
                menuButton.focus();
            }
        });

        sidebar.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                setMenuOpen(false);
            });
        });

        mobileScreen.addEventListener("change", () => {
            setMenuOpen(false);
        });

        setMenuOpen(false);
    }

    if (exitButton) {
        exitButton.addEventListener("click", () => {
            window.location.href = "../../index.html";
        });
    }
})();
