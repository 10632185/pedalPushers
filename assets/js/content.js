const domain = "https://pedalpushers.xn--sebastianlynghj-jub.dk/";
const postEndpoint = "wp-json/wp/v2/posts";
const categoryEndpoint = "wp-json/wp/v2/categories";
const perPage = "?per_page=21";
const extras = "&acf_format=standard&_embed";

async function fetchCategories() {
  const res = await fetch(domain + categoryEndpoint);
  return res.json();
}

async function fetchPostsByCategories(categoryIds = []) {
  const categoryParam = categoryIds.length ? `&categories=${categoryIds.join(",")}` : "";
  const res = await fetch(domain + postEndpoint + perPage + extras + categoryParam);
  return res.json();
}

function renderFilters(categories) {
  const filterContainer = document.querySelector(".filters");
  filterContainer.innerHTML = ""; // Clear previous filters if any

  categories.forEach(cat => {
    const label = document.createElement("label");
    label.htmlFor = `cat-${cat.id}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `cat-${cat.id}`;
    checkbox.value = cat.id;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(cat.name));
    filterContainer.appendChild(label);
  });

  filterContainer.addEventListener("change", async () => {
    const checkedBoxes = Array.from(filterContainer.querySelectorAll("input[type=checkbox]:checked"));
    const selectedIds = checkedBoxes.map(cb => cb.value);
    const bikes = await fetchPostsByCategories(selectedIds);
    renderRecipes(bikes);
  });
}

function renderRecipes(bikes) {
  const container = document.querySelector(".grid-container");
  container.innerHTML = "";

  bikes.forEach(bike => {
    const acf = bike.acf ?? {};
    const imgObj = bike._embedded?.["wp:featuredmedia"]?.[0] ?? {};
    const terms = bike._embedded?.["wp:term"]?.flat() ?? [];

    const cykelbillede = acf.cykelbillede;
    const altText = imgObj.alt_text;
    const cykelnavn = acf.cykelnavn;
    const cykelbeskrivelse = acf.cykelbeskrivelse;
    const cykelstorrelse = acf.cykelstorrelse;
    const cykelpris = acf.cykelpris;

    const card = document.createElement("div");
    card.className = "bike-card";
    card.innerHTML = `
      <img src="${cykelbillede}" alt="${altText}">
      <div class="info">
        <h3>${cykelnavn}</h3>
        <p>${cykelbeskrivelse}</p>
        <p>Størrelse: ${cykelstorrelse}</p>
        <div class="price">${cykelpris},-</div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function init() {
  const [categories, bikes] = await Promise.all([
    fetchCategories(),
    fetchPostsByCategories()
  ]);
  renderFilters(categories);
  renderRecipes(bikes);
}

init();
