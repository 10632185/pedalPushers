const domain = "https://pedalpushers.xn--sebastianlynghj-jub.dk/";
const postEndpoint = "wp-json/wp/v2/posts";
const categoryEndpoint = "wp-json/wp/v2/categories";
const perPage = "?per_page=21";
const extras = "&acf_format=standard&_embed";
/* I disse 5 linjer definere vi vores URL'er og parametre. Vi erklærer og stamper i jorden og siger hvad præcist vores domæne er, hvor den kan finde vores posts og kategorier. Efterfølgende definere vi hvor mange posts den må vise per side, altså hvis vi ville have 2 sider, en med 10 og 11 kunne vi i stedet skrive "?per_page=11". Sidst definere vi vores embed og vores acf format. Her siger vi, at vi vil have ACF (advanced custom fields) i dens standardformat, samt den skal "embed" (inkludere) relateret data såsom billeder og kategorier.*/

async function fetchCategories() { /* Definere en funktion */
  const res = await fetch(domain + categoryEndpoint); /* Her kalder vi vores WP kategori */
  return res.json();/* Nu beder vi den tolke svaret som JS, så vi kan arbejde med det her, og får derfor en liste med kategorier */
}


async function fetchPostsByCategories(categoryIds = []) {/* Definere en funktion der henter vores posts vi har lavet i WP, her tager den også vores kategori's ID */
  let categoryParam = "";/* Opretter en variabel som indeholder en string, der senere kan bruges til at indsætte vores kategori */
if (categoryIds.length > 0) {/* Her tjekker vi om der faktisk er et id, ved at finde ud af om længden af id'et er større end 0. Er den ikke det, vil der ikke ske noget, og derfor vil det ikke virke. */
  categoryParam = `&categories=${categoryIds.join(",")}`;/* Hvis der er en kategori samles de i en string, og indsættes efter vores categoriendpoint's "url". Det bliver et kommasepareret string da vi skriver (",") efterfølgende. */
}
  const res = await fetch(domain + postEndpoint + perPage + extras + categoryParam);/* Nu samler vi hele URL'en og fetcher vores posts, men nu hvor de er filtreret. */
  return res.json();/* Omdanner det til JS data vi kan bruge, som en liste af cykler */
}

function renderFilters(categories) {/* Her definere vi vores filtreringsfunktion ud fra vores kategorier */
  const filterContainer = document.querySelector(".filters");/* Her bruger vi en queryselector til at sige hvor vi vil indsætte vores filter checkboxe i HTML'en. */
  filterContainer.innerHTML = ""; /* Her ryder vi op og fjerner tidligere filtrer. Da man ellers skal trykke 2 gange på checkbox for at aktivere filteret. */

  categories.forEach(cat => {/* Laver et label hvor vi via. htmlFor referer til checkboxen https://www.w3schools.com/jsref//prop_label_htmlfor.asp og kalder den "cat" for category */
    const label = document.createElement("label");
    label.htmlFor = `cat-${cat.id}`;

    const checkbox = document.createElement("input");/* Vi laver et nyt HTML element, som skal være et inputfelt og gemmer det under variablen "checkbox", dog vises dette ikke før vi bruger append som gøres senere. */
    checkbox.type = "checkbox";/* Her angiver vi at vores inputfelt skal være en checkbox. */
    checkbox.id = `cat-${cat.id}`;/* Her giver vi et unikt ID på hver checkbox. Den kigger i vores WP, og laver en checkbox for hvert ID, og displayer navnet af kategorien, så der ikke bare står "1, 8, 9" f.eks. - dette ville ikke give mening for brugeren*/
    checkbox.value = cat.id;/* Nu giver vi checkboxen en værdi når den vælges, og sender det videre som "cat.id" - igen "cat" for category. */

    label.appendChild(checkbox);/* Her tilføjer vi checkboxen i DOM'en */
    label.appendChild(document.createTextNode(cat.name));/* Her tilføjer vi kategorinavnet i DOM'en */
    filterContainer.appendChild(label);/* Sørger for det kommer ind i .filters */
  });

  filterContainer.addEventListener("change", async () => {/* Her tilføjer vi en eventlistener, som "lytter" efter om en bruger tjekker boksen til/fra, og kører derefter nedenstående kode. */
    const checkedBoxes = Array.from(filterContainer.querySelectorAll("input[type=checkbox]:checked"));/* Her søger vi efter alle aftjekkede boxes og gemmer værdien (kategori ID), så vi kan vise de rigtige cykler i filtreringssystemet. */
    const selectedIds = checkedBoxes.map(cb => cb.value);
    const bikes = await fetchPostsByCategories(selectedIds);/* Her går filteret ind og henter de cykler der skal vises på de valgte kategorier.*/
    renderBikes(bikes); /* Vises derefter på siden. */
  });
}

function renderBikes(bikes) {/* Her starter vi en ny funktion */
  const container = document.querySelector(".grid-container");/* Bestemmer hvor vores cykel cards skal vises */
  container.innerHTML = "";/* Rydder eksisterende content, så vi starter forfra. Uden dette ville filtreringen ikke virke. */

  bikes.forEach(bike => {/* Her laver vi et for-each loop */
    const acf = bike.acf;/* Vi definere at hver enkelte cykel skal hedde bike */
    const imgObj = bike._embedded;/* Her henter vi det tilknyttede billede vha. embedded */
    const terms = bike._embedded;/* Her henter vi det tilknyttede kategori vha. embedded */

    const cykelbillede = acf.cykelbillede;/* Trækker info ud og definere hvilket billede vi skal bruge */
    const altText = imgObj.alt_text;/* Trækker alt-teksten ud fra billedet */
    const cykelnavn = acf.cykelnavn;/* Trækker cykelnavnet ud af acf */
    const cykelbeskrivelse = acf.cykelbeskrivelse;/* Trækker cykelbeskrivelsen ud af acf */
    const cykelstorrelse = acf.cykelstorrelse;/* Trækker cykelstørrelsen ud af acf */
    const cykelpris = acf.cykelpris;/* Trækker cykelprisen ud af acf */

    const card = document.createElement("div");/* Opretter en div i HTML'en */
    card.className = "bike-card";/* Tilføjer classen bike-card til vores div */
    card.innerHTML = `
      <img src="${cykelbillede}" alt="${altText}">
      <div class="info">
        <h3>${cykelnavn}</h3>
        <p>${cykelbeskrivelse}</p>
        <p>Størrelse: ${cykelstorrelse}</p>
        <div class="price">${cykelpris},-</div>
      </div>
    `;/* Tilføjer indholdet vi skal bruge, samt trække de predefinerede tekster ind, som vi får inde fra vores WP */
    container.appendChild(card);/* Vi bruger appendchild for at tilføje kortet på siden */
  });
}

async function init() {/* Her henter vi både vores kategorier og vores cykler. Vi bruger "Promise.all" for at vente på at alt dataen er klar til at blive vist på samme tid https://www.w3schools.com/jsref/jsref_promise_all.asp */
  const [categories, bikes] = await Promise.all([
    fetchCategories(),/* Fetcher kategorierne */
    fetchPostsByCategories()/* Fetcher posts */
  ]);
  renderFilters(categories);/* Kalder vores funktioner for at vise filtrene og cyklerne på vores side */
  renderBikes(bikes);
}

init();/* Initializer det hele og starter det op. */
