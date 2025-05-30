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
let currentResults = [];

const genres = [
  "Action", "Adventure", "Isekai", "Fantasy", "Sci-Fi", "Thriller", "Horror",
  "Romance", "Comedy", "Demons", "Slice of Life", "Ecchi", "Mecha", "Mystery",
  "Harem", "Space", "Supernatural", "Game", "Music", "Sports", "Psychological",
  "Seinen", "Shounen", "Shoujo", "Josei", "Martial Arts", "Kids", "Drama"
];

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

async function performSearch() {
  const query = searchInput.value.trim();
  currentResults = [];
  let page = 1;
  let keepFetching = true;
  const genreParam = [...selectedGenres].join(",");

  while (keepFetching) {
    let url;
    if (query) {
      url = `${API_URL}/search/${encodeURIComponent(query)}?page=${page}&perPage=50`;
    } else {
      url = `${API_URL}/popular?page=${page}&perPage=50`;
    }

    if (genreParam) url += `&genres=${encodeURIComponent(genreParam)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.results?.length) {
        currentResults = currentResults.concat(data.results);
      }

      if (!data.hasNextPage || currentResults.length >= 300) {
        keepFetching = false;
      } else {
        page++;
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      keepFetching = false;
    }
  }

  totalPages = Math.ceil(currentResults.length / perPage);
  updateAnimeDisplay();
}

function updateAnimeDisplay() {
  animeContainer.innerHTML = "";

  if (currentResults.length === 0) {
    animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
    pageInfo.textContent = "Page 0 / 0";
    return;
  }

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageResults = currentResults.slice(start, end);

  pageResults.forEach(anime => {
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

searchInput.addEventListener("input", () => {
  currentPage = 1;
  performSearch();
});

performSearch();
