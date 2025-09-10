document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://consumet-api-xmdg.onrender.com/meta/anilist";
  const ANILIST_GRAPHQL = "https://graphql.anilist.co";
  let showEnglish = true;

  // ===== HELPER =====
  function getTitle(anime) {
    return showEnglish ? (anime?.title?.english || anime?.title?.romaji || "Unknown") : (anime?.title?.romaji || "Unknown");
  }

  // ===== SPOTLIGHT =====
  async function fetchSpotlight() {
    try {
      const query = `
        query {
          Page(perPage: 3) {
            media(sort: TRENDING_DESC, type: ANIME) {
              id
              title { romaji english }
              bannerImage
              coverImage { extraLarge }
              description(asHtml: false)
            }
          }
        }
      `;
      const res = await fetch(ANILIST_GRAPHQL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      const spotlights = data?.data?.Page?.media || [];

      const container = document.getElementById("spotlight");
      if (!container) return;
      container.innerHTML = "";

      spotlights.forEach(anime => {
        const title = getTitle(anime);
        const imageUrl = anime?.bannerImage || anime?.coverImage?.extraLarge || "Images/placeholder.png";
        const div = document.createElement("div");
        div.className = "spotlight";
        div.innerHTML = `
          <img src="${imageUrl}" alt="${title}">
          <div class="overlay">
            <h2>${title}</h2>
            <p>${anime?.description ? anime.description.substring(0, 120) + "..." : ""}</p>
          </div>
        `;
        container.appendChild(div);
      });
    } catch (err) {
      console.error("Spotlight fetch failed:", err);
    }
  }

  // ===== TRENDING =====
  async function fetchTrending() {
    try {
      const res = await fetch(`${API_BASE}/trending`);
      const data = await res.json();
      const results = data?.results || [];
      const container = document.getElementById("trending-scroll");
      if (!container) return;
      container.innerHTML = "";

      results.slice(0, 15).forEach(anime => {
        const title = getTitle(anime);
        const div = document.createElement("div");
        div.className = "trending-item";
        div.innerHTML = `
          <img src="${anime?.image || 'Images/placeholder.png'}" alt="${title}">
          <p>${title}</p>
        `;
        container.appendChild(div);
      });
    } catch (err) {
      console.error("Trending fetch failed:", err);
    }
  }

  // ===== COLUMNS =====
  async function fetchColumns() {
    const endpoints = {
      airing: "airing-schedule",
      popular: "popular",
      favorite: "favorite",
      completed: "recent-episodes"
    };
    const container = document.getElementById("columns");
    if (!container) return;
    container.innerHTML = "";

    for (const [name, endpoint] of Object.entries(endpoints)) {
      try {
        const res = await fetch(`${API_BASE}/${endpoint}`);
        const data = await res.json();
        const results = data?.results || [];
        if (!results.length) continue;

        const section = document.createElement("section");
        section.innerHTML = `<h2>${
          name === "airing" ? "Top Airing" :
          name === "popular" ? "Most Popular" :
          name === "favorite" ? "Most Favorite" :
          "Latest Completed"
        }</h2>`;

        const ul = document.createElement("ul");
        ul.className = "anime-list";
        results.slice(0, 6).forEach(anime => {
          const li = document.createElement("li");
          li.textContent = getTitle(anime);
          ul.appendChild(li);
        });

        section.appendChild(ul);
        container.appendChild(section);
      } catch (err) {
        console.error(`Failed to fetch ${name}:`, err);
      }
    }
  }

  // ===== SCHEDULE =====
  async function fetchWeeklySchedule() {
    try {
      const res = await fetch(`${API_BASE}/airing-schedule`);
      const data = await res.json();
      const results = data?.results || [];
      const container = document.getElementById("schedule-list");
      if (!container) return;
      container.innerHTML = "";

      const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

      days.forEach(day => {
        const section = document.createElement("div");
        section.className = "schedule-day";
        const header = document.createElement("h3");
        header.textContent = day;
        section.appendChild(header);

        const list = document.createElement("ul");
        results
          .filter(item => {
            const airDate = new Date(item?.airingAt * 1000);
            return days[airDate.getDay()] === day;
          })
          .slice(0, 6)
          .forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${getTitle(item)}</strong> — Ep ${item?.episode || '?'}`;
            list.appendChild(li);
          });

        section.appendChild(list);
        container.appendChild(section);
      });
    } catch (err) {
      console.error("Weekly schedule fetch failed:", err);
    }
  }

  // ===== INIT =====
  function loadAll() {
    fetchSpotlight();
    fetchTrending();
    fetchColumns();
    fetchWeeklySchedule();
  }

  loadAll();

  // ===== LANG TOGGLE =====
  const toggleBtn = document.getElementById("toggle-lang");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      showEnglish = !showEnglish;
      toggleBtn.textContent = showEnglish ? "ENG" : "JAP";
      loadAll();
    });
  }
});
