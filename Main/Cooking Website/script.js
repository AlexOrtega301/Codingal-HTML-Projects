/* =========================
   RECIPE EXPLORER
   Working Version
   ========================= */

/* ---------- 1) Small helper to select elements ---------- */
const $ = (selector) => document.querySelector(selector);

/* ---------- 2) Grab important UI elements ---------- */
const searchInput = $("#searchInput");
const searchBtn = $("#searchBtn");
const results = $("#results");
const message = $("#message");
const suggested = $("#suggested");

/* ---------- 3) API helper function ---------- */
async function api(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("API request failed");
  }
  return res.json();
}

/* ---------- 4) Message helper ---------- */
function setMsg(text) {
  message.textContent = text;
}

/* ---------- 5) Safety helper: escape text ---------- */
function esc(text) {
  return text
    ?.replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* ---------- 6) Event listeners ---------- */

searchBtn.addEventListener("click", search);

searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    search();
  }
});

if (suggested) {
  suggested.addEventListener("click", (e) => {
    const term = e.target.dataset.term;
    if (!term) return;

    searchInput.value = term;
    search();
  });
}

/* ---------- 7) Main search function ---------- */

async function search() {

  const query = searchInput.value.trim();
  results.innerHTML = "";

  if (!query) {
    setMsg("Please type a dish name...");
    return;
  }

  setMsg("Searching recipes...");

  try {

    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const data = await api(url);

    const meals = data.meals || [];

    if (!meals.length) {
      setMsg("No recipes found...");
      return;
    }

    setMsg(`Found ${meals.length} recipe(s).`);

    results.innerHTML = meals.map(card).join("");

  } catch (err) {
    setMsg("Something went wrong...");
  }
}

/* ---------- 8) Card builder function ---------- */

function card(meal) {

  return `
  <div class="col-md-4 mb-3">
    <div class="card recipe-card h-100">

      <img src="${meal.strMealThumb}" class="card-img-top">

      <div class="card-body">

        <h5 class="card-title">${esc(meal.strMeal)}</h5>

        <span class="badge bg-primary tag-pill">
        ${esc(meal.strArea)}
        </span>

        <span class="badge bg-success tag-pill">
        ${esc(meal.strCategory)}
        </span>

        <div class="mt-3">
        <button class="btn btn-sm btn-dark view-btn"
        data-id="${meal.idMeal}">
        View Details
        </button>
        </div>

      </div>
    </div>
  </div>
  `;
}

/* ---------- 9) Event delegation for dynamic buttons ---------- */

document.addEventListener("click", (e) => {

  const btn = e.target.closest(".view-btn");

  if (!btn) return;

  const id = btn.dataset.id;

  fetchRecipeDetails(id);
});

/* ---------- 10) Fetch recipe details ---------- */

async function fetchRecipeDetails(id) {

  setMsg("Loading recipe details...");

  try {

    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    const data = await api(url);

    const meal = data.meals?.[0];

    if (!meal) {
      setMsg("Unable to load details.");
      return;
    }

    buildAndShowModal(meal);
    setMsg("");

  } catch {
    setMsg("Something went wrong fetching details.");
  }
}

/* ---------- 11) Modal builder ---------- */

function buildAndShowModal(meal) {

  const modalBody = $("#modalBody");

  let ingredients = "";

  for (let i = 1; i <= 20; i++) {

    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ing) {
      ingredients += `<li>${esc(measure)} ${esc(ing)}</li>`;
    }
  }

  modalBody.innerHTML = `
  <h3>${esc(meal.strMeal)}</h3>

  <img src="${meal.strMealThumb}" class="img-fluid mb-3">

  <h5>Ingredients</h5>
  <ul>${ingredients}</ul>

  <h5>Instructions</h5>
  <div class="instructions-box">
  ${esc(meal.strInstructions)}
  </div>

  ${
    meal.strYoutube
      ? `<p class="mt-3">
      <a href="${meal.strYoutube}" target="_blank" class="btn btn-danger">
      Watch on YouTube
      </a></p>`
      : ""
  }
  `;

  const modal = new bootstrap.Modal($("#recipeModal"));
  modal.show();
}
