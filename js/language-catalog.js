/* Add languages here. Existing ids are stable storage keys. Content readiness is explicit. */
(() => {
    const entries = [
        { id: "python", name: "Python", description: "Readable programming for scripting, automation and data.", builtInContent: true },
        { id: "csharp", name: "C#", description: "Structured applications with the .NET ecosystem." },
        { id: "cpp", name: "C++", description: "Systems programming and performance-oriented applications." },
        { id: "javascript", name: "JavaScript", description: "Interactive web experiences and general-purpose scripting." },
        { id: "typescript", name: "TypeScript", description: "Typed JavaScript for maintainable applications." },
        { id: "java", name: "Java", description: "Object-oriented applications on the Java platform." },
        { id: "c", name: "C", description: "Low-level programming and systems foundations." },
        { id: "go", name: "Go", description: "Simple, concurrent server and systems applications." },
        { id: "rust", name: "Rust", description: "Memory-conscious systems programming." },
        { id: "php", name: "PHP", description: "Server-side web application development." },
        { id: "ruby", name: "Ruby", description: "Expressive scripting and web applications." },
        { id: "swift", name: "Swift", description: "Applications for the Apple platform ecosystem." },
        { id: "kotlin", name: "Kotlin", description: "Modern applications on Android and the JVM." }
    ].map(entry => Object.freeze({ builtInContent: false, ...entry }));
    const labels = Object.freeze(Object.fromEntries(entries.map(entry => [entry.id, entry.name])));
    function populateSelect(select, statuses = false) {
        const current = select.value;
        select.replaceChildren(...entries.map(entry => {
            const option = document.createElement("option"); option.value = entry.id;
            option.textContent = entry.name + (statuses && !entry.builtInContent ? " — Coming soon / local content only" : ""); return option;
        }));
        if (Object.hasOwn(labels, current)) select.value = current;
    }
    window.languageCatalog = Object.freeze({ entries: Object.freeze(entries), labels, names: Object.freeze(entries.map(entry => entry.name)), has: id => Object.hasOwn(labels, id), get: id => entries.find(entry => entry.id === id), populateSelect });
})();
