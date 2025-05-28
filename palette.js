(function () {
    const html = document.documentElement;

    // Hide page visually before load
    html.style.visibility = "hidden";
    html.style.opacity = "0";

    window.addEventListener("DOMContentLoaded", function () {
        const body = document.body;

        // Add fade-in class
        body.classList.add("page-fade-in");

        // Create and insert blackout screen overlay
        const overlay = document.createElement("div");
        overlay.id = "blackScreenOverlay";
        Object.assign(overlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            zIndex: "9999",
            opacity: "1",
            transition: "opacity 2.85s ease-in-out",
            pointerEvents: "none"
        });
        document.body.appendChild(overlay);

        // Inject transition styles
        const style = document.createElement("style");
        style.innerHTML = `
            html, body {
                transition: opacity 2.85s ease-in-out;
            }
            body.page-fade-in {
                opacity: 1;
            }
            body.page-fade-out {
                opacity: 0;
            }
        `;
        document.head.appendChild(style);

        // Theme stylesheets
        const themeStylesheets = {
            styles: document.getElementById("themeStylesheet"),
            search: document.getElementById("themeSearchStylesheet"),
            wire: document.getElementById("themeWireStylesheet"),
            palette: document.getElementById("themePaletteStylesheet"),
            thunder: document.getElementById("themeThunderStylesheet"),
            bulb: document.getElementById("themeBulbStylesheet")
        };

        const themeImage = document.getElementById("themeImage");
        const themeLogo = document.getElementById("logo");

        function updateFavicon(iconPath) {
            let favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
            favicon.rel = "icon";
            favicon.href = iconPath;
            document.head.appendChild(favicon);
        }

        // Add gradient colors per theme here
        // Format: array of colors for linear-gradient
        const themes = {
            "Zenitsu Xanthic": {
                styles: "Themes/Zenitsu Xanthic/styles.css",
                search: "Themes/Zenitsu Xanthic/search.css",
                wire: "Themes/Zenitsu Xanthic/wire.css",
                palette: "Themes/Zenitsu Xanthic/palette.css",
                thunder: "Themes/Zenitsu Xanthic/thunder.css",
                bulb: "Themes/Zenitsu Xanthic/bulb.css",
                image: "Themes/Zenitsu Xanthic/Images/Zenitsu.png",
                logo: "Themes/Zenitsu Xanthic/Images/Logo.png",
                icon: "Themes/Zenitsu Xanthic/Images/Icon.png",
                gradientColors: ["#FFDD00", "#FFAA00", "#FFD700", "#FFCC33"]
            },
            "Kamado Carmine": {
                styles: "Themes/Kamado Carmine/Kamado Carmine-styles.css",
                search: "Themes/Kamado Carmine/Kamado Carmine-search.css",
                wire: "Themes/Kamado Carmine/Kamado Carmine-wire.css",
                palette: "Themes/Kamado Carmine/Kamado Carmine-palette.css",
                thunder: "Themes/Kamado Carmine/Kamado Carmine-thunder.css",
                bulb: "Themes/Kamado Carmine/Kamado Carmine-bulb.css",
                image: "https://i.imgur.com/1iLNQOB.png",
                logo: "https://i.imgur.com/YxoYriq.png",
                icon: "Themes/Kamado Carmine/Images/Icon.png",
                gradientColors: ["#B22222", "#FF6347", "#DC143C", "#FF4500"]
            },
            // Add gradientColors similarly for all themes...
            "Sakura Blossom": {
                styles: "Themes/Sakura Blossom/Sakura Blossom-styles.css",
                search: "Themes/Sakura Blossom/Sakura Blossom-search.css",
                wire: "Themes/Sakura Blossom/Sakura Blossom-wire.css",
                palette: "Themes/Sakura Blossom/Sakura Blossom-palette.css",
                thunder: "Themes/Sakura Blossom/Sakura Blossom-thunder.css",
                bulb: "Themes/Sakura Blossom/Sakura Blossom-bulb.css",
                image: "Themes/Sakura Blossom/Images/Sakura-Blossom-Image.png",
                logo: "Themes/Sakura Blossom/Images/Sakura-Blossom-Logo.png",
                icon: "Themes/Sakura Blossom/Images/Favicon.png",
                gradientColors: ["#FFC0CB", "#FFB6C1", "#FF69B4", "#FF1493"]
            }
            // ...and so on for other themes
        };

        // Variables to control gradient animation
        let gradientAngle = 0;
        let currentGradientColors = [];
        let animationFrameId;

        // Function to update background gradient animation
        function animateBackground() {
            gradientAngle = (gradientAngle + 0.5) % 360; // degrees per frame (adjust speed here)
            // Build linear-gradient CSS string with current angle & colors
            const gradientString = `linear-gradient(${gradientAngle}deg, ${currentGradientColors.join(", ")})`;
            document.body.style.background = gradientString;
            // Loop animation
            animationFrameId = requestAnimationFrame(animateBackground);
        }

        function applyTheme(themeName, skipSave = false) {
            const theme = themes[themeName];
            if (!theme) return;

            overlay.style.opacity = "100";

            setTimeout(() => {
                for (let key in themeStylesheets) {
                    if (themeStylesheets[key] && theme[key]) {
                        themeStylesheets[key].setAttribute("href", theme[key]);
                    }
                }

                if (themeImage && theme.image) themeImage.src = theme.image;
                if (themeLogo && theme.logo) themeLogo.src = theme.logo;
                if (theme.icon) updateFavicon(theme.icon);

                // Update gradient colors and restart animation
                if (theme.gradientColors) {
                    currentGradientColors = theme.gradientColors;
                    // Cancel previous animation if any
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    // Reset angle for smooth restart
                    gradientAngle = 0;
                    animateBackground();
                } else {
                    // If no gradient colors, remove background animation
                    document.body.style.background = "";
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                }

                if (!skipSave) localStorage.setItem("selectedTheme", themeName);

                setTimeout(() => {
                    overlay.style.opacity = "0";
                }, 200);
            }, 300);
        }

        function loadTheme() {
            const savedTheme = localStorage.getItem("selectedTheme") || "Zenitsu Xanthic";
            if (themes[savedTheme]) {
                applyTheme(savedTheme, true);
            }

            // Reveal page once ready
            setTimeout(() => {
                html.style.transition = "opacity 2.85s ease-in-out";
                html.style.visibility = "visible";
                html.style.opacity = "1";

                overlay.style.opacity = "0";

                requestAnimationFrame(() => {
                    body.classList.remove("page-fade-in");
                });
            }, 100);
        }

        loadTheme();

        // Theme button clicks
        document.querySelectorAll(".theme-option").forEach(button => {
            button.addEventListener("click", function () {
                const selectedTheme = this.getAttribute("data-theme");

                overlay.style.transition = "none";
                overlay.style.opacity = "1";
                overlay.offsetHeight;
                overlay.style.transition = "opacity 1s ease";

                setTimeout(() => {
                    applyTheme(selectedTheme);
                }, 200);
            });
        });

        // Navigation fade-out
        document.querySelectorAll("a[href]").forEach(link => {
            const isSameTab = link.target !== "_blank" && !link.href.startsWith("javascript:");

            if (isSameTab && link.href.startsWith(window.location.origin)) {
                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    overlay.style.opacity = "1";

                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 500);
                });
            }
        });
    });
})();
