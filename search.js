const API_URL = "https://api.jikan.moe/v4/anime";
const searchInput = document.getElementById("search-input");
const animeContainer = document.getElementById("anime-container");
const genreContainer = document.getElementById("genre-buttons");

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

paginationContainer.appendChild(prevButton);
paginationContainer.appendChild(pageInfo);
paginationContainer.appendChild(nextButton);
document.body.appendChild(paginationContainer);

const genres = [
  "Action", "Adventure", "Isekai", "Fantasy", "Sci-Fi", "Thriller", "Horror",
  "Romance", "Comedy", "Demons", "Slice of Life", "Ecchi", "Mecha", "Mystery",
  "Harem", "Space", "Supernatural", "Game", "Music", "Sports", "Psychological",
  "Seinen", "Shounen", "Shoujo", "Josei", "Martial Arts", "Kids", "Drama"
];

let selectedGenres = new Set();
let currentPage = 1;
const perPage = 49;
let paginatedResults = [];

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

function filterAnime(anime, query, genreList) {
  const titles = [
    anime.title_english?.toLowerCase(),
    anime.title_romaji?.toLowerCase(),
    anime.title?.toLowerCase()
  ].filter(Boolean);

  const matchesQuery = !query || titles.some(t => t.includes(query));
  const animeGenres = (anime.genres || []).map(g => g.name.toLowerCase());
  const matchesGenres = genreList.every(g => animeGenres.includes(g.toLowerCase()));

  return matchesQuery && matchesGenres;
}

async function fetchAnimeBatch(query, pageIndex) {
  const url = query
    ? `${API_URL}?q=${encodeURIComponent(query)}&page=${pageIndex}&limit=25`
    : `${API_URL}?page=${pageIndex}&limit=25`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("API error: " + res.status);
  const data = await res.json();
  return data.data;
}

async function performSearch() {
  const query = searchInput.value.trim().toLowerCase();
  const genreList = [...selectedGenres];
  animeContainer.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <div id="loading-message">Loading...</div>
    </div>
  `;

  const pageOffset = (currentPage - 1) * perPage;
  const neededPages = Math.ceil((pageOffset + perPage) / 25);
  const fetchedResults = [];

  try {
    for (let i = 1; i <= neededPages; i++) {
      let retryCount = 0;
      let success = false;

      while (!success && retryCount < 5) {
        try {
          const batch = await fetchAnimeBatch(query, i);
          fetchedResults.push(...batch);
          success = true;
        } catch (err) {
          if (err.message.includes("429")) {
            document.getElementById("loading-message").textContent = "429 Error: Too Many Requests. Retrying...";
            retryCount++;
            await delay(1000 * retryCount); // exponential backoff
          } else {
            throw err; // throw other errors immediately
          }
        }
      }

      if (!success) throw new Error("429 Error: Too many requests, retry failed.");
      await delay(250);
    }

    const filtered = fetchedResults.filter(anime => filterAnime(anime, query, genreList));
    paginatedResults = filtered;
    updateAnimeDisplay();

  } catch (err) {
    console.error(err);
    animeContainer.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <div style="color: white;">${err.message}</div>
      </div>
    `;
    pageInfo.textContent = "Page 0 / 0";
  }
}

function updateAnimeDisplay() {
  animeContainer.innerHTML = "";
 
  const totalPages = Math.ceil(paginatedResults.length / perPage) || 1;
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const results = paginatedResults.slice(start, end);

  results.forEach(anime => {
    const englishTitle = anime.title_english || anime.title || anime.title_romaji || "Unknown Title";
    const altTitle = anime.title && anime.title !== englishTitle
      ? anime.title
      : englishTitle;

    const image = anime.images?.jpg?.image_url || "";

    const card = document.createElement("div");
    card.classList.add("anime-card");
    card.innerHTML = `
      <img src="${image}" alt="${englishTitle}">
      <p class="anime-name">${englishTitle}</p>
      <p class="alt-name">${altTitle}</p>
    `;
    card.addEventListener("click", () => {
      window.location.href = `bulb.html?anime=${encodeURIComponent(englishTitle)}`;
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
    performSearch();
  }
});

nextButton.addEventListener("click", () => {
  const totalPages = Math.ceil(paginatedResults.length / perPage) || 1;
  if (currentPage < totalPages) {
    currentPage++;
    performSearch();
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
