let allEpisodes = []; // Store episodes globally
let allShows = [];

let selectedShowId = "";
let selectedEpisodeId = "";

document.addEventListener("DOMContentLoaded", async () => {
   
  const showSelector = document.getElementById("show-selector");
  const episodeSelector = document.getElementById("episode-selector");
  const searchInput = document.getElementById("search-input");

  allShows = await fetchShows();
  populateShowSelector(allShows);
  displayAllShowsList(allShows);

  // When a user selects a show
  showSelector.addEventListener("change", async () => {
    selectedShowId = showSelector.value;

    // const episodeSelector = document.getElementById("episode-selector");
    episodeSelector.innerHTML = '';//clear previous episode options

    //to add default "show all episodes" option
    const showAllOption = document.createElement("option");
    showAllOption.value = "all";
    showAllOption.textContent = "Show All Episodes";
    episodeSelector.appendChild(showAllOption);

    if (selectedShowId !== "") {
      allEpisodes = await fetchEpisodes(selectedShowId);
      setup(allEpisodes);

      // If there was a previously selected episode, make sure it's in the dropdown
      if (selectedEpisodeId) {
        const episodeOption = document.createElement("option");
        const selectedEpisode = allEpisodes.find(ep => ep.id === selectedEpisodeId);
        if (selectedEpisode) {
          episodeOption.value = selectedEpisode.id;
          episodeOption.textContent = `S${String(selectedEpisode.season).padStart(2, "0")}E${String(selectedEpisode.number).padStart(2, "0")} - ${selectedEpisode.name}`;
          episodeSelector.appendChild(episodeOption);
        }
      }
    } else {
      displayAllShowsList(allShows);// show allShows list when no show is selected
    }
  });

// When a user selects an episode
  episodeSelector.addEventListener("change", function () {
    selectedEpisodeId = this.value;
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
    filterShowsAndEpisodes(searchInput.value);
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
    showErrorMessage("failed to load shows. Please try again!");
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
    showErrorMessage("Failed to load episodes. Please try again!");
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
  const totalCount = allEpisodes.length;
  const resultCount = document.getElementById("search-result-count");
  resultCount.textContent = `Displaying ${episodeList.length} episode(s)  out of ${totalCount} total episodes`;
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

function displayAllShowsList(showList){
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
    showCard.querySelector(".show-status").innerHTML = highlightText(show.status || "Unknown", searchTerm);
    showCard.querySelector(".show-rating").innerHTML = highlightText(show.rating?.average ? show.rating.average.toString() :"Not Rated", searchTerm);
    showCard.querySelector(".show-runtime").innerHTML = highlightText(show.runtime ? `${show.runtime} min` : "Unknown", searchTerm);
    showCard.querySelector(".show-summary").innerHTML = highlightText(show.summary || "No summary available.", searchTerm);

    rootElem.appendChild(showCard);
  });

  const totalShowsCount = allShows.length; // Total available shows
  const resultCount = document.getElementById("search-result-count");

  resultCount.textContent = `Displaying ${showList.length} show(s) out of ${totalShowsCount} total shows`;
}


function filterShowsAndEpisodes(searchTerm) {
  searchTerm = searchTerm.toLowerCase().trim();
//if search is empty, restore default view
  if(searchTerm === ""){
    if(!selectedShowId){
      displayAllShowsList(allShows);// show allShows when now show is selected
    }else if(selectedEpisodeId === "all"){
      makePageForEpisodes(episodeList);// show all episodes of selected show
    }else if(selectedEpisodeId){
      const selectedEpisode = episodeList.find(episode=> episode.id == selectedEpisodeId);
      if(selectedEpisode){
        makePageForEpisodes([selectedEpisode]);// show only selected episode
      }
    }else {
      // If no specific episode or search is clear, show all episodes
      makePageForEpisodes(allEpisodes);
    }
    return;
  }
// if a show is selected, filter episodes inside that
  if(selectedShowId){
  const filteredEpisodes = allEpisodes.filter(episode =>{

    const episodeIdentifier = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;
    return episode.name.toLowerCase().includes(searchTerm) ||
    episode.summary&& episode.summary.toLowerCase().includes(searchTerm)||
    episodeIdentifier.toLowerCase().includes(searchTerm)
    
  });

  makePageForEpisodes(filteredEpisodes);
} else {
  // search in the shows
  const filteredShows = allShows.filter(show =>
    show.name.toLowerCase().includes(searchTerm) ||
    show.genres.some(genre => genre.toLowerCase().includes(searchTerm)) ||
    (show.summary && show.summary.toLowerCase().includes(searchTerm)) ||
    (show.runtime!== null && show.runtime !== undefined && show.runtime.toString().includes(searchTerm))||
    (typeof show.status === "string" && show.status.toLowerCase().includes(searchTerm)) || 
    (show.rating && show.rating.average !== null && show.rating.average !== undefined && show.rating.average.toString().includes(searchTerm)) 
    
  );
  displayAllShowsList(filteredShows);

}
}

function showErrorMessage(message){
  const errorContainer = document.getElementById("error-message-container");
  errorContainer.textContent = message;
  errorContainer.style.display = "block";
}



