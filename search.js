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
        // Use romaji or english or native titles safely with fallback
        const romajiTitle = anime.title?.romaji || "";
        const englishTitle = anime.title?.english || "";
        const nativeTitle = anime.title?.native || "";

        // Check search against romaji or english titles
        const matchesSearch = searchQuery === "" ||
            romajiTitle.toLowerCase().includes(searchQuery) ||
            englishTitle.toLowerCase().includes(searchQuery);

        // Check genres filter
        const matchesGenre = selectedGenres.size === 0 || [...selectedGenres].every(genre =>
            anime.genres.includes(genre)
        );

        return matchesSearch && matchesGenre;
    });

    if (filtered.length === 0) {
        animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
    } else {
        filtered.forEach(anime => {
            // Titles with fallbacks
            const englishTitle = anime.title?.english || anime.title?.romaji || anime.title?.native || "Unknown Title";
            // Alt title only if different from English
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

searchInput.addEventListener("input", updateAnimeDisplay);

// Initial fetch on page load
fetchAnime();
