document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get("animeId");

    // Predefined anime details with Google Drive links + episode names
const animeData = {
    "jujutsu-kaisen": {
        title: "Jujutsu Kaisen",
        "alt-title": "呪術廻戦",
        image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
        description: "Yuuji Itadori, a high schooler, leads an ordinary life, spending his days either hanging out with the Occult Club or visiting his bedridden grandfather at the hospital. However, everything changes when he stumbles upon a mysterious cursed object. This fateful encounter triggers a series of supernatural events, culminating in Yuuji unwittingly swallowing the object—a finger belonging to the fearsome demon Ryoumen Sukuna, the King of Curses. Now, Yuuji is thrust into a dangerous world of curses—beings born from human malice and negativity. As he gains strange and formidable powers, he is taken to Tokyo Jujutsu High, where he begins his training to become a Jujutsu sorcerer. With no way to go back, Yuuji embarks on a journey to fight the deadly curses and protect humanity from these terrifying, malevolent entities. [Written by AniWatt Recharged]",
            episodes: 47,
            episodesLinks: [
                "https://drive.google.com/file/d/DRAGONDEEXNUTS/preview",
                "https://drive.google.com/file/d/BULAJNJNEJEN/preview"
            ],
            episodesNames: [
                "Ryomen Sukuna",
                "For Myself"
            ]
        },
        "solo-leveling": {
            title: "Solo Leveling",
            "alt-title": "I Level Up Alone",
            image: "https://cdn.myanimelist.net/images/anime/1542/124991l.jpg?_gl=1*17zyppo*_gcl_au*MTY0Njg1ODk0MC4xNzQwNzk3NjUx*_ga*NzU4MjYyNDgzLjE3NDA3OTc2NDc.*_ga_26FEP9527K*MTc0MjQ3MjcyMy4xMC4wLjE3NDI0NzI3MjMuNjAuMC4w",
            description: "Humanity found itself on the edge of destruction a decade ago when the first gates—portals connecting to other dimensions filled with monsters resistant to ordinary weapons—suddenly appeared across the globe. Alongside the gates, certain humans were transformed into hunters, gaining superhuman abilities. These hunters, tasked with entering the gates and clearing the dungeons within, formed guilds to secure their livelihoods and protect the world from the terrifying threats lurking within. Sung Jin-Woo, an E-rank hunter, is known as the weakest hunter alive. During an expedition in what was supposed to be a safe dungeon, he and his party stumble upon a mysterious tunnel that leads to an unknown and dangerous area. Tempted by the possibility of treasure, they venture deeper, only to encounter unspeakable horrors. Miraculously, Jin-Woo is the sole survivor of the incident and discovers he has gained access to a mysterious interface that only he can see. This new system offers him the strength he's always dreamed of—but it comes with an unexpected cost. [Written by AniWatt Recharged]",
            episodes: 12,
            episodesLinks: [
                "https://drive.google.com/file/d/19zM7XG9FpH7WC_xs3bwBaW77ZtXXZnqv/preview",
                "https://drive.google.com/file/d/1xkM0u-U-1GmcwE3AGxj28oBRKv6BvL5o/preview",
                "https://drive.google.com/file/d/1H5eV-k6PKrxZnFikZwKPfNPKhu-tt0lg/preview",
                "https://drive.google.com/file/d/1A1zyyLoVIwa7Vlf3FakXJoT7tWexVLBl/preview",
                "https://drive.google.com/file/d/1euQ_0c0CYAl3iKLQU_WSAfcGYcT9aJt2/preview",
                "https://drive.google.com/file/d/1YNnfMkb-Tp5FTV6WHi02VZCvbfRHf-0K/preview",
                "https://drive.google.com/file/d/10facB8eWdhc0zDTQfS-qbIMOFlTzZGT2/preview",
                "https://drive.google.com/file/d/1aQPL4yyciLse2ISzAaoI9uI2qcBXoNaC/preview",
                "https://drive.google.com/file/d/1tcjAbSGgMGYvNHvgr_RTY-cpwerXePYL/preview",
                "https://drive.google.com/file/d/1PZpwGZFWD6uRot8jQEiRwzzM9V-dD7fM/preview",
                "https://drive.google.com/file/d/16BbMkEDgPOWEs1a-X2mZ6KHDFswgrgh0/preview",
                "https://drive.google.com/file/d/11I9Chfd0egXqp2GGVBmVlfmUkizFq0bz/preview"
            ],
            episodesNames: [
                "I'm Used to It",
                "If I Had One More Chance",
                "It's Like A Game",
                "I've Gotta Get Stronger",
                "A Pretty Good Deal",
                "The Real Hunt Begins",
                "Let's See How Far I Can Go",
                "This Is Frustrating",
                "You've Been Hiding Your Skills",
                "What Is This, A Picnic?",
                "A Knight Who Defends An Empty Throne",
                "Arise"
            ]
        },
        "chainsaw-man": {
            title: "Chainsaw Man",
            image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
            description: "Denji, a young devil hunter, merges with his pet devil, becoming Chainsaw Man.",
            episodes: 12,
            episodesLinks: [
                "https://drive.google.com/file/d/ABCDJEJRJNRJFNJFNRNRN/preview",
                "https://drive.google.com/file/d/OKOKOKGOOTGMTMRMKJEJEJNJE/preview"
            ],
            episodesNames: [
                "Dog & Chainsaw",
                "Arrival in Tokyo"
            ]
        }
    };

    if (animeId && animeData[animeId]) {
        const anime = animeData[animeId];

        // Set anime title, image, and description
        document.getElementById("anime-title").textContent = anime.title;
        document.getElementById("anime-alt-title").textContent = anime["alt-title"]; // Set alt-title here
        document.getElementById("anime-image").src = anime.image;
        document.getElementById("anime-description").textContent = anime.description;

        // Populate episode list
        const episodeList = document.getElementById("episode-list");
anime.episodesLinks.forEach((link, index) => {
    const episodeName = anime.episodesNames?.[index] || `Episode ${index + 1}`;
    const li = document.createElement("li");
    li.textContent = episodeName;
li.addEventListener("click", () => {
    document.getElementById("anime-player").src = link;
});

    episodeList.appendChild(li);
});

        // Auto-play first episode
        document.getElementById("anime-player").src = anime.episodesLinks[0]
    } else {
        document.getElementById("anime-title").textContent = "Anime Not Found";
        document.getElementById("anime-description").textContent = "Please select an anime from the homepage.";
    }
});
