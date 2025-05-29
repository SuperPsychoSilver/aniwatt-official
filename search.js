const API_URL = "https://consumet-api-xmdg.onrender.com/meta/anilist";

const searchInput = document.getElementById("search-input");
const animeContainer = document.getElementById("anime-container");
const genreContainer = document.getElementById("genre-buttons");

let animeList = [];
let selectedGenres = new Set();

// Define your genre list manually
const genres = [
    "Action", "Adventure", "Isekai", "Fantasy", "Sci-Fi", "Thriller", "Horror",
    "Romance", "Comedy", "Demons", "Slice of Life", "Ecchi", "Mecha", "Mystery",
    "Harem", "Space", "Supernatural", "Game", "Music", "Sports", "Psychological",
    "Seinen", "Shounen", "Shoujo", "Josei", "Martial Arts", "Kids", "Drama"
];

// Create genre buttons dynamically
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
        updateAnimeDisplay();
    });
    genreContainer.appendChild(button);
});

// Fetch anime from API
async function fetchAnime() {
    try {
        const res = await fetch(`${API_URL}/popular?page=1&perPage=50`);
        const data = await res.json();
        animeList = data.results || [];
        updateAnimeDisplay();
    } catch (error) {
        animeContainer.innerHTML = "<p style='color: white;'>Failed to load anime. Please try again later.</p>";
        console.error("Anime fetch error:", error);
    }
}

function updateAnimeDisplay() {
    animeContainer.innerHTML = "";
    const searchQuery = searchInput.value.trim().toLowerCase();

    const filtered = animeList.filter(anime => {
        const matchesSearch = searchQuery === "" || anime.title.romaji.toLowerCase().includes(searchQuery);
        const matchesGenre = selectedGenres.size === 0 || [...selectedGenres].every(genre =>
            anime.genres.includes(genre)
        );
        return matchesSearch && matchesGenre;
    });

    if (filtered.length === 0) {
        animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
    } else {
        filtered.forEach(anime => {
            const card = document.createElement("div");
            card.classList.add("anime-card");
            card.innerHTML = `
                <img src="${anime.image}" alt="${anime.title.romaji}">
                <p>${anime.title.romaji}</p>
            `;
            card.addEventListener("click", () => {
                window.location.href = `bulb.html?anime=${encodeURIComponent(anime.title.romaji)}`;
            });
            animeContainer.appendChild(card);
        });
    }
}

searchInput.addEventListener("input", updateAnimeDisplay);

// Initial fetch on page load
fetchAnime();
