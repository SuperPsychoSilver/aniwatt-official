document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://consumet-api-xmdg.onrender.com/meta/anilist";
  const ANILIST_GRAPHQL = "https://graphql.anilist.co";

  // Toggle state for ENG/JAP
  let showEnglish = true;

  // ===== FETCH SPOTLIGHTS (AniList banners) =====
  async function fetchSpotlight() {
    try {
      const query = `
        query {
          Page(perPage: 3) {
            media(sort: TRENDING_DESC, type: ANIME) {
              id
              title {
                romaji
                english
              }
              bannerImage
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
      const spotlights = data.data.Page.media;

      const container = document.getElementById("spotlight");
      container.innerHTML = "";
      spotlights.forEach((anime) => {
        const title = showEnglish
          ? (anime.title.english || anime.title.romaji)
          : anime.title.romaji;

        const div = document.createElement("div");
        div.className = "spotlight";
        div.innerHTML = `
          <img src="${anime.bannerImage}" alt="${title}">
          <div class="overlay">
            <h2>${title}</h2>
            <p>${anime.description.substring(0, 150)}...</p>
          </div>
        `;
        container.appendChild(div);
      });
    } catch (err) {
      console.error("Spotlight fetch failed:", err);
    }
  }

  // ===== FETCH TRENDING SCROLLER =====
  async function fetchTrending() {
    try {
      const res = await fetch(`${API_BASE}/trending`);
      const data = await res.json();
      const container = document.getElementById("trending-scroll");
      container.innerHTML = "";
      data.results.slice(0, 15).forEach(anime => {
        const title = showEnglish
          ? (anime.title.english || anime.title.romaji)
          : anime.title.romaji;

        const div = document.createElement("div");
        div.className = "trending-item";
        div.innerHTML = `
          <img src="${anime.image}" alt="${title}">
          <p>${title}</p>
        `;
        container.appendChild(div);
      });
    } catch (err) {
      console.error("Trending fetch failed:", err);
    }
  }

  // ===== FETCH COLUMNS (Top Airing, Popular, Favorite, Completed) =====
  async function fetchColumns() {
    try {
      const endpoints = {
        airing: "airing-schedule",
        popular: "popular",
        favorite: "favorite",
        completed: "recent-episodes"
      };
      const container = document.getElementById("columns");
      container.innerHTML = "";

      for (const [name, endpoint] of Object.entries(endpoints)) {
        const res = await fetch(`${API_BASE}/${endpoint}`);
        const data = await res.json();

        const section = document.createElement("section");
        section.innerHTML = `<h2>${
          name === "airing" ? "Top Airing" :
          name === "popular" ? "Most Popular" :
          name === "favorite" ? "Most Favorite" :
          "Latest Completed"
        }</h2>`;

        const ul = document.createElement("ul");
        ul.className = "anime-list";
        data.results.slice(0, 6).forEach(anime => {
          const title = showEnglish
            ? (anime.title.english || anime.title.romaji)
            : anime.title.romaji;

          const li = document.createElement("li");
          li.textContent = title;
          ul.appendChild(li);
        });
        section.appendChild(ul);
        container.appendChild(section);
      }
    } catch (err) {
      console.error("Columns fetch failed:", err);
    }
  }

  // ===== FETCH WEEKLY SCHEDULE =====
  async function fetchWeeklySchedule() {
    try {
      const res = await fetch(`${API_BASE}/airing-schedule`);
      const data = await res.json();

      const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const container = document.getElementById("schedule-list");
      container.innerHTML = "";

      days.forEach(day => {
        const section = document.createElement("div");
        section.className = "schedule-day";
        const header = document.createElement("h3");
        header.textContent = day;
        section.appendChild(header);

        const list = document.createElement("ul");
        data.results
          .filter(item => {
            const airDate = new Date(item.airingAt * 1000);
            return days[airDate.getDay()] === day;
          })
          .slice(0, 6)
          .forEach(item => {
            const title = showEnglish
              ? (item.title.english || item.title.romaji)
              : item.title.romaji;

            const li = document.createElement("li");
            li.innerHTML = `<strong>${title}</strong> — Ep ${item.episode}`;
            list.appendChild(li);
          });

        section.appendChild(list);
        container.appendChild(section);
      });
    } catch (err) {
      console.error("Weekly schedule fetch failed:", err);
    }
  }

  // ===== INIT LOADER =====
  function loadAll() {
    fetchSpotlight();
    fetchTrending();
    fetchColumns();
    fetchWeeklySchedule();
  }

  loadAll();

  // ===== LANGUAGE TOGGLE BUTTON =====
  const toggleBtn = document.getElementById("toggle-lang");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      showEnglish = !showEnglish;
      toggleBtn.textContent = showEnglish ? "ENG" : "JAP";
      loadAll(); // refresh with new titles
    });
  }
});
