/* =========================
   RECIPE EXPLORER
   Working Version + Filters
   ========================= */

/* ---------- 0) Global state ---------- */
let allMeals = [];

/* ---------- 1) Small helper ---------- */
const $ = (selector) => document.querySelector(selector);

/* ---------- 2) UI elements ---------- */
const searchInput = $("#searchInput");
const searchBtn = $("#searchBtn");
const results = $("#results");
const message = $("#message");
const suggested = $("#suggested");
const categoryBar = $("#categoryBar");

/* ---------- 3) API helper ---------- */
async function api(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API request failed");
  return res.json();
}

/* ---------- 4) Helpers ---------- */
function setMsg(text) {
  message.textContent = text;
}

function esc(text) {
  return text
    ?.replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* ---------- 5) Events ---------- */

searchBtn.addEventListener("click", search);

searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") search();
});

if (suggested) {
  suggested.addEventListener("click", (e) => {
    const term = e.target.dataset.term;
    if (!term) return;
    searchInput.value = term;
    search();
  });
}

/* ---------- 6) SEARCH ---------- */

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

    // 🔥 TU BLOQUE ADAPTADO
    if (!data.meals) {
      message.textContent = "No recipes found. Try another dish.";
      results.innerHTML = "";
      categoryBar.innerHTML = "";
      return;
    }

    allMeals = data.meals;

    message.textContent = "Found " + data.meals.length + " recipe(s).";

    buildCategoryBar(allMeals);
    displayResults(allMeals);

  } catch {
    setMsg("Something went wrong...");
  }
}

/* ---------- 7) DISPLAY RESULTS ---------- */

function displayResults(meals) {
  results.innerHTML = meals.map(card).join("");
}

/* ---------- 8) CATEGORY BAR ---------- */

function buildCategoryBar(meals) {
  categoryBar.innerHTML = "";

  const categorySet = new Set();

  meals.forEach(function (meal) {
    if (meal.strCategory) {
      categorySet.add(meal.strCategory);
    }
  });

  const categories = Array.from(categorySet).sort();

  let buttonsHtml = `
    <button class="btn btn-sm btn-secondary me-2 mb-2 category-btn" data-category="ALL">
      All
    </button>
  `;

  categories.forEach(function (cat) {
    buttonsHtml += `
      <button class="btn btn-sm btn-outline-secondary me-2 mb-2 category-btn"
      data-category="${cat}">
        ${cat}
      </button>
    `;
  });

  categoryBar.innerHTML = buttonsHtml;
}

/* ---------- 9) FILTER CLICK ---------- */

document.addEventListener("click", (e) => {

  // 👉 CATEGORY FILTER
  const catBtn = e.target.closest(".category-btn");
  if (catBtn) {
    const category = catBtn.dataset.category;

    if (category === "ALL") {
      displayResults(allMeals);
    } else {
      const filtered = allMeals.filter(
        (meal) => meal.strCategory === category
      );
      displayResults(filtered);
    }
    return;
  }

  // 👉 VIEW DETAILS
  const viewBtn = e.target.closest(".view-btn");
  if (viewBtn) {
    fetchRecipeDetails(viewBtn.dataset.id);
  }
});

/* ---------- 10) CARD ---------- */

function card(meal) {
  return `
  <div class="col-md-4 mb-3">
    <div class="card recipe-card h-100">

      <img src="${meal.strMealThumb}" class="card-img-top" alt="${esc(meal.strMeal)}">

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

/* ---------- 11) DETAILS ---------- */

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

/* ---------- 12) MODAL ---------- */

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
            </a>
          </p>`
        : ""
    }
  `;

  const modal = new bootstrap.Modal($("#recipeModal"));
  modal.show();
}