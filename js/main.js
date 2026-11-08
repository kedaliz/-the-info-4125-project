const PROPERTIES = [
  { id: 1, name: "123 N Quarry St", price: "$1,400–$1,800 / month", page: "property1.html", img: "photos/123%20N%20Quarry.jpg", info: "Collegetown / Lower C-Town · 4.5 stars" },
  { id: 2, name: "305 Eddy St", price: "$1,200–$1,400 / person / month", page: "property2.html", img: "photos/305Eddy-4.webp", info: "Collegetown · 4.0 stars · 2 responses" },
  { id: 3, name: "307 Eddy St", price: "$1,200–$1,400 / person / month", page: "property3.html", img: "https://placehold.co/600x400?text=307+Eddy+St", info: "Collegetown · 4.0 stars · 1 response" },
  { id: 4, name: "202 Stewart Ave", price: "$1,000–$1,200 / person / month", page: "property4.html", img: "photos/202-stewart-exterior.png", info: "Collegetown · 2.57 / 5 · 1 response" },
  { id: 5, name: "710 Stewart Ave", price: "$1,200–$1,400 / person / month", page: "property5.html", img: "photos/710-stewart-exterior.png", info: "University Hill · 3.43 / 5 · 1 response" },
  { id: 6, name: "404 University Ave", price: "$1,200–$1,400 / person / month", page: "property6.html", img: "https://placehold.co/600x400?text=404+University+Ave", info: "University Hill · 5.0 / 5 · 1 response" },
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

function propertyCard(p, showRemove) {
  const isFav = getFavorites().includes(p.id);
  const label = showRemove ? "Remove" : isFav ? "Unfavorite" : "Favorite";
  return `
    <article class="card">
      <div class="img"><img src="${p.img}" alt="${p.name}"></div>
      <div class="body">
        <h3>${p.name}</h3>
        <span class="price">${p.price}</span>
        <span>${p.info}</span>
        <div class="actions">
          <a class="btn secondary" href="${p.page}">View</a>
          <button class="btn" data-fav="${p.id}">${label}</button>
        </div>
      </div>
    </article>`;
}

function renderList(containerId, list, showRemove) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<p class="empty">No favorites yet. Browse the properties and click Favorite.</p>';
    return;
  }
  el.innerHTML = list.map((p) => propertyCard(p, showRemove)).join("");
}

function refresh() {
  renderList("property-list", PROPERTIES, false);
  const favs = getFavorites();
  renderList("favorites-list", PROPERTIES.filter((p) => favs.includes(p.id)), true);
  const btn = document.getElementById("detail-fav");
  if (btn) btn.textContent = favs.includes(Number(btn.dataset.fav)) ? "Unfavorite" : "Add to Favorites";
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-fav]");
  if (!btn) return;
  toggleFavorite(Number(btn.dataset.fav));
  refresh();
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
