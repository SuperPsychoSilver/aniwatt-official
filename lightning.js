        document.addEventListener("DOMContentLoaded", () => {
            const animeList = [
                {
                    id: "jujutsu-kaisen",
                    title: "Jujutsu Kaisen",
                    altTitle: "Jujutsu Kaisen",
                    episodes: 47,
                    image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg"
                },
                {
                    id: "solo-leveling",
                    title: "Solo Leveling",
                    altTitle: "Ore dake Level Up na Ken",
                    episodes: 12,
                    image: "https://cdn.myanimelist.net/images/anime/1801/142390.jpg"
                },
                {
                    id: "chainsaw-man",
                    title: "Chainsaw Man",
                    altTitle: "Chainsaw Man",
                    episodes: 12,
                    image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg"
                },
                {
                    id: "attack-on-titan",
                    title: "Attack on Titan",
                    altTitle: "Shingeki no Kyojin",
                    episodes: 75,
                    image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg"
                },
                {
                    id: "demon-slayer-kimetsu-no-yaiba",
                    title: "Demon Slayer",
                    altTitle: "Kimetsu no Yaiba",
                    episodes: 26,
                    image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg"
                },
                {
                    id: "one-piece",
                    title: "One Piece",
                    altTitle: "One Piece",
                    episodes: 1124,
                    image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg"
                },
                {
                    id: "mashle",
                    title: "Mashle",
                    altTitle: "Mashle: Magic and Muscles",
                    episodes: 24,
                    image: "https://cdn.myanimelist.net/images/anime/1861/135106.jpg"
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

            populateAnimeList(animeList.slice(0, 3), "trending-anime");
            populateAnimeList(animeList.slice(3, 5), "latest-anime");
            populateAnimeList(animeList, "anime-collection");

            document.getElementById("search-btn").addEventListener("click", () => {
                const searchValue = document.getElementById("search-input").value.toLowerCase();
                const filteredAnime = animeList.filter(anime => 
                    anime.title.toLowerCase().includes(searchValue)
                );
                populateAnimeList(filteredAnime, "anime-collection");
            });
        });

