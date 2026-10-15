(() => {
    const root = document.getElementById("analytics-content"), message = document.getElementById("analytics-message");
    const node = (tag, text, cls) => { const element = document.createElement(tag); element.textContent = text; if (cls) element.className = cls; return element; };
    try {
        if (window.adminStudentStore.loadError) throw new Error(window.adminStudentStore.loadError);
        const students = window.adminStudentData, courses = window.courseContentStore.readCourses(), content = window.courseContentStore.readContent();
        const levels = Object.values(content.courses).flatMap(course => course.levels);
        const lessons = levels.flatMap(level => level.lessons || []);
        const stats = node("div", "", "dashboard-stats");
        [["Fictional sample students", students.length], ["Enabled sample accounts", students.filter(student => student.status === "enabled").length], ["Saved local levels", levels.length], ["Saved local lessons", lessons.length]].forEach(([label, count]) => {
            const card = node("article", "", "dashboard-stat"); card.append(node("p", label), node("h2", String(count))); stats.append(card);
        });
        root.append(stats);
        const card = node("section", "", "dashboard-card"); card.append(node("h2", "Course records by language"));
        const tableWrap = node("div", "", "analytics-table-wrap"), table = node("table", "", "analytics-table");
        const caption = node("caption", "Sample course records and saved local course drafts. These are not platform-wide enrolments."); table.append(caption);
        const head = node("thead", ""), row = node("tr", ""); ["Language", "Sample records", "Local drafts"].forEach(text => { const th = node("th", text); th.scope = "col"; row.append(th); }); head.append(row); table.append(head);
        const body = node("tbody", "");
        window.languageCatalog.entries.forEach(language => {
            const matching = courses.filter(course => (course.language || course.languageId) === language.id);
            if (!matching.length) return;
            const row = node("tr", ""); row.append(node("th", language.name), node("td", String(matching.filter(course => course.languageId).length)), node("td", String(matching.filter(course => course.language).length))); row.firstElementChild.scope = "row"; body.append(row);
        }); table.append(body); tableWrap.append(table); card.append(tableWrap); root.append(card);
        root.append(node("p", `${lessons.filter(lesson => lesson.status === "published").length} saved lessons are marked available for local preview. This is not a server publication count.`, "services-notice"));
        const scope = node("section", "", "dashboard-card"); scope.append(node("h2", "What is unavailable"), node("p", "Real account totals, attendance, revenue, learner engagement, verified completions and certificate issuance are not connected. No numbers are estimated for them.")); root.append(scope);
    } catch (error) {
        root.replaceChildren(); message.textContent = `Analytics could not read the saved demo data. ${error.message} No records were deleted or replaced.`; message.classList.add("is-error");
    }
})();
