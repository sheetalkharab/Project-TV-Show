// Function to initialize the page
function setup() {
  const allEpisodes = getAllEpisodes(); // Fetch all episodes
  makePageForEpisodes(allEpisodes);
  setupSearchFeature(allEpisodes);
  setupEpisodeSelector(allEpisodes);
}

// Function to display episodes
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ''; // Clear previous content
  const template = document.getElementById("episode-card-template");

  episodeList.forEach((episode) => {
    const episodeCard = template.content.cloneNode(true); // Clone the template content
    const episodeNumber = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;

    episodeCard.querySelector(".episode-name").textContent = `${episode.name} - ${episodeNumber}`;
    episodeCard.querySelector("img").src = episode.image ? episode.image.medium : "placeholder.jpg"; // Fallback image
    episodeCard.querySelector("[data-summary]").innerHTML = episode.summary || "No summary available.";
    
    rootElem.appendChild(episodeCard);
  });
}

// SEARCH FUNCTION (Updated to reset dropdown)
function setupSearchFeature(episodes) {
  const searchInput = document.getElementById("search-input");
  const resultCount = document.getElementById("search-result-count");
  const episodeSelector = document.getElementById("episode-selector"); // Get dropdown

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm === "") {
      episodeSelector.value = "all"; // Reset dropdown when search is cleared
    }

    const filteredEpisodes = episodes.filter(episode =>
      episode.name.toLowerCase().includes(searchTerm) || 
      episode.summary.toLowerCase().includes(searchTerm)
    );

    makePageForEpisodes(filteredEpisodes);
    resultCount.textContent = `Displaying ${filteredEpisodes.length} of ${episodes.length} episodes`;
  });
}

// EPISODE SELECTOR FUNCTION
function setupEpisodeSelector(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  
  // "Show All" option
  const showAllOption = document.createElement("option");
  showAllOption.value = "all";
  showAllOption.textContent = "Show All Episodes";
  episodeSelector.appendChild(showAllOption);

  // Populate dropdown with episodes
  episodes.forEach(episode => {
    const episodeNumber = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episodeNumber} - ${episode.name}`;
    episodeSelector.appendChild(option);
  });

  episodeSelector.addEventListener("change", (event) => {
    if (event.target.value === "all") {
      makePageForEpisodes(episodes); // Show all episodes
    } else {
      const selectedEpisode = episodes.find(ep => ep.id == event.target.value);
      if (selectedEpisode) {
        makePageForEpisodes([selectedEpisode]); // Show only the selected episode
      }
    }
  });
}

window.onload = setup;
