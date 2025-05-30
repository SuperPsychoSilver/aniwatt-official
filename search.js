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

// Insert pagination container right after animeContainer for proper CSS scope
animeContainer.parentNode.insertBefore(paginationContainer, animeContainer.nextSibling);

let animeList = [];
let selectedGenres = new Set();
let currentPage = 1;
const maxPerPage = 56;
let perPage = 56;
let totalPages = 1;

// Debounce helper function to reduce API call spam
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

const genres = [
  "Action", "Adventure", "Isekai", "Fantasy", "Sci-Fi", "Thriller", "Horror",
  "Romance", "Comedy", "Demons", "Slice of Life", "Ecchi", "Mecha", "Mystery",
  "Harem", "Space", "Supernatural", "Game", "Music", "Sports", "Psychological",
  "Seinen", "Shounen", "Shoujo", "Josei", "Martial Arts", "Kids", "Drama"
];

// Create genre buttons
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
    fetchAnime();
  });
  genreContainer.appendChild(button);
});

async function fetchAnime() {
  const query = searchInput.value.trim();
  const genreParam = [...selectedGenres].join(",");

  let url;
  if (query !== "") {
    // Search endpoint: do NOT add genres param (likely unsupported)
    url = `${API_URL}/search/${encodeURIComponent(query)}?page=${currentPage}&perPage=${perPage}`;
  } else {
    // Popular endpoint supports genre filtering
    url = `${API_URL}/popular?page=${currentPage}&perPage=${perPage}`;
    if (genreParam) url += `&genres=${encodeURIComponent(genreParam)}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    animeList = data.results || [];
    totalPages = data.pagination?.lastPage || 1;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;

    pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;

    updateAnimeDisplay();
  } catch (error) {
    animeContainer.innerHTML = "<p style='color: white;'>Failed to load anime. Please try again later.</p>";
    console.error("Anime fetch error:", error);
  }
}

function updateAnimeDisplay() {
  animeContainer.innerHTML = "";

  if (animeList.length === 0) {
    animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
    return;
  }

  animeList.forEach(anime => {
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
}

// Pagination buttons
prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAnime();
  }
});

nextButton.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchAnime();
  }
});

// Debounced search input to avoid spamming API on every keystroke
searchInput.addEventListener("input", debounce(() => {
  currentPage = 1;
  fetchAnime();
}, 300));

// Initial fetch
fetchAnime();
