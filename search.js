// JavaScript for search and filter functionality

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const genreButtons = document.querySelectorAll(".genre-button");
const animeContainer = document.getElementById("anime-container");
const defaultAnime = document.querySelectorAll(".default-anime");

// Sample anime data with multiple genres
const animeList = [
    { name: "Attack on Titan", genres: ["Action", "Adventure"], image: "aot.jpg" },
    { name: "One Piece", genres: ["Adventure", "Fantasy"], image: "onepiece.jpg" },
    { name: "Demon Slayer", genres: ["Action", "Fantasy"], image: "demonslayer.jpg" },
    { name: "Sword Art Online", genres: ["Adventure", "Isekai"], image: "sao.jpg" },
    { name: "Naruto", genres: ["Action", "Adventure"], image: "naruto.jpg" },
    { name: "Re:Zero", genres: ["Isekai", "Fantasy"], image: "rezero.jpg" },
    { name: "Dragon Ball Z", genres: ["Action", "Adventure"], image: "dbz.jpg" },
    { name: "My Hero Academia", genres: ["Action", "Superhero"], image: "mha.jpg" },
    { name: "Tokyo Ghoul", genres: ["Action", "Horror"], image: "tokyoghoul.jpg" },
    { name: "Black Clover", genres: ["Fantasy", "Adventure"], image: "blackclover.jpg" }
    { name: "Solo Leveling", genres: ["Action", "Fantasy"], image: "https://cdn.myanimelist.net/images/anime/1926/140799.jpg" }
];

let selectedGenres = new Set();

// Function to update displayed anime
function updateAnimeDisplay() {
    animeContainer.innerHTML = "";
    const searchQuery = searchInput.value.trim().toLowerCase();

    const filteredAnime = animeList.filter(anime => {
        const matchesSearch = searchQuery === "" || anime.name.toLowerCase().includes(searchQuery);

        // Ensure the anime has ALL selected genres
        const matchesGenre = selectedGenres.size === 0 || [...selectedGenres].every(genre => anime.genres.includes(genre));

        return matchesGenre && matchesSearch;
    });

    if (filteredAnime.length === 0) {
        animeContainer.innerHTML = "<p style='color: white;'>No results found.</p>";
    } else {
        filteredAnime.forEach(anime => {
            const animeCard = document.createElement("div");
            animeCard.classList.add("anime-card");
            animeCard.innerHTML = `<img src="${anime.image}" alt="${anime.name}"><p>${anime.name}</p>`;
            animeContainer.appendChild(animeCard);
        });
    }
}

// Show all anime when the page loads
updateAnimeDisplay();



// Search functionality (Fixed so search actually updates the display)
searchButton.addEventListener("click", updateAnimeDisplay);
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        updateAnimeDisplay();
    }
});

// Ensure default anime appear if no search or genre filters are active
if (selectedGenres.size === 0 && searchInput.value.trim() === "") {
    defaultAnime.forEach(anime => anime.style.display = "block");
}

genreButtons.forEach(button => {
    button.addEventListener("click", () => {
        const genre = button.textContent.trim();
        if (selectedGenres.has(genre)) {
            selectedGenres.delete(genre);
            button.classList.remove("active");
        } else {
            selectedGenres.add(genre);
            button.classList.add("active");
        }
        updateAnimeDisplay();
    });
});

