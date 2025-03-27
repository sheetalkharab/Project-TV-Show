let allEpisodes = []; // Store episodes globally

document.addEventListener("DOMContentLoaded", async () => {
  const showSelector = document.getElementById("show-selector");
  const episodeSelector = document.getElementById("episode-selector");
  const searchInput = document.getElementById("search-input");

  let allShows = await fetchShows();
  populateShowSelector(allShows);

  // When a user selects a show
  showSelector.addEventListener("change", async () => {
    const selectedShowId = showSelector.value;
    if (selectedShowId !== "") {
      allEpisodes = await fetchEpisodes(selectedShowId);
      setup(allEpisodes);
    }
  });

  // When a user selects an episode
  episodeSelector.addEventListener("change", function () {
    const selectedEpisodeId = this.value;
    if (selectedEpisodeId === "all") {
      makePageForEpisodes(allEpisodes);
    } else {
      const selectedEpisode = allEpisodes.find(episode => episode.id == selectedEpisodeId);
      if (selectedEpisode) {
        makePageForEpisodes([selectedEpisode]);
      }
    }
  });

  // When a user types in the search bar
  searchInput.addEventListener("input", () => {
    filterEpisodes(searchInput.value);
  });
});

// Fetch all shows
async function fetchShows() {
  const apiUrl = "https://api.tvmaze.com/shows";
  try {
    let response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to load shows");
    let shows = await response.json();
    return shows.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Fetch episodes for a selected show
async function fetchEpisodes(showId) {
  const apiUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
  try {
    let response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to load episodes");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Populate the show dropdown
function populateShowSelector(shows) {
  const showSelector = document.getElementById("show-selector");
  showSelector.innerHTML = '<option value="">Select a show</option>';
  shows.forEach(show => {
    let option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelector.appendChild(option);
  });
}

// Set up page with episodes
function setup(episodes) {
  makePageForEpisodes(episodes);
  updateEpisodeSelector(episodes);
}

// Function to highlight search term in text
function highlightText(text, searchTerm) {
  if (searchTerm) {
    const regex = new RegExp(searchTerm, "gi");
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
  }
  return text;
}

// Make page for episodes (including highlights)
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ''; // Clear previous content
  const template = document.getElementById("episode-card-template");

  const searchTerm = document.getElementById("search-input").value.toLowerCase().trim();

  episodeList.forEach(episode => {
    const episodeCard = template.content.cloneNode(true);
    const episodeNumber = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;

    // Highlight episode name and summary
    episodeCard.querySelector(".episode-name").innerHTML = highlightText(`${episode.name} - ${episodeNumber}`, searchTerm);
    episodeCard.querySelector("img").src = episode.image ? episode.image.medium : 'placeholder.jpg';
    episodeCard.querySelector("[data-summary]").innerHTML = highlightText(episode.summary || "No summary available.", searchTerm);

    rootElem.appendChild(episodeCard);
  });

  // Update search result count
  const resultCount = document.getElementById("search-result-count");
  resultCount.textContent = `Displaying ${episodeList.length} episode(s)`;
}

// Populate episode dropdown
function updateEpisodeSelector(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  episodeSelector.innerHTML = '';

  const showAllOption = document.createElement("option");
  showAllOption.value = "all";
  showAllOption.textContent = "Show All Episodes";
  episodeSelector.appendChild(showAllOption);

  episodes.forEach(ep => {
    let option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")} - ${ep.name}`;
    episodeSelector.appendChild(option);
  });
}

// Search episodes
function filterEpisodes(searchTerm) {
  searchTerm = searchTerm.toLowerCase().trim();

  const filteredEpisodes = allEpisodes.filter(episode =>
    episode.name.toLowerCase().includes(searchTerm) ||
    episode.summary.toLowerCase().includes(searchTerm)
  );

  makePageForEpisodes(filteredEpisodes);
}
