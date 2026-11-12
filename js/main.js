const PROPERTIES = [
  { id: 1, name: "123 N Quarry St", price: "$1,400–$1,800 / month", page: "property1.html", img: "photos/123%20N%20Quarry.jpg", manager: "Independent / Private", info: "Collegetown / Lower C-Town · 4.5 stars" },
  { id: 2, name: "305 Eddy St", price: "$1,200–$1,400 / person / month", page: "property2.html", img: "photos/305Eddy-4.webp", manager: "Lambrou Real Estate", info: "Collegetown · 4.0 stars · 2 responses" },
  { id: 3, name: "307 Eddy St", price: "$1,200–$1,400 / person / month", page: "property3.html", img: "photos/307Eddy-3.webp", manager: "Lambrou Real Estate", info: "Collegetown · 4.0 stars · 1 response" },
  { id: 4, name: "202 Stewart Ave", price: "$1,000–$1,200 / person / month", page: "property4.html", img: "photos/202-stewart-exterior.png", manager: "Modern Living Rentals", info: "Collegetown · 2.57 / 5 · 1 response" },
  { id: 5, name: "710 Stewart Ave", price: "$1,200–$1,400 / person / month", page: "property5.html", img: "photos/710-stewart-exterior.png", manager: "Modern Living Rentals", info: "University Hill · 3.43 / 5 · 1 response" },
  { id: 6, name: "404 University Ave", price: "$1,200–$1,400 / person / month", page: "property6.html", img: "photos/404-university-exterior.png", manager: "Modern Living Rentals", info: "University Hill · 5.0 / 5 · 1 response" },
  { id: 7, name: "512 University Ave", price: "$700–$1,000 / person / month", page: "property7.html", img: "photos/512-university-exterior.png", manager: "Certified Properties", info: "Fall Creek / University Hill · 3.0 / 5 · 1 response" },
  { id: 8, name: "205 Dryden Rd", price: "$1,400–$1,600 / person / month", page: "property8.html", img: "photos/205-dryden-exterior.png", manager: "Dryden South", info: "Collegetown · 5.0 / 5 · 1 response" },
  { id: 9, name: "123 Blair", price: "$1,400–$1,600 / month", page: "property9.html", img: "photos/blair%201.webp", manager: "Mark", info: "Collegetown · 1 response" },
  { id: 10, name: "319 College Ave", price: "$1,200–$1,400 / month", page: "property10.html", img: "photos/streetview.jpeg", manager: "Avramis Rentals", info: "Collegetown · 1 response" },
];

const KEY = "favorites";

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

function toggleFavorite(id) {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next.includes(id);
}

function propertyCard(p, favs) {
  const isFav = favs.includes(p.id);
  const favoriteLabel = `${isFav ? "Remove" : "Add"} ${p.name} ${isFav ? "from" : "to"} favorites`;
  return `
    <article class="card property-card property-card-${p.id}">
      <div class="img">
        ${p.img ? `<img src="${p.img}" alt="${p.name}">` : '<span class="card-photo-placeholder">Photo not available</span>'}
        <span class="property-badge">Student reviewed</span>
        <button class="favorite-toggle" type="button" data-fav="${p.id}" aria-label="${favoriteLabel}" aria-pressed="${isFav}"><span aria-hidden="true">${isFav ? "♥" : "♡"}</span></button>
      </div>
      <div class="body">
        <span class="price">${p.price}</span>
        <span class="property-rating">${p.info}</span>
        <h3>${p.name}</h3>
        <span class="property-manager">Managed by <strong>${p.manager}</strong></span>
        <a class="property-link" href="${p.page}">Open overview <span aria-hidden="true">&rarr;</span></a>
      </div>
    </article>`;
}

function renderList(containerId, list, favs) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<div class="favorites-empty"><span aria-hidden="true">&#9825;</span><h3>No saved places yet</h3><p>Browse the properties and tap the heart on a place to save it here.</p><a class="browse-link" href="properties.html">Browse properties &rarr;</a></div>';
    return;
  }
  el.innerHTML = list.map((p) => propertyCard(p, favs)).join("");
}

function refresh() {
  const favs = getFavorites();
  renderList("property-list", PROPERTIES, favs);
  document.querySelectorAll("[data-property-ids]").forEach((container) => {
    const ids = container.dataset.propertyIds.split(",").map(Number);
    container.innerHTML = PROPERTIES.filter((property) => ids.includes(property.id))
      .map((property) => propertyCard(property, favs))
      .join("");
  });
  renderList("favorites-list", PROPERTIES.filter((p) => favs.includes(p.id)), favs);
  const count = document.getElementById("favorites-count");
  if (count) count.textContent = `${favs.length} saved ${favs.length === 1 ? "place" : "places"}`;
  const btn = document.getElementById("detail-fav");
  if (btn) {
    const isFav = favs.includes(Number(btn.dataset.fav));
    const property = PROPERTIES.find((item) => item.id === Number(btn.dataset.fav));
    btn.textContent = isFav ? "Unfavorite" : "Add to Favorites";
    btn.setAttribute("aria-pressed", String(isFav));
    if (property) btn.setAttribute("aria-label", `${isFav ? "Remove" : "Add"} ${property.name} ${isFav ? "from" : "to"} favorites`);
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-fav]");
  if (!btn) return;
  const container = btn.closest("[data-property-ids], #favorites-list");
  toggleFavorite(Number(btn.dataset.fav));
  refresh();
  if (container) {
    const updatedButton = container.querySelector(`[data-fav="${btn.dataset.fav}"]`);
    if (updatedButton) updatedButton.focus();
    else document.getElementById("favorites-heading").focus();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  refresh();
  const form = document.getElementById("survey-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      localStorage.setItem("survey", JSON.stringify(data));
      form.reset();
      document.getElementById("survey-msg").textContent = "Thank you for your response!";
    });
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === KEY || event.key === null) refresh();
});
