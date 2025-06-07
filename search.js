const API_URL = "https://api.jikan.moe/v4/anime";

const searchInput = document.getElementById("search-input");
const animeContainer = document.getElementById("anime-container");
const genreContainer = document.getElementById("genre-buttons");

// Pagination setup
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

// Genre list
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
  const query = searchInput.value.trim().toLowerCase();
  animeContainer.innerHTML = "<p style='color: white;'>Loading...</p>";

  try {
    const url = `${API_URL}?q=${encodeURIComponent(query)}&page=1&limit=50`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error: " + res.status);
    const data = await res.json();

    const genreList = [...selectedGenres];
    const filtered = Array.isArray(data.data) ? data.data.filter(anime => filterAnime(anime, query, genreList)) : [];

    paginatedResults = filtered;
    totalPages = Math.ceil(paginatedResults.length / perPage) || 1;
    currentPage = page;
    updateAnimeDisplay();

    fetchAllPagesInBackground(query, genreList, paginatedResults);
  } catch (err) {
    console.error("Error:", err);
    animeContainer.innerHTML = `<p style='color: white;'>Error: ${err.message}</p>`;
    pageInfo.textContent = "Page 0 / 0";
  }
}

function filterAnime(anime, query, genreList) {
  const titles = [];

  if (anime.title) titles.push(anime.title.toLowerCase());

  if (Array.isArray(anime.titles)) {
    anime.titles.forEach(t => {
      if (t?.title) titles.push(t.title.toLowerCase());
    });
  }

  const matchesQuery = !query || titles.some(t => t.includes(query));

  const allAnimeGenres = [
    ...(anime.genres || []),
    ...(anime.themes || []),
    ...(anime.explicit_genres || [])
  ].map(g => g.name.toLowerCase());

  const matchesGenres = genreList.every(g => allAnimeGenres.includes(g.toLowerCase()));

  return matchesQuery && matchesGenres;
}

function getBestTitle(anime) {
  const titleMap = {};
  anime.titles?.forEach(t => {
    if (t?.type && t?.title) {
      titleMap[t.type.toLowerCase()] = t.title;
    }
  });
  return titleMap.english || titleMap.romaji || anime.title || "Unknown Title";
}

async function fetchAllPagesInBackground(query, genreList, initialResults) {
  let allResults = [...initialResults];
  let pageIndex = 2;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const url = `${API_URL}?q=${encodeURIComponent(query)}&page=${pageIndex}&limit=50`;
      const res = await fetch(url);
      if (!res.ok) break;

      const data = await res.json();
      if (!data.data?.length) break;

      const newFiltered = data.data.filter(anime => filterAnime(anime, query, genreList));
      allResults.push(...newFiltered);

      paginatedResults = allResults;
      totalPages = Math.ceil(allResults.length / perPage) || 1;

      if (currentPage <= totalPages) updateAnimeDisplay();

      hasNextPage = data.pagination?.has_next_page ?? false;
      pageIndex++;

      if (pageIndex > 100) break;
      await delay(300);
    }
  } catch (err) {
    console.warn("Background fetch failed:", err);
  }
}

function updateAnimeDisplay() {
  animeContainer.innerHTML = "";

  const results = paginatedResults.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (results.length === 0) {
    animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
    return;
  }

  results.forEach(anime => {
    const title = getBestTitle(anime);
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

// Pagination handlers
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

// Debounced search input
let searchDebounceTimeout;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    currentPage = 1;
    performSearch();
  }, 300);
});

// Initial load
performSearch();
