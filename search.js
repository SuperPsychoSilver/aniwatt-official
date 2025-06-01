const API_URL = "https://consumet-api-xmdg.onrender.com/meta/anilist";

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
pageInfo.textContent = "Page 1";

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

// State variables
let selectedGenres = new Set();
let currentPage = 1;
const perPage = 49;
let totalPages = 1;
let paginatedResults = [];

// Create genre filter buttons with toggle
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

// Utility: delay function to avoid hitting rate limits too fast
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch ALL pages (no artificial max page cap)
async function performSearch(page = 1) {
  const query = searchInput.value.trim().toLowerCase();
  const genreList = [...selectedGenres];

  animeContainer.innerHTML = "<p style='color: white; font-family: Oswald, sans-serif;'>Loading all results...</p>";
  prevButton.disabled = true;
  nextButton.disabled = true;

  let allResults = [];
  let pageIndex = 1;
  let hasNextPage = true;

  try {
    // Loop through all pages until API returns no more or hits max cap
    while (hasNextPage) {
      let url = query
        ? `${API_URL}/search?query=${encodeURIComponent(query)}&page=${pageIndex}&perPage=50`
        : `${API_URL}/popular?page=${pageIndex}&perPage=50`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);

      const data = await res.json();

      if (!data.results?.length) break;

      allResults.push(...data.results);

      // Defensive fallback for hasNextPage (treat missing or null as false)
      hasNextPage = typeof data.hasNextPage === "boolean" ? data.hasNextPage : false;

      pageIndex++;

      // Safety hard cap at 100 pages
      if(pageIndex > 100) {
        console.warn("Reached 100 pages, stopping fetch to prevent infinite loop.");
        break;
      }

      // Delay between fetches (250ms)
      await delay(250);
    }

    // Filter locally by query and ALL selected genres (case-insensitive)
    const filtered = allResults.filter(anime => {
      const titles = [
        anime.title?.english?.toLowerCase(),
        anime.title?.romaji?.toLowerCase(),
        anime.title?.native?.toLowerCase()
      ].filter(Boolean);

      // Query match check (if query empty, matches all)
      const matchesQuery = !query || titles.some(t => t.includes(query));

      // Genre filtering: must match ALL selected genres (case-insensitive)
      const animeGenres = (anime.genres || []).map(g => g.toLowerCase());
      const matchesGenres = genreList.every(g => animeGenres.includes(g.toLowerCase()));

      return matchesQuery && matchesGenres;
    });

    if (!filtered.length) {
      animeContainer.innerHTML = "<p style='color: white; font-family: Oswald, sans-serif;'>No results found.</p>";
      pageInfo.textContent = "Page 0 / 0";
      paginatedResults = [];
      totalPages = 1;
      return;
    }

    paginatedResults = filtered;
    totalPages = Math.ceil(filtered.length / perPage);
    currentPage = page;

    updateAnimeDisplay(paginatedResults.slice((currentPage - 1) * perPage, currentPage * perPage));
  } catch (error) {
    console.error("Fetch error:", error);
    animeContainer.innerHTML = `<p style='color: white; font-family: Oswald, sans-serif;'>Error loading data: ${error.message}</p>`;
    pageInfo.textContent = "Page 0 / 0";
    paginatedResults = [];
    totalPages = 1;
  }
}

// Render current page anime cards + update pagination UI
function updateAnimeDisplay(results) {
  animeContainer.innerHTML = "";

  results.forEach(anime => {
    const title = anime.title?.english || anime.title?.romaji || anime.title?.native || "Unknown Title";
    let altTitle = "";
    if (anime.title?.romaji && anime.title.romaji !== title) {
      altTitle = anime.title.romaji;
    } else if (anime.title?.native && anime.title.native !== title) {
      altTitle = anime.title.native;
    }

    const card = document.createElement("div");
    card.classList.add("anime-card");
    card.innerHTML = `
      <img src="${anime.image}" alt="${title}">
      <p class="anime-name">${title}</p>
      ${altTitle ? `<p class="alt-name">${altTitle}</p>` : ""}
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

// Pagination button handlers
prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateAnimeDisplay(paginatedResults.slice((currentPage - 1) * perPage, currentPage * perPage));
  }
});

nextButton.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    updateAnimeDisplay(paginatedResults.slice((currentPage - 1) * perPage, currentPage * perPage));
  }
});

// Debounce for search input to avoid rapid firing
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
