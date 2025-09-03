document.addEventListener("DOMContentLoaded", () => {
  const animeList = [
    {
      id: "jujutsu-kaisen",
      title: "Jujutsu Kaisen",
      altTitle: "Jujutsu Kaisen",
      episodes: 47,
      image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
      desc: "The battle between sorcerers and curses continues."
    },
    {
      id: "solo-leveling",
      title: "Solo Leveling",
      altTitle: "Ore dake Level Up na Ken",
      episodes: 12,
      image: "https://cdn.myanimelist.net/images/anime/1801/142390.jpg",
      desc: "A weak hunter awakens unrivaled strength."
    },
    {
      id: "chainsaw-man",
      title: "Chainsaw Man",
      altTitle: "Chainsaw Man",
      episodes: 12,
      image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
      desc: "Denji fuses with a chainsaw devil to survive."
    },
    {
      id: "attack-on-titan",
      title: "Attack on Titan",
      altTitle: "Shingeki no Kyojin",
      episodes: 75,
      image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      desc: "Mankind battles against towering titans."
    },
    {
      id: "demon-slayer-kimetsu-no-yaiba",
      title: "Demon Slayer",
      altTitle: "Kimetsu no Yaiba",
      episodes: 26,
      image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
      desc: "A boy fights demons after tragedy strikes."
    },
    {
      id: "one-piece",
      title: "One Piece",
      altTitle: "One Piece",
      episodes: 1124,
      image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
      desc: "Luffy sails to find the legendary treasure."
    },
    {
      id: "mashle",
      title: "Mashle",
      altTitle: "Mashle: Magic and Muscles",
      episodes: 24,
      image: "https://cdn.myanimelist.net/images/anime/1861/135106.jpg",
      desc: "In a world of magic, a boy relies on pure strength."
    }
  ];

  // Spotlight
  function setSpotlight(anime) {
    const spotlight = document.getElementById("spotlight");
    spotlight.innerHTML = `
      <img src="${anime.image}" alt="${anime.title}">
      <div class="spotlight-overlay">
        <div class="spotlight-text">
          <h2>${anime.title}</h2>
          <p>${anime.desc}</p>
        </div>
      </div>
    `;
  }
  setSpotlight(animeList[0]); // Default spotlight

  // Trending scroll
  const trendingRow = document.getElementById("trending-row");
  animeList.slice(0, 5).forEach(anime => {
    const div = document.createElement("div");
    div.classList.add("scroll-item");
    div.innerHTML = `
      <img src="${anime.image}" alt="${anime.title}">
      <p>${anime.title}</p>
    `;
    div.addEventListener("click", () => setSpotlight(anime));
    trendingRow.appendChild(div);
  });

  // Collection grid
  const collection = document.getElementById("anime-collection");
  animeList.forEach(anime => {
    const div = document.createElement("div");
    div.classList.add("grid-item");
    div.innerHTML = `
      <img src="${anime.image}" alt="${anime.title}">
      <p>${anime.title} (${anime.altTitle})</p>
    `;
    div.addEventListener("click", () => {
      window.location.href = `bulb.html?animeId=${encodeURIComponent(anime.id)}`;
    });
    collection.appendChild(div);
  });

  // Random button
  document.getElementById("random-btn").addEventListener("click", () => {
    const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];
    setSpotlight(randomAnime);
  });

  // Schedule tabs (placeholder demo)
  const scheduleList = document.getElementById("schedule-list");
  const tabs = document.querySelectorAll(".schedule-tabs .tab");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const type = tab.dataset.type;
      scheduleList.innerHTML = `<p>Showing schedule for <strong>${type}</strong> (coming soon)</p>`;
    });
  });
});
