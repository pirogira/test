const STORAGE_KEY = "landing-content-v1";

function text(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
}

function attr(id, name, value) {
    const el = document.getElementById(id);
    if (el) el.setAttribute(name, value ?? "");
}

async function loadDefaultContent() {
    const response = await fetch("content/default-content.json", { cache: "no-store" });
    if (!response.ok) {
        throw new Error("Cannot load default content");
    }
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

function renderList(items, renderItem) {
    return (items || []).map(renderItem).join("");
}

function applyContent(content) {
    document.title = content.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", content.seo.description);

    text("topbar-time", content.topbar.workTime);
    text("topbar-phone", content.topbar.phone);

    text("hero-title", content.hero.title);
    text("hero-body", content.hero.body);
    text("cta-title", content.cta.title);
    text("cta-body", content.cta.body);
    text("online-title", content.online.title);
    text("footer-copy", content.footer.copy);

    attr("hero-image", "src", content.hero.image);
    attr("hero-image", "alt", content.hero.title);
    text("hero-button", content.hero.buttonText);
    attr("hero-button", "href", content.hero.buttonUrl);
    text("cta-button", content.cta.buttonText);
    attr("cta-button", "href", content.cta.buttonUrl);

    const benefits = document.getElementById("benefits-list");
    if (benefits) {
        benefits.innerHTML = renderList(
            content.benefits,
            (item) => `
            <article class="benefit-item">
                <span class="benefit-icon">✓</span>
                <p>${item}</p>
            </article>`
        );
    }

    const services = document.getElementById("services-list");
    if (services) {
        services.innerHTML = renderList(
            content.services,
            (item) => `
            <article class="service-card">
                <h2>${item.title}</h2>
                <p>${item.body}</p>
                <a class="button button-blue" href="${item.buttonUrl}">${item.buttonText}</a>
            </article>`
        );
    }

    const onlineLinks = document.getElementById("online-links");
    if (onlineLinks) {
        onlineLinks.innerHTML = renderList(
            content.online.links,
            (item) => `<a href="${item.url}">${item.label}</a>`
        );
    }

    text("side-1-title", content.sidebar.primary.title);
    text("side-1-body", content.sidebar.primary.body);
    text("side-1-button", content.sidebar.primary.buttonText);
    attr("side-1-button", "href", content.sidebar.primary.buttonUrl);

    text("side-2-title", content.sidebar.links.title);
    const sideLinks = document.getElementById("side-2-links");
    if (sideLinks) {
        sideLinks.innerHTML = renderList(
            content.sidebar.links.items,
            (item) => `<li><a href="${item.url}">${item.label}</a></li>`
        );
    }

    text("side-3-title", content.sidebar.contacts.title);
    text("side-3-address", content.sidebar.contacts.address);
    text("side-3-phone", content.sidebar.contacts.phone);
    text("side-3-email", content.sidebar.contacts.email);
}

async function initSite() {
    const defaultContent = await loadDefaultContent();
    const savedContent = loadSavedContent();
    applyContent(savedContent || defaultContent);
}

initSite().catch(() => {
    // Keep page visible even if dynamic content failed.
});
