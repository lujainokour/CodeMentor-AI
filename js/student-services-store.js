/* Shared version-1 readers and writers for owner-scoped local service records. */
(() => {
    "use strict";
    const languages = window.languageCatalog.names;
    const sessionKey = "codementor-demo-session";
    const keys = { booking: "codementor-demo-peer-bookings", request: "codementor-demo-service-requests", draft: "codementor-demo-service-drafts" };
    function session() {
        const raw = sessionStorage.getItem(sessionKey);
        if (raw === null) throw new Error("Sign in to a student demo account before saving. Nothing has been sent.");
        let value;
        try { value = JSON.parse(raw); } catch { throw new Error("Saved account data could not be read. Your records have not been changed."); }
        if (!value || value.role !== "student" || value.isDemo !== true || typeof value.name !== "string" || !value.name.trim() || typeof value.email !== "string" || !value.email.trim()) {
            throw new Error("A valid student demo session is required. Your records have not been changed.");
        }
        return value;
    }
    const text = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
    function validRecord(record, type) {
        if (!record || !text(record.id, 100) || !text(record.owner, 254) || !text(record.createdAt, 40) || !Number.isFinite(Date.parse(record.createdAt))) return false;
        if (type === "booking") return text(record.mentorId, 100) && text(record.slot, 100) && text(record.notes, 1000) && record.status === "local-simulation";
        if (type === "request") return text(record.serviceId, 100) && text(record.brief, 1200) && record.status === "local-simulation";
        return text(record.title, 80) && text(record.description, 1000) && text(record.skills, 200) && languages.includes(record.language) && Number.isFinite(record.price) && record.price > 0 && record.price <= 10000 && Number.isInteger(record.days) && record.days >= 1 && record.days <= 180 && record.status === "draft";
    }
    function readRecords(type) {
        const raw = sessionStorage.getItem(keys[type]);
        if (raw === null) return { version: 1, records: [] };
        let value;
        try { value = JSON.parse(raw); } catch { throw new Error("Saved local records could not be read. They have not been changed."); }
        if (!value || value.version !== 1 || !Array.isArray(value.records) || !value.records.every(record => validRecord(record, type))) {
            throw new Error("Saved local records are invalid. They have not been changed.");
        }
        return value;
    }
    function save(type, values, expectedOwner) {
        const owner = session().email;
        if (owner !== expectedOwner) throw new Error("Your demo account changed. Reload this page before saving.");
        const store = readRecords(type);
        const record = { ...values, id: `local-${crypto.randomUUID()}`, owner, createdAt: new Date().toISOString() };
        if (!validRecord(record, type)) throw new Error("Check the form values. Nothing was saved.");
        if (type === "booking" && store.records.some(item => item.owner === owner && item.mentorId === record.mentorId && item.slot === record.slot)) throw new Error("This demo slot is already in your local requests. Choose another slot.");
        sessionStorage.setItem(keys[type], JSON.stringify({ ...store, records: [...store.records, record] }));
        return record;
    }
    function ownRecords(type, expectedOwner) {
        const owner = session().email;
        if (expectedOwner !== undefined && owner !== expectedOwner) throw new Error("Your demo account changed. Reload before reading private records.");
        return readRecords(type).records.filter(record => record.owner === owner);
    }
    window.studentServicesStore = Object.freeze({ session, readRecords, ownRecords, save });
})();
