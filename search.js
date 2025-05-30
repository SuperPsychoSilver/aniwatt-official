const API_URL = "https://consumet-api-xmdg.onrender.com/meta/anilist";

const searchInput = document.getElementById("search-input");
const animeContainer = document.getElementById("anime-container");
const genreContainer = document.getElementById("genre-buttons");

const paginationContainer = document.createElement("div");
paginationContainer.classList.add("pagination-container");

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

document.body.appendChild(paginationContainer); // Add to body or wherever you prefer

let animeList = [];
let selectedGenres = new Set();
let currentPage = 1;
const perPage = 50;

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
        fetchAnime();
    });
    genreContainer.appendChild(button);
});

async function fetchAnime() {
    try {
        const genreParam = [...selectedGenres].join(",");
        const res = await fetch(`${API_URL}/popular?page=${currentPage}&perPage=${perPage}&genres=${genreParam}`);
        const data = await res.json();

        animeList = data.results || [];
        updateAnimeDisplay();

        // Pagination logic
        prevButton.disabled = currentPage === 1;
        if (data.pagination?.lastPage) {
            nextButton.disabled = currentPage >= data.pagination.lastPage;
            pageInfo.textContent = `Page ${currentPage} / ${data.pagination.lastPage}`;
        } else {
            nextButton.disabled = animeList.length < perPage;
            pageInfo.textContent = `Page ${currentPage}`;
        }
    } catch (error) {
        animeContainer.innerHTML = "<p style='color: white;'>Failed to load anime. Please try again later.</p>";
        console.error("Anime fetch error:", error);
    }
}

function updateAnimeDisplay() {
    animeContainer.innerHTML = "";
    const searchQuery = searchInput.value.trim().toLowerCase();

    const filtered = animeList.filter(anime => {
        const romajiTitle = anime.title?.romaji || "";
        const englishTitle = anime.title?.english || "";
        const nativeTitle = anime.title?.native || "";

        const matchesSearch = searchQuery === "" ||
            romajiTitle.toLowerCase().includes(searchQuery) ||
            englishTitle.toLowerCase().includes(searchQuery);

        return matchesSearch;
    });

    if (filtered.length === 0) {
        animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
    } else {
        filtered.forEach(anime => {
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
                ${altTitle ? `<p class="alt-name">${altTitle}</p>` : ''}
            `;
            card.addEventListener("click", () => {
                window.location.href = `bulb.html?anime=${encodeURIComponent(englishTitle)}`;
            });
            animeContainer.appendChild(card);
        });
    }
}

prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        fetchAnime();
    }
});

nextButton.addEventListener("click", () => {
    currentPage++;
    fetchAnime();
});

searchInput.addEventListener("input", updateAnimeDisplay);
fetchAnime();
