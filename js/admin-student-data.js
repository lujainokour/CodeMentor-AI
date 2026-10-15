(() => {
    const storageKey = "codementor-demo-admin-account-status";

    const students = [
        {
            id: "demo-001",
            name: "Maya Hassan",
            email: "maya@example.com",
            learningPath: "Python",
            languageId: "python",
            currentLevel: "Level 01",
            status: "enabled",
            lastActivity: "2026-10-10"
        },
        {
            id: "demo-002",
            name: "Omar Ali",
            email: "omar@example.com",
            learningPath: "Python",
            languageId: "python",
            currentLevel: "Level 02",
            status: "enabled",
            lastActivity: "2026-10-09"
        },
        {
            id: "demo-003",
            name: "Sara Khaled",
            email: "sara@example.com",
            learningPath: "Python",
            languageId: "python",
            currentLevel: "Level 01",
            status: "suspended",
            lastActivity: "2026-10-04"
        },
        {
            id: "demo-004",
            name: "Adam Nasser",
            email: "adam@example.com",
            learningPath: "Python",
            languageId: "python",
            currentLevel: "Level 03",
            status: "enabled",
            lastActivity: "2026-10-08"
        }
    ];

    function readStatuses() {
        const stored = sessionStorage.getItem(storageKey);

        if (stored === null) {
            return {};
        }

        const statuses = JSON.parse(stored);

        if (
            !statuses ||
            typeof statuses !== "object" ||
            Array.isArray(statuses)
        ) {
            throw new Error("Invalid account status data.");
        }

        Object.entries(statuses).forEach(([id, status]) => {
            const knownStudent = students.some(
                student => student.id === id
            );

            if (
                !knownStudent ||
                !["enabled", "suspended"].includes(status)
            ) {
                throw new Error("Invalid account status data.");
            }
        });

        return statuses;
    }

    function publishStudents(statuses) {
        window.adminStudentData = Object.freeze(
            students.map(student => Object.freeze({
                ...student,
                status: statuses[student.id] ?? student.status
            }))
        );
    }

    let loadError = "";

    try {
        publishStudents(readStatuses());
    } catch {
        loadError =
            "Saved demo account statuses could not be loaded. " +
            "The original sample statuses are shown.";

        publishStudents({});
    }

    window.adminStudentStore = Object.freeze({
        get loadError() {
            return loadError;
        },

        setStatus(id, status) {
            const student = students.find(item => item.id === id);

            if (
                !student ||
                !["enabled", "suspended"].includes(status)
            ) {
                throw new Error("Invalid student or account status.");
            }

            const statuses = readStatuses();
            statuses[id] = status;

            sessionStorage.setItem(
                storageKey,
                JSON.stringify(statuses)
            );

            publishStudents(statuses);
            loadError = "";
        }
    });
})();