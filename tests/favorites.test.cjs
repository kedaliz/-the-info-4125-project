const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const script = fs.readFileSync(path.join(root, "js/main.js"), "utf8");

function createPage(page, storage) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  const groups = [...html.matchAll(/data-property-ids="([^"]+)"/g)].map((match) => ({
    dataset: { propertyIds: match[1] },
    innerHTML: "",
    querySelector() { return { focus() {} }; },
  }));
  const favorites = { innerHTML: "", querySelector() { return null; } };
  const count = { textContent: "" };
  const heading = { focus() {} };
  const handlers = {};
  const windowHandlers = {};
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, value); },
  };
  const document = {
    addEventListener(type, handler) { handlers[type] = handler; },
    getElementById(id) {
      if (page !== "favorites.html") return null;
      return { "favorites-list": favorites, "favorites-count": count, "favorites-heading": heading }[id] || null;
    },
    querySelectorAll(selector) { return selector === "[data-property-ids]" ? groups : []; },
  };
  const window = { addEventListener(type, handler) { windowHandlers[type] = handler; } };
  vm.runInNewContext(script, { document, window, localStorage });
  handlers.DOMContentLoaded();
  return {
    groups, favorites, count, windowHandlers,
    toggle(id, container) {
      const button = {
        dataset: { fav: String(id) },
        closest() { return container; },
      };
      handlers.click({ target: { closest() { return button; } } });
    },
  };
}

test("home and catalog render the same photo cards with working heart buttons", () => {
  const storage = new Map();
  const home = createPage("index.html", storage);
  const catalog = createPage("properties.html", storage);
  for (const page of [home, catalog]) {
    assert.match(page.groups[0].innerHTML, /123 N Quarry St/);
    assert.match(page.groups[0].innerHTML, /photos\/123%20N%20Quarry\.jpg/);
    assert.match(page.groups[0].innerHTML, /class="favorite-toggle"[^>]+aria-pressed="false"/);
    assert.match(page.groups[0].innerHTML, /Managed by <strong>Independent \/ Private<\/strong>/);
  }
  home.toggle(1, home.groups[0]);
  assert.equal(storage.get("favorites"), "[1]");
  assert.match(home.groups[0].innerHTML, /data-fav="1"[^>]+aria-pressed="true"/);
  catalog.windowHandlers.storage({ key: "favorites" });
  assert.match(catalog.groups[0].innerHTML, /data-fav="1"[^>]+aria-pressed="true"/);
});

test("sample favorites stay visible without pretending to be saved", () => {
  const storage = new Map();
  const page = createPage("favorites.html", storage);
  assert.match(page.groups[0].innerHTML, /123 N Quarry St/);
  assert.match(page.groups[0].innerHTML, /305 Eddy St/);
  assert.match(page.groups[0].innerHTML, /710 Stewart Ave/);
  assert.match(page.groups[0].innerHTML, /aria-pressed="false"/);
  assert.match(page.favorites.innerHTML, /No saved places yet/);
  assert.equal(page.count.textContent, "0 saved places");
  assert.equal(storage.has("favorites"), false);
});

test("saved favorites persist across pages and can be removed", () => {
  const storage = new Map([["favorites", "[2]"]]);
  const page = createPage("favorites.html", storage);
  assert.match(page.favorites.innerHTML, /305 Eddy St/);
  assert.match(page.favorites.innerHTML, /Lambrou Real Estate/);
  assert.equal(page.count.textContent, "1 saved place");
  page.toggle(2, page.favorites);
  assert.equal(storage.get("favorites"), "[]");
  assert.match(page.favorites.innerHTML, /No saved places yet/);
  assert.match(page.groups[0].innerHTML, /305 Eddy St/);
  assert.equal(page.count.textContent, "0 saved places");
  const reopened = createPage("favorites.html", storage);
  assert.match(reopened.favorites.innerHTML, /No saved places yet/);
  assert.match(reopened.groups[0].innerHTML, /305 Eddy St/);
});

test("new properties appear in both listings and can be saved", () => {
  const storage = new Map();
  for (const pageName of ["index.html", "properties.html"]) {
    const page = createPage(pageName, storage);
    const collegetown = page.groups[0].innerHTML;
    assert.match(collegetown, /123 Blair/);
    assert.match(collegetown, /photos\/blair%201\.webp/);
    assert.match(collegetown, /319 College Ave/);
    assert.match(collegetown, /photos\/streetview\.jpeg/);
    assert.match(collegetown, /property9\.html/);
    assert.match(collegetown, /property10\.html/);
  }
  const home = createPage("index.html", storage);
  home.toggle(9, home.groups[0]);
  home.toggle(10, home.groups[0]);
  const favorites = createPage("favorites.html", storage);
  assert.match(favorites.favorites.innerHTML, /123 Blair/);
  assert.match(favorites.favorites.innerHTML, /319 College Ave/);
  assert.equal(favorites.count.textContent, "2 saved places");
});
