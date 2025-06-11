 const domain = "https://pedalpushers.xn--sebastianlynghj-jub.dk/";
    const postEndPoint = "wp-json/wp/v2/posts";
    const morePages = "?per_page=21";
    const queryExtras = "&acf_format=standard&_embed";

    async function BikeContentLoad() {
      const url = domain + postEndPoint + morePages + queryExtras;
      try {
        const resp = await fetch(url);
        return await resp.json();
      } catch (err) {
        console.error("Det virker ikke:", err);
        return [];
      }
    }

    function renderRecipes(bikes) {
      const container = document.querySelector(".grid-container");
      if (!container) return console.warn("Element '.grid-container' ikke fundet");

      container.innerHTML = "";

      bikes.forEach(bike => {
        const acf = bike.acf || {};
        const imgObj = bike._embedded?.["wp:featuredmedia"]?.[0] || {};
        const terms = bike._embedded?.["wp:term"]?.flat() || [];

        const cykelbillede = acf.cykelbillede || imgObj.source_url || "placeholder.jpg";
        const altText = imgObj.alt_text || acf.cykelnavn || "Cykel billede";
        const cykelnavn = acf.cykelnavn || bike.title?.rendered || "Ukendt cykel";
        const cykelbeskrivelse = acf.cykelbeskrivelse || "Ingen beskrivelse";
        const cykelstorrelse = acf.cykelstorrelse || "Ukendt størrelse";

        const priceTerm = terms.find(t => t.taxonomy === "category" && /\d+,-/.test(t.name));
        const price = priceTerm ? priceTerm.name.replace(",-", "") : "Ukendt pris";

        const card = document.createElement("div");
        card.className = "bike-card";
        card.innerHTML = `
          <img src="${cykelbillede}" alt="${altText}">
          <div class="info">
            <h3>${cykelnavn}</h3>
            <p>${cykelbeskrivelse}</p>
            <p>Størrelse: ${cykelstorrelse}</p>
            <div class="price">${price},-</div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    async function init() {
      const bikes = await BikeContentLoad();
      console.log(bikes); // optional for debugging
      renderRecipes(bikes);
    }

    init();