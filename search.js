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

const genres = [
  "Action", "Adventure", "Isekai", "Fantasy", "Sci-Fi", "Thriller", "Horror",
  "Romance", "Comedy", "Demons", "Slice of Life", "Ecchi", "Mecha", "Mystery",
  "Harem", "Space", "Supernatural", "Game", "Music", "Sports", "Psychological",
  "Seinen", "Shounen", "Shoujo", "Josei", "Martial Arts", "Kids", "Drama"
];

// Genre buttons
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

  if (query) {
    url = `${API_URL}/search/${encodeURIComponent(query)}?page=${currentPage}&perPage=${perPage}`;
  } else {
    url = `${API_URL}/popular?page=${currentPage}&perPage=${perPage}`;
  }

  if (genreParam) {
    url += `&genres=${encodeURIComponent(genreParam)}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    const results = data.results || [];
    const lastPage = data.pagination?.lastPage || 1;

    animeContainer.innerHTML = "";

    if (results.length === 0) {
      animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
      totalPages = 1;
    } else {
      results.forEach(anime => {
        const englishTitle = anime.title?.english || anime.title?.romaji || anime.title?.native || "Unknown Title";
        const altTitle = (anime.title?.romaji && anime.title.romaji !== englishTitle)
          ? anime.title.romaji
          : (anime.title?.native && anime.title.native !== englishTitle)
            ? anime.title.native
            : "";

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

      totalPages = lastPage;
    }

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;
    pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
  } catch (error) {
    console.error("Anime fetch error:", error);
    animeContainer.innerHTML = "<p style='color: white;'>Failed to load anime. Please try again later.</p>";
  }
}

// Pagination
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

searchInput.addEventListener("input", () => {
  currentPage = 1;
  fetchAnime();
});

fetchAnime();
