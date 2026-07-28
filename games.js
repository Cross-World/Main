  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("free-games-grid");
    const filterButtons = document.querySelectorAll(".filter-btn");
    let cachedGames = []; // Uložení dat pro rychlé filtrování bez nutnosti znovu volat API

    // Získání her z API
    async function fetchFreeGames() {
      try {
        // Použití GamerPower API přes veřejnou CORS proxy
        const apiUrl = "https://corsproxy.io/?" + encodeURIComponent("https://www.gamerpower.com/api/giveaways");
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error("Chyba při načítání her");
        
        const data = await response.json();
        // Filtrujeme pouze Giveaways typu "Game" (vynecháme DLC/loot)
        cachedGames = data.filter(item => item.type === "Game");
        
        renderGames(cachedGames);
      } catch (error) {
        console.error("API Error:", error);
        grid.innerHTML = `<div class="no-games">Nepodařilo se načíst hry zdarma. Zkuste to prosím později.</div>`;
      }
    }

    // Vykreslení karet do HTML
    function renderGames(games) {
      if (games.length === 0) {
        grid.innerHTML = `<div class="no-games">Pro zvolenou platformu nebyly nalezeny žádné hry zdarma.</div>`;
        return;
      }

      grid.innerHTML = games.map(game => `
        <article class="game-card">
          <img src="${game.thumbnail}" alt="${game.title}" loading="lazy">
          <div class="game-info">
            <h3 class="game-title">${game.title}</h3>
            <div class="game-meta">
              <span class="platform-tag">${formatPlatformName(game.platforms)}</span>
              <span class="worth-tag">${game.worth !== "N/A" ? game.worth : ""}</span>
            </div>
            <a href="${game.open_giveaway_url}" target="_blank" rel="noopener noreferrer" class="claim-btn">
              Získat zdarma
            </a>
          </div>
        </article>
      `).join('');
    }

    // Pomocná funkce pro zkrácení/úpravu názvu platformy
    function formatPlatformName(platforms) {
      if (platforms.includes("steam")) return "Steam";
      if (platforms.includes("epic-games-store")) return "Epic Games";
      if (platforms.includes("ps4") || platforms.includes("PS4") || platforms.includes("PS5")) return "PSN";
      if (platforms.includes("Xbox")) return "Xbox";
      if (platforms.includes("GOG")) return "GOG";
      return platforms.split(',')[0]; // Pokud je více platforem, vrátí první
    }

    // Logika filtrů
    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        // Změna aktivního tlačítka
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const selectedPlatform = button.getAttribute("data-platform");

        if (selectedPlatform === "all") {
          renderGames(cachedGames);
        } else {
          const filtered = cachedGames.filter(game => 
            game.platforms.toLowerCase().includes(selectedPlatform.toLowerCase())
          );
          renderGames(filtered);
        }
      });
    });

    // Spuštění načítání
    fetchFreeGames();
  });