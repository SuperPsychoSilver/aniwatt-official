document.addEventListener("DOMContentLoaded", () => {
    const mangaList = [
        {
            id: "one-piece",
            title: "One Piece",
            image: "https://cdn.myanimelist.net/images/manga/2/253146.jpg",
            pdf: "https://drive.google.com/file/d/EXAMPLE_ONE/view"
        },
        {
            id: "attack-on-titan",
            title: "Attack on Titan",
            image: "https://cdn.myanimelist.net/images/manga/3/174603.jpg",
            pdf: "https://drive.google.com/file/d/EXAMPLE_TWO/view"
        },
        {
            id: "chainsaw-man",
            title: "Chainsaw Man",
            image: "https://cdn.myanimelist.net/images/manga/3/231402.jpg",
            pdf: "https://drive.google.com/file/d/EXAMPLE_THREE/view"
        },
        {
            id: "jujutsu-kaisen",
            title: "Jujutsu Kaisen",
            image: "https://cdn.myanimelist.net/images/manga/1/256717.jpg",
            pdf: "https://drive.google.com/file/d/EXAMPLE_FOUR/view"
        }
    ];

    const mangaContainer = document.getElementById("manga-list");

    mangaList.forEach(manga => {
        const div = document.createElement("div");
        div.classList.add("manga-item");

        div.innerHTML = `
            <img src="${manga.image}" alt="${manga.title}">
            <p>${manga.title}</p>
        `;

        div.addEventListener("click", () => {
            window.location.href = `circuit.html?mangaId=${encodeURIComponent(manga.id)}&pdf=${encodeURIComponent(manga.pdf)}`;
        });

        mangaContainer.appendChild(div);
    });

    // Search Functionality
    document.getElementById("search-btn").addEventListener("click", () => {
        const searchValue = document.getElementById("search-input").value.toLowerCase();
        const filteredManga = mangaList.filter(manga => manga.title.toLowerCase().includes(searchValue));
        
        mangaContainer.innerHTML = "";
        filteredManga.forEach(manga => {
            const div = document.createElement("div");
            div.classList.add("manga-item");

            div.innerHTML = `
                <img src="${manga.image}" alt="${manga.title}">
                <p>${manga.title}</p>
            `;

            div.addEventListener("click", () => {
                window.location.href = `circuit.html?mangaId=${encodeURIComponent(manga.id)}&pdf=${encodeURIComponent(manga.pdf)}`;
            });

            mangaContainer.appendChild(div);
        });
    });
});
