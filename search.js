const API_URL = "https://consumet-api-xmdg.onrender.com/meta/anilist";

const searchInput = document.getElementById("search-input");
const animeContainer = document.getElementById("anime-container");
const genreContainer = document.getElementById("genre-buttons");
const paginationContainer = document.createElement("div");
paginationContainer.classList.add("pagination");

// Pagination buttons
const prevButton = document.createElement("button");
prevButton.textContent = "← Prev";
prevButton.disabled = true;

const nextButton = document.createElement("button");
nextButton.textContent = "Next →";

const pageInfo = document.createElement("span");
pageInfo.id = "page-info";
pageInfo.textContent = "Page 1";

paginationContainer.appendChild(prevButton);
paginationContainer.appendChild(pageInfo);
paginationContainer.appendChild(nextButton);
animeContainer.parentNode.insertBefore(paginationContainer, animeContainer.nextSibling);

let animeList = [];
let selectedGenres = new Set();
let currentPage = 1;
const perPage = 50;  // keep your original perPage

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
        currentPage = 1;  // Reset page on filter change
        fetchAnime();
    });
    genreContainer.appendChild(button);
});

// Fetch anime from API with pagination
async function fetchAnime() {
    try {
        // Prepare genre param string (comma separated)
        const genreParam = [...selectedGenres].join(",");
        const res = await fetch(`${API_URL}/popular?page=${currentPage}&perPage=${perPage}&genres=${genreParam}`);
        const data = await res.json();

        animeList = data.results || [];
        updateAnimeDisplay();

        // Update pagination buttons
        prevButton.disabled = currentPage === 1;
        // If total pages available in data (assuming data.pagination.lastPage or similar)
        // fallback if not present, enable next always
        if (data.pagination?.lastPage) {
            nextButton.disabled = currentPage >= data.pagination.lastPage;
            pageInfo.textContent = `Page ${currentPage} / ${data.pagination.lastPage}`;
        } else {
            // No pagination info? Just show current page and always enable next
            nextButton.disabled = animeList.length < perPage;  // disable if less than perPage means last page
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

        // Check search against romaji or english titles
        const matchesSearch = searchQuery === "" ||
            romajiTitle.toLowerCase().includes(searchQuery) ||
            englishTitle.toLowerCase().includes(searchQuery);

        // genres are filtered on server now, no need to filter again here
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

// Pagination button events
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

// Search input filters anime list client side (filtering current page results)
searchInput.addEventListener("input", updateAnimeDisplay);

// Initial fetch on page load
fetchAnime();
