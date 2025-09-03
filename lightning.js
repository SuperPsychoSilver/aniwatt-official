document.addEventListener("DOMContentLoaded", () => {
    const animeList = [
        {
            id: "jujutsu-kaisen",
            title: "Jujutsu Kaisen",
            altTitle: "Jujutsu Kaisen",
            episodes: 47,
            image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
            description: "A boy swallows a cursed talisman—the finger of a demon—and gains its power."
        },
        {
            id: "solo-leveling",
            title: "Solo Leveling",
            altTitle: "Ore dake Level Up na Ken",
            episodes: 12,
            image: "https://cdn.myanimelist.net/images/anime/1801/142390.jpg",
            description: "Sung Jin-Woo, the weakest hunter, gains the ability to level up endlessly."
        },
        {
            id: "chainsaw-man",
            title: "Chainsaw Man",
            altTitle: "Chainsaw Man",
            episodes: 12,
            image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
            description: "Denji fuses with his pet devil Pochita to become Chainsaw Man."
        },
        {
            id: "attack-on-titan",
            title: "Attack on Titan",
            altTitle: "Shingeki no Kyojin",
            episodes: 75,
            image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
            description: "Humanity fights for survival against man-eating Titans."
        },
        {
            id: "demon-slayer-kimetsu-no-yaiba",
            title: "Demon Slayer",
            altTitle: "Kimetsu no Yaiba",
            episodes: 26,
            image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
            description: "Tanjiro sets out to turn his sister back into a human."
        },
        {
            id: "one-piece",
            title: "One Piece",
            altTitle: "One Piece",
            episodes: 1124,
            image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
            description: "Luffy and his crew sail the seas in search of the One Piece."
        },
        {
            id: "mashle",
            title: "Mashle",
            altTitle: "Mashle: Magic and Muscles",
            episodes: 24,
            image: "https://cdn.myanimelist.net/images/anime/1861/135106.jpg",
            description: "In a world of magic, Mash only has muscles—but he’s unstoppable."
        }
    ];

    function populateAnimeList(animeArray, elementId) {
        const listElement = document.getElementById(elementId);
        if (!listElement) return;

        listElement.innerHTML = "";
        animeArray.forEach(anime => {
            const li = document.createElement("li");
            li.classList.add("anime-item");
            li.innerHTML = `
                <img src="${anime.image}" alt="${anime.title}">
                <div class="anime-info">
                    <p class="anime-title">${anime.title}</p>
                    <p class="anime-alt-title">${anime.altTitle}</p>
                    <p class="anime-details">Episodes: ${anime.episodes}</p>
                </div>
            `;

            li.addEventListener("click", () => {
                window.location.href = `bulb.html?animeId=${encodeURIComponent(anime.id)}`;
            });
            listElement.appendChild(li);
        });
    }

    // Spotlight logic
    function setSpotlight(anime) {
        const spotlightBg = document.querySelector(".spotlight-bg img");
        const spotlightTitle = document.querySelector(".spotlight-info h1");
        const spotlightMeta = document.querySelector(".spotlight-info .meta");
        const spotlightDesc = document.querySelector(".spotlight-info .desc");

        spotlightBg.src = anime.image;
        spotlightBg.alt = anime.title;
        spotlightTitle.textContent = anime.title;
        spotlightMeta.textContent = `Episodes: ${anime.episodes}`;
        spotlightDesc.textContent = anime.description;

        // Watch button redirect
        document.querySelector(".watch-btn").onclick = () => {
            window.location.href = `bulb.html?animeId=${encodeURIComponent(anime.id)}`;
        };
        document.querySelector(".detail-btn").onclick = () => {
            window.location.href = `bulb.html?animeId=${encodeURIComponent(anime.id)}`;
        };
    }

    // Fill lists
    populateAnimeList(animeList.slice(0, 3), "trending-anime");
    populateAnimeList(animeList.slice(3, 5), "latest-anime");
    populateAnimeList(animeList, "anime-collection");

    // Pick spotlight (choose from "latest-anime")
    const latestSpotlight = animeList.slice(3, 5);
    const picked = latestSpotlight[Math.floor(Math.random() * latestSpotlight.length)];
    setSpotlight(picked);

    // Search
    document.getElementById("search-btn").addEventListener("click", () => {
        const searchValue = document.getElementById("search-input").value.toLowerCase();
        const filteredAnime = animeList.filter(anime => 
            anime.title.toLowerCase().includes(searchValue)
        );
        populateAnimeList(filteredAnime, "anime-collection");
    });
});
