let allEpisodes = []; // Store episodes globally
let allShows = [];

document.addEventListener("DOMContentLoaded", async () => {
  const showSelector = document.getElementById("show-selector");
  const episodeSelector = document.getElementById("episode-selector");
  const searchInput = document.getElementById("search-input");

  allShows = await fetchShows();
  populateShowSelector(allShows);
  displayAllShows(allShows);

  // When a user selects a show
  showSelector.addEventListener("change", async () => {
    const selectedShowId = showSelector.value;
    if (selectedShowId !== "") {
      allEpisodes = await fetchEpisodes(selectedShowId);
      setup(allEpisodes);
    } else {
      displayAllShows(allShows);
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
  const showsApiUrl = "https://api.tvmaze.com/shows";
  try {
    let response = await fetch(showsApiUrl);
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
  const episodesApiUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
  const showDetailsApiUrl =  `https://api.tvmaze.com/shows/${showId}`;
  try {
    const [episodesResponse, showResponse] = await Promise.all([
    fetch(episodesApiUrl),
    fetch(showDetailsApiUrl)
  ]); 
    if (!episodesResponse.ok || !showResponse.ok) throw new Error("Failed to load content");
    const episodes= await episodesResponse.json();
    const showDetails= await showResponse.json();

    // Attach show details to each episode (so we can access them later)
  episodes.forEach(ep => {
    ep.showGenres = showDetails.genres || [];
    ep.showStatus = showDetails.status || "Unknown";
  });

    return episodes;
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

function displayAllShows(showList){
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = '';// to clear previous content
  const template = document.getElementById("show-card-template");
  const searchTerm = document.getElementById("search-input").value.toLowerCase().trim();

  showList.forEach(show => {
    const showCard = template.content.cloneNode(true);

    
    showCard.querySelector(".show-name").innerHTML = highlightText(show.name, searchTerm);
    showCard.querySelector(".show-image").src = show.image?.medium || 'placeholder.jpg';
    showCard.querySelector(".show-image").alt = show.name;
    showCard.querySelector(".show-genres").innerHTML = highlightText(show.genres.join(", ")|| "N/A", searchTerm);
    showCard.querySelector(".show-status").textContent = show.status || "Unknown";
    showCard.querySelector(".show-rating").textContent = show.rating?.average || "Not Rated";
    showCard.querySelector(".show-runtime").textContent = show.runtime ? `${show.runtime} min` : "Unknown";
    showCard.querySelector(".show-summary").innerHTML = highlightText(show.summary || "No summary available.", searchTerm);

    rootElem.appendChild(showCard);
  });
}


function filterEpisodes(searchTerm) {
  searchTerm = searchTerm.toLowerCase().trim();

  if(allEpisodes.length > 0){
  const filteredEpisodes = allEpisodes.filter(episode =>
    episode.name.toLowerCase().includes(searchTerm) ||
    episode.summary.toLowerCase().includes(searchTerm)||
    episode.showGenres.some(genre => genre.toLowerCase().includes(searchTerm))
  );

  makePageForEpisodes(filteredEpisodes);
} else {
  // Otherwise, search in the shows
  const filteredShows = allShows.filter(show =>
    show.name.toLowerCase().includes(searchTerm) ||
    show.genres.some(genre => genre.toLowerCase().includes(searchTerm)) ||
    (show.summary && show.summary.toLowerCase().includes(searchTerm))
  );
  displayAllShows(filteredShows);

}

}

