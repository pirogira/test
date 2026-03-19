const STORAGE_KEY = "landing-content-v1";
let defaultContent = null;
let state = null;

function clone(data) {
    return JSON.parse(JSON.stringify(data));
}

async function loadDefaultContent() {
    const response = await fetch("content/default-content.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Cannot load default content");
    return response.json();
}

function loadSavedContent() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    showStatus("Сохранено");
}

function showStatus(text) {
    const el = document.getElementById("status");
    if (!el) return;
    el.textContent = text;
    setTimeout(() => {
        if (el.textContent === text) el.textContent = "";
    }, 2500);
}

function linksToText(links) {
    return (links || []).map((item) => `${item.label}|${item.url}`).join("\n");
}

function textToLinks(value) {
    return value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [label, url] = line.split("|");
            return { label: (label || "").trim(), url: (url || "#").trim() };
        });
}

function bindSimpleFields() {
    const map = {
        "seo-title": () => state.seo.title,
        "seo-description": () => state.seo.description,
        "topbar-time": () => state.topbar.workTime,
        "topbar-phone": () => state.topbar.phone,
        "hero-title": () => state.hero.title,
        "hero-body": () => state.hero.body,
        "hero-image": () => state.hero.image,
        "hero-button-text": () => state.hero.buttonText,
        "hero-button-url": () => state.hero.buttonUrl,
        benefits: () => state.benefits.join("\n"),
        "online-title": () => state.online.title,
        "online-links": () => linksToText(state.online.links),
        "cta-title": () => state.cta.title,
        "cta-body": () => state.cta.body,
        "cta-button-text": () => state.cta.buttonText,
        "cta-button-url": () => state.cta.buttonUrl,
        "side-1-title": () => state.sidebar.primary.title,
        "side-1-body": () => state.sidebar.primary.body,
        "side-1-button-text": () => state.sidebar.primary.buttonText,
        "side-1-button-url": () => state.sidebar.primary.buttonUrl,
        "side-2-title": () => state.sidebar.links.title,
        "side-2-links": () => linksToText(state.sidebar.links.items),
        "side-3-title": () => state.sidebar.contacts.title,
        "side-3-address": () => state.sidebar.contacts.address,
        "side-3-phone": () => state.sidebar.contacts.phone,
        "side-3-email": () => state.sidebar.contacts.email
    };

    Object.entries(map).forEach(([id, getter]) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.value = getter();
        input.oninput = () => {
            switch (id) {
                case "seo-title": state.seo.title = input.value.trim(); break;
                case "seo-description": state.seo.description = input.value.trim(); break;
                case "topbar-time": state.topbar.workTime = input.value.trim(); break;
                case "topbar-phone": state.topbar.phone = input.value.trim(); break;
                case "hero-title": state.hero.title = input.value.trim(); break;
                case "hero-body": state.hero.body = input.value.trim(); break;
                case "hero-image": state.hero.image = input.value.trim(); break;
                case "hero-button-text": state.hero.buttonText = input.value.trim(); break;
                case "hero-button-url": state.hero.buttonUrl = input.value.trim(); break;
                case "benefits": state.benefits = input.value.split("\n").map((line) => line.trim()).filter(Boolean); break;
                case "online-title": state.online.title = input.value.trim(); break;
                case "online-links": state.online.links = textToLinks(input.value); break;
                case "cta-title": state.cta.title = input.value.trim(); break;
                case "cta-body": state.cta.body = input.value.trim(); break;
                case "cta-button-text": state.cta.buttonText = input.value.trim(); break;
                case "cta-button-url": state.cta.buttonUrl = input.value.trim(); break;
                case "side-1-title": state.sidebar.primary.title = input.value.trim(); break;
                case "side-1-body": state.sidebar.primary.body = input.value.trim(); break;
                case "side-1-button-text": state.sidebar.primary.buttonText = input.value.trim(); break;
                case "side-1-button-url": state.sidebar.primary.buttonUrl = input.value.trim(); break;
                case "side-2-title": state.sidebar.links.title = input.value.trim(); break;
                case "side-2-links": state.sidebar.links.items = textToLinks(input.value); break;
                case "side-3-title": state.sidebar.contacts.title = input.value.trim(); break;
                case "side-3-address": state.sidebar.contacts.address = input.value.trim(); break;
                case "side-3-phone": state.sidebar.contacts.phone = input.value.trim(); break;
                case "side-3-email": state.sidebar.contacts.email = input.value.trim(); break;
                default: break;
            }
        };
    });
}

function renderServicesEditor() {
    const root = document.getElementById("services-editor");
    if (!root) return;
    root.innerHTML = "";
    state.services.forEach((service, index) => {
        const item = document.createElement("div");
        item.className = "service-item";
        item.innerHTML = `
            <div class="service-head">
                <span>Карточка ${index + 1}</span>
                <div class="service-actions">
                    <button type="button" data-action="up">Вверх</button>
                    <button type="button" data-action="down">Вниз</button>
                    <button type="button" data-action="remove">Удалить</button>
                </div>
            </div>
            <label>Заголовок</label>
            <input type="text" data-field="title" value="${service.title}">
            <label>Текст</label>
            <textarea rows="3" data-field="body">${service.body}</textarea>
            <label>Текст кнопки</label>
            <input type="text" data-field="buttonText" value="${service.buttonText}">
            <label>Ссылка кнопки</label>
            <input type="text" data-field="buttonUrl" value="${service.buttonUrl}">
        `;

        item.querySelectorAll("input, textarea").forEach((field) => {
            field.addEventListener("input", () => {
                const key = field.dataset.field;
                state.services[index][key] = field.value.trim();
            });
        });

        item.querySelectorAll(".service-actions button").forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.action;
                if (action === "up" && index > 0) {
                    [state.services[index - 1], state.services[index]] = [state.services[index], state.services[index - 1]];
                }
                if (action === "down" && index < state.services.length - 1) {
                    [state.services[index + 1], state.services[index]] = [state.services[index], state.services[index + 1]];
                }
                if (action === "remove") {
                    state.services.splice(index, 1);
                }
                renderServicesEditor();
            });
        });

        root.appendChild(item);
    });
}

function bindActions() {
    document.getElementById("add-service")?.addEventListener("click", () => {
        state.services.push({
            title: "Новая карточка",
            body: "Текст новой карточки",
            buttonText: "Узнать подробнее",
            buttonUrl: "#contact"
        });
        renderServicesEditor();
    });

    document.getElementById("save-content")?.addEventListener("click", save);

    document.getElementById("reset-content")?.addEventListener("click", () => {
        state = clone(defaultContent);
        localStorage.removeItem(STORAGE_KEY);
        initForm();
        showStatus("Сброшено к дефолту");
    });

    document.getElementById("export-content")?.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "landing-content.json";
        link.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById("import-content")?.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            state = JSON.parse(text);
            initForm();
            save();
            showStatus("Импорт выполнен");
        } catch (error) {
            showStatus("Ошибка импорта");
        }
    });
}

function initForm() {
    bindSimpleFields();
    renderServicesEditor();
}

async function init() {
    defaultContent = await loadDefaultContent();
    state = loadSavedContent() || clone(defaultContent);
    initForm();
    bindActions();
}

init().catch(() => {
    showStatus("Ошибка загрузки админки");
});
