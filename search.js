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
    performSearch(1);  // Pass page 1 explicitly here
  });
  genreContainer.appendChild(button);
});

async function performSearch(page = 1) {
  const query = searchInput.value.trim();
  const genreParam = [...selectedGenres].join(",");

  let url;
  if (query) {
    url = `${API_URL}/search/${encodeURIComponent(query)}?page=${page}&perPage=49`;
  } else {
    url = `${API_URL}/popular?page=${page}&perPage=49`;
  }

  if (genreParam) url += `&genres=${encodeURIComponent(genreParam)}`;

  animeContainer.innerHTML = "<p style='color: white;'>Loading...</p>";
  prevButton.disabled = true;
  nextButton.disabled = true;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results?.length) {
      animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
      pageInfo.textContent = "Page 0 / 0";
      totalPages = 1;
      currentPage = 1;
      return;
    }

    // Update pagination info based on API response
    // Assume API returns totalCount or hasNextPage or totalPages (check API docs)
    // If not, estimate total pages via: totalPages = Math.ceil(totalCount / perPage);
    // Here, fallback to hasNextPage logic for enabling next button

    totalPages = data.totalPages || (data.hasNextPage ? page + 1 : page);
    currentPage = page;

    updateAnimeDisplay(data.results);
  } catch (err) {
    console.error("Error fetching data:", err);
    animeContainer.innerHTML = "<p style='color: white;'>Error loading data.</p>";
    totalPages = 1;
    currentPage = 1;
  }
}

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

prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    performSearch(currentPage - 1);
  }
});

nextButton.addEventListener("click", () => {
  if (currentPage < totalPages) {
    performSearch(currentPage + 1);
  }
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  performSearch(currentPage);
});

performSearch(currentPage);
