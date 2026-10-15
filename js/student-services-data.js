/* Public demo records only. Never derive these records from private account data. */
(() => {
    const students = [
        { id: "demo-maya", name: "Maya Haddad", initials: "MH", language: "Python", learning: ["Python", "C++"], skills: ["Python", "Functions", "Data handling"], bio: "Sample student profile exploring small tools that make everyday tasks easier.", projects: [{ title: "Study planner", description: "Demo portfolio concept: a console planner for study sessions." }], links: [] },
        { id: "demo-omar", name: "Omar Saleh", initials: "OS", language: "C#", learning: ["C#"], skills: ["C#", "OOP", "Console apps"], bio: "Sample student profile focused on readable code and object-oriented design.", projects: [{ title: "Library organiser", description: "Demo portfolio concept: organise a small collection with a console application." }], links: [] },
        { id: "demo-nour", name: "Nour Khalil", initials: "NK", language: "C++", learning: ["C++", "Python"], skills: ["C++", "Algorithms", "Problem solving"], bio: "Sample student profile interested in algorithms and explaining ideas step by step.", projects: [{ title: "Algorithm notebook", description: "Demo portfolio concept: annotated examples of sorting and searching." }], links: [] }
    ];
    const mentors = [
        { id: "demo-python", studentId: "demo-maya", language: "Python", skills: ["Functions", "Debugging", "Lists"], topic: "Understand Python functions", description: "Walk through parameters, return values and small debugging exercises with a peer.", duration: 45, price: 12, currency: "JOD", demoAdminApproved: true },
        { id: "demo-csharp", studentId: "demo-omar", language: "C#", skills: ["Classes", "OOP", "Console apps"], topic: "Your first C# classes", description: "Discuss objects, constructors and how to structure a small console program.", duration: 60, price: 16, currency: "JOD", demoAdminApproved: true },
        { id: "demo-cpp", studentId: "demo-nour", language: "C++", skills: ["Loops", "Vectors", "Algorithms"], topic: "Solve problems with C++ vectors", description: "Practise choosing a loop and working through a vector-based problem.", duration: 45, price: 14, currency: "JOD", demoAdminApproved: true }
    ];
    const services = [
        { id: "demo-script", studentId: "demo-maya", language: "Python", title: "A small Python utility script", description: "A sample offer for a simple script that organises local text files. Scope would be agreed before any real work.", skills: ["Python", "File handling"], price: 25, days: 3, deliverables: ["One small script", "A short usage guide"], currency: "JOD" },
        { id: "demo-console", studentId: "demo-omar", language: "C#", title: "A C# console application prototype", description: "A sample offer to prototype a small console workflow with a simple menu and clear code structure.", skills: ["C#", "OOP", "Console apps"], price: 40, days: 5, deliverables: ["Console application source", "Setup notes"], currency: "JOD" },
        { id: "demo-algorithm", studentId: "demo-nour", language: "C++", title: "Explain and review a C++ algorithm", description: "A sample offer to annotate an algorithm and explain its approach. No assessed coursework will be completed on someone else's behalf.", skills: ["C++", "Algorithms"], price: 20, days: 2, deliverables: ["Annotated code review", "Explanation notes"], currency: "JOD" }
    ];
    window.studentServicesData = { students, mentors, services };
})();
