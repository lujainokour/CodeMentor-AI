/*
    Shared student navigation for the frontend demo.
    Browser storage is not real authentication.
*/
(function () {
    if (window.workspaceShellManaged) return;
    const accountName = document.getElementById("account-name");
    const accountInitials = document.getElementById("account-initials");
    const workspaceMessage = document.getElementById("workspace-message");

    const sidebar = document.getElementById("workspace-sidebar");
    const menuToggle = document.getElementById("workspace-menu-toggle");
    const logoutButton = document.getElementById("logout-button");
    const studentNavigation = document.querySelector('.workspace-navigation[aria-label="Student navigation"]');
    if (studentNavigation) {
        [
            ["../services/community.html", "Student Community"],
            ["../services/peer-mentoring.html", "Peer Mentoring"],
            ["../services/showcase.html", "Student Showcase"],
            ["../services/freelance-services.html", "Student services"]
        ].forEach(([href, label]) => {
            if (studentNavigation.querySelector(`a[href="${href}"]`)) return;
            const link = document.createElement("a");
            link.href = href;
            link.textContent = label;
            studentNavigation.append(link);
        });
    }

    function showWorkspaceMessage(text) {
        if (workspaceMessage) {
            workspaceMessage.textContent = text;
            workspaceMessage.classList.add("is-error");
        }
    }

    function loadProfile() {
        try {
            const saved = sessionStorage.getItem(
                "codementor-demo-session"
            );

            if (!saved) {
                return;
            }

            const profile = JSON.parse(saved);

            if (
                typeof profile?.name !== "string" ||
                !profile.name.trim()
            ) {
                return;
            }

            const name = profile.name.trim();

            const initials = name
                .split(/\s+/)
                .slice(0, 2)
                .map(function (word) {
                    return Array.from(word)[0];
                })
                .join("")
                .toUpperCase();

            if (accountName) {
                accountName.textContent = name;
            }

            if (accountInitials) {
                accountInitials.textContent = initials;
            }
        } catch {
            showWorkspaceMessage("Your demo profile could not be loaded.");
        }
    }

    function closeSidebar() {
        if (!sidebar || !menuToggle) {
            return;
        }

        sidebar.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
    }

    if (sidebar && menuToggle) {
        menuToggle.addEventListener("click", function () {
            const isOpen = sidebar.classList.toggle("is-open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );
        });

        document.addEventListener("keydown", function (event) {
            if (
                event.key === "Escape" &&
                sidebar.classList.contains("is-open")
            ) {
                closeSidebar();
                menuToggle.focus();
            }
        });

        document.addEventListener("click", function (event) {
            if (
                !sidebar.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeSidebar();
            }
        });

        sidebar.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeSidebar);
        });

        const desktopScreen = window.matchMedia("(min-width: 901px)");

        desktopScreen.addEventListener("change", function (event) {
            if (event.matches) {
                closeSidebar();
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            try {
                sessionStorage.removeItem("codementor-demo-session");
            } catch {
                showWorkspaceMessage(
                    "Couldn’t clear the demo session. Try again."
                );
                return;
            }

            window.location.href = "../auth/login.html";
        });
    }

    window.addEventListener("pageshow", loadProfile);
})();
