const API_URL = "https://api.jikan.moe/v4/anime";

const searchInput = document.getElementById("search-input");
const animeContainer = document.getElementById("anime-container");
const genreContainer = document.getElementById("genre-buttons");

// Pagination elements
const paginationContainer = document.createElement("div");
paginationContainer.classList.add("pagination");

const prevButton = document.createElement("button");
prevButton.textContent = "← Prev";
prevButton.classList.add("pagination-button");

const nextButton = document.createElement("button");
nextButton.textContent = "Next →";
nextButton.classList.add("pagination-button");

const pageInfo = document.createElement("span");
pageInfo.id = "page-info";
pageInfo.classList.add("pagination-info");
pageInfo.textContent = "Page 1 / 1";

paginationContainer.appendChild(prevButton);
paginationContainer.appendChild(pageInfo);
paginationContainer.appendChild(nextButton);
document.body.appendChild(paginationContainer);

// Genres list
const genres = [
  "Action", "Adventure", "Isekai", "Fantasy", "Sci-Fi", "Thriller", "Horror",
  "Romance", "Comedy", "Demons", "Slice of Life", "Ecchi", "Mecha", "Mystery",
  "Harem", "Space", "Supernatural", "Game", "Music", "Sports", "Psychological",
  "Seinen", "Shounen", "Shoujo", "Josei", "Martial Arts", "Kids", "Drama"
];

let selectedGenres = new Set();
let currentPage = 1;
const perPage = 49;
let totalPages = 1;
let paginatedResults = [];

// Create genre buttons
genres.forEach(genre => {
  const btn = document.createElement("button");
  btn.classList.add("genre-button");
  btn.textContent = genre;
  btn.addEventListener("click", () => {
    if (selectedGenres.has(genre)) {
      selectedGenres.delete(genre);
      btn.classList.remove("active");
    } else {
      selectedGenres.add(genre);
      btn.classList.add("active");
    }
    currentPage = 1;
    performSearch();
  });
  genreContainer.appendChild(btn);
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function performSearch(page = 1) {
  const query = searchInput.value.trim();
  animeContainer.innerHTML = "<p style='color: white;'>Loading...</p>";

  let allResults = [];
  let pageIndex = 1;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const url = `${API_URL}?q=${encodeURIComponent(query)}&page=${pageIndex}&limit=25`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("API error: " + res.status);
      const data = await res.json();

      if (!data.data?.length) break;
      allResults.push(...data.data);

      hasNextPage = data.pagination?.has_next_page ?? false;
      pageIndex++;

      if (pageIndex > 100) break;
      await delay(250);
    }

    const genreList = [...selectedGenres];
    const filtered = allResults.filter(anime => {
      const titles = [
        anime.title?.english?.toLowerCase(),
        anime.title?.romaji?.toLowerCase(),
        anime.title?.native?.toLowerCase()
      ].filter(Boolean);

      const matchesQuery = !query || titles.some(t => t.includes(query.toLowerCase()));
      const animeGenres = (anime.genres || []).map(g => g.name.toLowerCase());
      const matchesGenres = genreList.every(g => animeGenres.includes(g.toLowerCase()));

      return matchesQuery && matchesGenres;
    });

    paginatedResults = filtered;
    totalPages = Math.ceil(filtered.length / perPage) || 1;
    currentPage = page;

    updateAnimeDisplay();
  } catch (err) {
    console.error("Error:", err);
    animeContainer.innerHTML = `<p style='color: white;'>Error: ${err.message}</p>`;
    pageInfo.textContent = "Page 0 / 0";
  }
}

function updateAnimeDisplay() {
  animeContainer.innerHTML = "";

  const results = paginatedResults.slice((currentPage - 1) * perPage, currentPage * perPage);
  results.forEach(anime => {
    const title = anime.title || anime.title_english || anime.title_romaji || "Unknown Title";
    const image = anime.images?.jpg?.image_url || "";

    const card = document.createElement("div");
    card.classList.add("anime-card");
    card.innerHTML = `
      <img src="${image}" alt="${title}">
      <p class="anime-name">${title}</p>
    `;
    card.addEventListener("click", () => {
      window.location.href = `bulb.html?anime=${encodeURIComponent(title)}`;
    });
    animeContainer.appendChild(card);
  });

  prevButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;
  pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
}

prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateAnimeDisplay();
  }
});

nextButton.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    updateAnimeDisplay();
  }
});

let searchDebounceTimeout;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    currentPage = 1;
    performSearch();
  }, 300);
});

performSearch();
