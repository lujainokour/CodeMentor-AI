(() => {
    const courses = [
        {
            id: "python-foundations",
            title: "Python Foundations",
            languageId: "python",
            languageName: "Python",
            description:
                "Build programming foundations with Python.",
            status: "draft",
            version: 1
        },
        {
            id: "csharp-foundations",
            title: "C# Foundations",
            languageId: "csharp",
            languageName: "C#",
            description:
                "Learn programming fundamentals with C#.",
            status: "draft",
            version: 1
        },
        {
            id: "cpp-foundations",
            title: "C++ Foundations",
            languageId: "cpp",
            languageName: "C++",
            description:
                "Explore programming fundamentals with C++.",
            status: "draft",
            version: 1
        }
    ];

    window.adminCourseData = Object.freeze(
        courses.map(course => Object.freeze(course))
    );
})();