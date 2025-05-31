const API_URL = "https://consumet-api-xmdg.onrender.com/meta/anilist";

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
pageInfo.textContent = "Page 1";

paginationContainer.appendChild(prevButton);
paginationContainer.appendChild(pageInfo);
paginationContainer.appendChild(nextButton);
document.body.appendChild(paginationContainer);

let selectedGenres = new Set();
let currentPage = 1;
const perPage = 49;
let totalPages = 1;
let paginatedResults = [];

const genres = [
  "Action", "Adventure", "Isekai", "Fantasy", "Sci-Fi", "Thriller", "Horror",
  "Romance", "Comedy", "Demons", "Slice of Life", "Ecchi", "Mecha", "Mystery",
  "Harem", "Space", "Supernatural", "Game", "Music", "Sports", "Psychological",
  "Seinen", "Shounen", "Shoujo", "Josei", "Martial Arts", "Kids", "Drama"
];

// Create genre filter buttons
genres.forEach(genre => {
  const button = document.createElement("button");
  button.classList.add("genre-button");
  button.textContent = genre;
  button.addEventListener("click", () => {
    if (selectedGenres.has(genre)) {
      selectedGenres.delete(genre);
      button.classList.remove("active");
    } else {
      selectedGenres.add(genre);
      button.classList.add("active");
    }
    currentPage = 1;
    performSearch();
  });
  genreContainer.appendChild(button);
});

// Fetch ALL results matching search/genre filters
async function performSearch(page = 1) {
  const query = searchInput.value.trim().toLowerCase();
  const genreParam = [...selectedGenres].join(",");
  let allResults = [];
  let currentPageIndex = 1;
  let hasNextPage = true;

  animeContainer.innerHTML = animeContainer.innerHTML = "<p style='color: white; font-family: Oswald, sans-serif;'>Loading all results...</p>";
  prevButton.disabled = true;
  nextButton.disabled = true;

  try {
    while (hasNextPage) {
      let url = query
        ? `${API_URL}/search?query=${encodeURIComponent(query)}&page=${currentPageIndex}&perPage=49`
        : `${API_URL}/popular?page=${currentPageIndex}&perPage=49`;

      if (genreParam) url += `&genres=${encodeURIComponent(genreParam)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.results?.length) break;

      allResults.push(...data.results);
      hasNextPage = data.hasNextPage ?? false;
      currentPageIndex++;
    }

    // Refine search results (exact title match filtering)
    const filtered = allResults.filter(anime => {
      const titles = [
        anime.title?.english?.toLowerCase(),
        anime.title?.romaji?.toLowerCase(),
        anime.title?.native?.toLowerCase()
      ].filter(Boolean);
      const matchesQuery = !query || titles.some(t => t.includes(query));
      const matchesGenres = [...selectedGenres].every(g => anime.genres?.includes(g));
      return matchesQuery && matchesGenres;
    });

    if (!filtered.length) {
      animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
      pageInfo.textContent = "Page 0 / 0";
      paginatedResults = [];
      totalPages = 1;
      return;
    }

    paginatedResults = filtered;
    totalPages = Math.ceil(filtered.length / perPage);
    currentPage = page;
    updateAnimeDisplay(paginatedResults.slice((page - 1) * perPage, page * perPage));

  } catch (err) {
    console.error("Error fetching data:", err);
    animeContainer.innerHTML = "<p style='color: white;'>Error loading data.</p>";
    pageInfo.textContent = "Page 0 / 0";
    paginatedResults = [];
    totalPages = 1;
  }
}

// Display current page's anime
function updateAnimeDisplay(results) {
  animeContainer.innerHTML = "";

  results.forEach(anime => {
    const englishTitle = anime.title?.english || anime.title?.romaji || anime.title?.native || "Unknown Title";
    let altTitle = "";
    if (anime.title?.romaji && anime.title.romaji !== englishTitle) {
      altTitle = anime.title.romaji;
    } else if (anime.title?.native && anime.title.native !== englishTitle) {
      altTitle = anime.title.native;
    }

    const card = document.createElement("div");
    card.classList.add("anime-card");
    card.innerHTML = `
      <img src="${anime.image}" alt="${englishTitle}">
      <p class="anime-name">${englishTitle}</p>
      ${altTitle ? `<p class="alt-name">${altTitle}</p>` : ""}
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

// Pagination controls
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

// Live search
searchInput.addEventListener("input", () => {
  currentPage = 1;
  performSearch();
});

// Initial load
performSearch();
