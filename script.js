//to fetch data from api
document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://api.tvmaze.com/shows/82/episodes";
  let allEpisodes = [];// to save data after loaded
  const resultCount = document.getElementById("search-result-count");
  resultCount.textContent = "Loading Episodes";
  fetch(apiUrl).then((response) => {
    if(!response.ok){
      throw new Error("Failed to load episodes");

    }
    return response.json();

  })
  .then((data)=> {
    allEpisodes = data;
    setup(allEpisodes);
  })
  // notify users if an error occur
  .catch((error)=>{
    resultCount.textContent = "Error: Unable to fetch episodes. Please try again.";
    console.error(error);
  });

});



function setup(allEpisodes) {
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

    const cardElement =episodeCard.querySelector(".episode-card");
    cardElement.id = `episode-${episode.id}`; //assume unique id for scrolling
    
    rootElem.appendChild(episodeCard);
  });
}


function setupSearchFeature(allEpisodes) {
  const searchInput = document.getElementById("search-input");
  const resultCount = document.getElementById("search-result-count");
  const episodeSelector = document.getElementById("episode-selector"); // Get the dropdown

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(episode =>
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
    );

    makePageForEpisodes(filteredEpisodes);
    // Reset dropdown to "Show All Episodes"
    episodeSelector.value = "all";
    // Update the episode count dynamically
    const filteredCount = filteredEpisodes.length;
    const totalCount = allEpisodes.length;
   //const totalCount = episodeSelector.options.length-1;

    resultCount.textContent = searchTerm === ""
     ? "Displaying all episodes"
     : `${filteredCount} episode(s) found out of ${totalCount} total episodes`;
      
    });
  
}


//to populate episode selector
function updateEpisodeSelector(episodeList){
 
  const episodeSelector = document.getElementById("episode-selector");
  episodeSelector.innerHTML ="";
   
  const showAllOption = document.createElement("option");
  showAllOption.value = "all";
  showAllOption.textContent = "Show All Episodes";
  episodeSelector.appendChild(showAllOption);
  
  episodeList.forEach((episode) => {
    const episodeNumber = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episodeNumber} - ${episode.name}`;
    episodeSelector.appendChild(option);

  });

}

// EPISODE SELECTOR FUNCTION
function setupEpisodeSelector(allEpisodes) {
  updateEpisodeSelector(allEpisodes);
  const episodeSelector = document.getElementById("episode-selector");
  const searchInput = document.getElementById("search-input");
  const resultCount = document.getElementById("search-result-count");
  episodeSelector.addEventListener("change", function (){
    searchInput.value = "";
    resultCount.textContent = "Displaying all episodes"; // Reset search count message

    if (this.value === "all") {
      makePageForEpisodes(allEpisodes); // Show all episodes
    } else {
      makePageForEpisodes(allEpisodes);
      setTimeout(() => {
        scrollToEpisode(this.value);
    }, 100);
  }
  });
}

function scrollToEpisode(episodeId){
  const episodeCard = document.getElementById(`episode-${episodeId}`);
  if(episodeCard){
    episodeCard.scrollIntoView({behavior: "smooth", block: "center"});
  }
}


  