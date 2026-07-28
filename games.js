document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("free-games-grid");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Funkce pro načtení her z API s parametrem platformy
  async function fetchFreeGames(platform = "all") {
    // Zobrazení načítání při každém přepnutí filtru
    grid.innerHTML = `<div class="loading">Načítám hry zdarma...</div>`;

    try {
      // Sestavení URL podle vybrané platformy
      let targetApiUrl = "https://www.gamerpower.com/api/giveaways?type=game";

      if (platform !== "all") {
        targetApiUrl += `&platform=${platform}`;
      }

      // Použití CORS proxy pro obcházení browser CORS striktnosti
      const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(targetApiUrl);
      
      const response = await fetch(proxyUrl);
      
      // GamerPower API vrací status 404 (nebo prázdné pole), pokud pro danou platformu nic nenajde
      if (response.status === 404) {
        renderGames([]);
        return;
      }

      if (!response.ok) throw new Error("Chyba při komunikaci s API");

      const games = await response.json();
      renderGames(games);

    } catch (error) {
      console.error("API Error:", error);
      grid.innerHTML = `<div class="no-games">Nepodařilo se načíst hry. Zkuste to prosím později.</div>`;
    }
  }

  // Vykreslení karet do HTML
  function renderGames(games) {
    if (!Array.isArray(games) || games.length === 0) {
      grid.innerHTML = `<div class="no-games">Pro tuto platformu nebyly nalezeny žádné aktuální hry zdarma.</div>`;
      return;
    }

    grid.innerHTML = games.map(game => `
      <article class="game-card">
        <img src="${game.thumbnail}" alt="${game.title}" loading="lazy">
        <div class="game-info">
          <h3 class="game-title">${game.title}</h3>
          <div class="game-meta">
            <span class="platform-tag">${game.platforms}</span>
            <span class="worth-tag">${game.worth !== "N/A" ? game.worth : ""}</span>
          </div>
          <a href="${game.open_giveaway_url}" target="_blank" rel="noopener noreferrer" class="claim-btn">
            Získat zdarma
          </a>
        </div>
      </article>
    `).join('');
  }

  // Event listenery pro tlačítka
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const platform = button.getAttribute("data-platform");
      fetchFreeGames(platform);
    });
  });

  // První načtení (všechny hry)
  fetchFreeGames("all");
});