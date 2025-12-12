document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://consumet-api-xmdg.onrender.com/meta/anilist";
  const ANILIST_GRAPHQL = "https://graphql.anilist.co";
  let showEnglish = true;
  let spotlightIndex = 0;

  function getTitle(anime) {
    return showEnglish
      ? (anime?.title?.english || anime?.title?.romaji || "Unknown")
      : (anime?.title?.romaji || "Unknown");
  }

  // SPOTLIGHT
  async function fetchSpotlight() {
    try {
      const query = `
        query {
          Page(perPage: 5) {
            media(sort: TRENDING_DESC, type: ANIME) {
              id
              title { romaji english }
              bannerImage
              coverImage { extraLarge }
              description(asHtml: false)
            }
          }
        }
      `;
      const res = await fetch(ANILIST_GRAPHQL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      const spotlights = data?.data?.Page?.media || [];

      const container = document.getElementById("spotlight");
      if (!container) return;
      container.querySelectorAll(".spotlight").forEach(el => el.remove());

      spotlights.forEach((anime) => {
        const imageUrl = anime?.bannerImage || anime?.coverImage?.extraLarge || "Images/placeholder.png";
        const el = document.createElement("div");
        el.className = "spotlight";
        el.style.background = `url("${imageUrl}") right/cover no-repeat`;
        container.appendChild(el);
      });

      spotlightIndex = 0;
      showSpotlight(spotlightIndex);
    } catch (err) {
      console.error("Spotlight fetch failed:", err);
    }
  }

  function showSpotlight(index) {
    const slides = document.querySelectorAll("#spotlight .spotlight");
    if (!slides.length) return;
    const container = document.getElementById("spotlight");
    const bg = slides[index].style.background;
    // extract url(...) portion if present and set as background-image
    container.style.backgroundImage = bg.includes('url(') ? bg.split('url(').slice(1).join('url(') : container.style.backgroundImage;
  }

  document.getElementById("prev-spotlight").addEventListener("click", () => {
    const slides = document.querySelectorAll("#spotlight .spotlight");
    if (!slides.length) return;
    spotlightIndex = (spotlightIndex - 1 + slides.length) % slides.length;
    showSpotlight(spotlightIndex);
  });

  document.getElementById("next-spotlight").addEventListener("click", () => {
    const slides = document.querySelectorAll("#spotlight .spotlight");
    if (!slides.length) return;
    spotlightIndex = (spotlightIndex + 1) % slides.length;
    showSpotlight(spotlightIndex);
  });

  // TRENDING CAROUSEL (infinite)
  async function fetchTrendingCarousel() {
    try {
      const res = await fetch(`${API_BASE}/trending`);
      const data = await res.json();
      const items = data?.results || [];
      const track = document.getElementById("trending-carousel");
      if (!track) return;
      track.innerHTML = "";

      // create item nodes
      const nodes = items.slice(0, 12).map((anime, i) => {
        const item = document.createElement("div");
        item.className = "carousel-item";
        const title = getTitle(anime);
        const imgSrc = anime?.image || 'Images/placeholder.png';
        item.innerHTML = `
          <img class="poster" src="${imgSrc}" alt="${title}">
          <div class="vtitle">${title}</div>
          <div class="index">${String(i+1).padStart(2,'0')}</div>
        `;
        return item;
      });

      // append nodes twice to enable seamless scrolling
      nodes.forEach(n => track.appendChild(n.cloneNode(true)));
      nodes.forEach(n => track.appendChild(n.cloneNode(true)));

      // Auto-scroll implementation: increment scrollLeft and loop
      let speed = 0.6; // px per frame (~60fps)
      let isHover = false;

      track.addEventListener('mouseenter', () => isHover = true);
      track.addEventListener('mouseleave', () => isHover = false);

      // set large scroll width safety
      function step() {
        if (!track) return;
        if (!isHover) {
          track.scrollLeft += speed;
        }
        // when we've scrolled half the content (since duplicated), reset to start
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0;
        }
        requestAnimationFrame(step);
      }
      // start at 0
      track.scrollLeft = 0;
      requestAnimationFrame(step);
    } catch (err) {
      console.error("Trending fetch failed:", err);
    }
  }

  // COLUMNS (cards)
  async function fetchColumns() {
    const endpoints = {
      airing: "airing-schedule",
      popular: "popular",
      favorite: "favorite",
      completed: "recent-episodes"
    };
    for (const [name, endpoint] of Object.entries(endpoints)) {
      try {
        const res = await fetch(`${API_BASE}/${endpoint}`);
        const data = await res.json();
        const results = data?.results || [];

        const mapNameToId = {
          airing: "airing-list",
          popular: "popular-list",
          favorite: "favorited-list",
          completed: "completed-list"
        };
        const list = document.getElementById(mapNameToId[name]);
        if (!list) continue;
        list.innerHTML = "";
        results.slice(0, 6).forEach(anime => {
          const li = document.createElement("li");
          li.innerHTML = `
            <img src="${anime?.image || 'Images/placeholder.png'}" alt="${getTitle(anime)}">
            <div class="meta">
              <div class="meta-title">${getTitle(anime)}</div>
              <div class="meta-badges"><span class="meta-pill small">TV</span></div>
            </div>
          `;
          list.appendChild(li);
        });
      } catch (err) {
        console.error(`Failed to fetch ${name}:`, err);
      }
    }
  }

  // SCHEDULE
  async function fetchWeeklySchedule() {
    try {
      const res = await fetch(`${API_BASE}/airing-schedule`);
      const data = await res.json();
      const results = data?.results || [];
      const daysContainer = document.getElementById("schedule-days");
      const listContainer = document.getElementById("schedule-list");
      if (!daysContainer || !listContainer) return;

      const days = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dayName = d.toLocaleDateString(undefined, { weekday: "short" });
        const dayLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        days.push({
          key: d.toISOString().slice(0,10),
          dateObj: d,
          name: dayName,
          label: dayLabel
        });
      }

      // Group results by YYYY-MM-DD using airingAt (epoch)
      const grouped = {};
      results.forEach(item => {
        const dt = item?.airingAt ? new Date(item.airingAt * 1000) : null;
        if (!dt) return;
        const key = dt.toISOString().slice(0,10);
        grouped[key] = grouped[key] || [];
        grouped[key].push(item);
      });

      daysContainer.innerHTML = "";
      days.forEach((d, idx) => {
        const pill = document.createElement("div");
        pill.className = "day-pill";
        pill.dataset.key = d.key;
        pill.innerHTML = `<div class="day-name">${d.name}</div><div class="day-date">${d.label}</div>`;
        pill.addEventListener("click", () => selectDay(idx));
        daysContainer.appendChild(pill);
      });

      let selectedIndex = 0;
      function selectDay(index){
        selectedIndex = index;
        daysContainer.querySelectorAll(".day-pill").forEach((p,i)=>{
          p.classList.toggle("selected", i === index);
        });
        renderScheduleForDay(days[index].key);
      }

      function renderScheduleForDay(key) {
        listContainer.innerHTML = "";
        const items = grouped[key] || [];
        if (!items.length) {
          const empty = document.createElement("div");
          empty.className = "schedule-row";
          empty.innerHTML = `<div class="time"></div><div class="title">No scheduled anime</div><div class="episode"></div>`;
          listContainer.appendChild(empty);
          return;
        }

        items.sort((a,b) => (a.airingAt||0) - (b.airingAt||0));
        items.forEach(item => {
          const time = item.airingAt ? new Date(item.airingAt * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "--:--";
          const row = document.createElement("div");
          row.className = "schedule-row";
          row.innerHTML = `
            <div class="time">${time}</div>
            <div class="title">${getTitle(item)} ${item?.season ? `<small class="muted">• ${item.season}</small>` : ""}</div>
            <div class="episode">► Episode ${item?.episode || "?"}</div>
          `;
          listContainer.appendChild(row);
        });
      }

      document.getElementById("day-prev").addEventListener("click", ()=>{
        const prev = Math.max(0, selectedIndex - 1);
        selectDay(prev);
        const pill = daysContainer.children[prev];
        pill?.scrollIntoView({behavior:'smooth', inline:'center'});
      });
      document.getElementById("day-next").addEventListener("click", ()=>{
        const next = Math.min(days.length - 1, selectedIndex + 1);
        selectDay(next);
        const pill = daysContainer.children[next];
        pill?.scrollIntoView({behavior:'smooth', inline:'center'});
      });

      selectDay(0);
    } catch (err) {
      console.error("Weekly schedule fetch failed:", err);
    }
  }

  // SEARCH REDIRECT
  const searchInput = document.getElementById("global-search");
  const searchButton = document.getElementById("global-search-btn");

  function handleSearch() {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      window.location.href = `socket.html?query=${encodeURIComponent(query)}`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearch();
    });
  }
  if (searchButton) searchButton.addEventListener("click", handleSearch);

  // Clock display in schedule header
  function startClock(){
    const clock = document.getElementById("schedule-clock");
    if (!clock) return;
    setInterval(()=> {
      const d = new Date();
      clock.textContent = `(GMT${-d.getTimezoneOffset()/60>=0?'+':''}${-d.getTimezoneOffset()/60}) ` + d.toLocaleString();
    }, 1000);
  }

  function loadAll() {
    fetchSpotlight();
    fetchTrendingCarousel();
    fetchColumns();
    fetchWeeklySchedule();
    startClock();
  }

  loadAll();
});
