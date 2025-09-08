const API_BASE = "https://consumet-api-xmdg.onrender.com/meta/anilist";

// ---------- FETCH SPOTLIGHT (AniList Banner) ----------
async function fetchSpotlightAnime(anilistId = 1535) { // default = Death Note
  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english native }
          bannerImage
          description(asHtml: false)
        }
      }
    `;
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query, variables: { id: anilistId } })
    });
    const data = await res.json();
    const media = data.data.Media;

    const spotlightImg = document.querySelector(".spotlight img");
    const spotlightTitle = document.querySelector(".spotlight-text h2");
    const spotlightDesc = document.querySelector(".spotlight-text p");

    spotlightImg.src = media.bannerImage || "Images/fallback-banner.jpg";
    spotlightImg.alt = media.title.romaji;
    spotlightTitle.textContent = media.title.english || media.title.romaji;
    spotlightDesc.textContent = media.description.replace(/<[^>]+>/g, "").slice(0, 120) + "...";
  } catch (err) {
    console.error("Error fetching spotlight:", err);
  }
}

// ---------- FETCH SECTION HELPERS ----------
async function fetchAnimeList(endpoint, containerId, limit = 12) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    const data = await res.json();
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    data.results.slice(0, limit).forEach(anime => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${anime.image}" alt="${anime.title.romaji}">
        <p>${anime.title.romaji}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
  }
}

async function fetchAnimeListSimple(endpoint, listId, limit = 8) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    const data = await res.json();
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = "";

    data.results.slice(0, limit).forEach(anime => {
      const li = document.createElement("li");
      li.textContent = anime.title.romaji;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
  }
}

// ---------- FETCH ANIME SCHEDULE (Day by Day) ----------
async function fetchWeeklySchedule() {
  try {
    const res = await fetch(`${API_BASE}/airing-schedule`);
    const data = await res.json();

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const container = document.getElementById("schedule-list");
    container.innerHTML = "";

    // Make a section for each weekday
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
        .slice(0, 6) // limit to 6 per day for space
        .forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${item.title.romaji}</strong> — Ep ${item.episode}`;
          list.appendChild(li);
        });

      section.appendChild(list);
      container.appendChild(section);
    });
  } catch (err) {
    console.error("Error fetching weekly schedule:", err);
  }
}

// ---------- RANDOM ANIME ----------
async function fetchRandomAnime() {
  try {
    const res = await fetch(`${API_BASE}/popular`);
    const data = await res.json();
    const random = data.results[Math.floor(Math.random() * data.results.length)];
    alert(`Random Pick: ${random.title.romaji}`);
  } catch (err) {
    console.error("Error fetching random:", err);
  }
}

// ---------- INIT ----------
function initAniWatt() {
  // Spotlight (example ID: Jujutsu Kaisen = 40748, change as needed)
  fetchSpotlightAnime(40748);

  // Sections
  fetchAnimeList("trending", "trending-row", 12);
  fetchAnimeListSimple("trending", "top-airing");
  fetchAnimeListSimple("popular", "most-popular");
  fetchAnimeListSimple("favourites", "most-favorite");
  fetchAnimeListSimple("recent-episodes", "latest-completed");
  fetchAnimeList("popular", "anime-collection", 16);

// Schedule
fetchWeeklySchedule();

  // Tabs for Powered Planner
  document.querySelectorAll(".schedule-tabs .tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".schedule-tabs .tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      fetchSchedule(tab.dataset.type);
    });
  });

  // Random button
  document.getElementById("random-btn")?.addEventListener("click", fetchRandomAnime);
}

// Kick things off
document.addEventListener("DOMContentLoaded", initAniWatt);
