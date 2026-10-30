const PROPERTIES = [
  { id: 1, name: "Maple Street Apartment", price: "$1,850/mo", page: "property1.html", img: "https://placehold.co/600x400?text=Maple+Street", info: "2 bed / 1 bath" },
  { id: 2, name: "Lakeview Condo", price: "$2,300/mo", page: "property2.html", img: "https://placehold.co/600x400?text=Lakeview+Condo", info: "2 bed / 2 bath" },
  { id: 3, name: "Downtown Loft", price: "$2,750/mo", page: "property3.html", img: "https://placehold.co/600x400?text=Downtown+Loft", info: "1 bed / 1 bath" },
  { id: 4, name: "Suburban Family Home", price: "$3,400/mo", page: "property4.html", img: "https://placehold.co/600x400?text=Family+Home", info: "4 bed / 3 bath" },
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
      <img src="${p.img}" alt="${p.name}">
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
