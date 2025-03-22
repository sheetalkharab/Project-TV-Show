function setup() {
  const allEpisodes = getAllEpisodes();
  createSearchBar();
  createEpisodeSelector(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

function createSearchBar() {
  const rootElem = document.getElementById("root");
  const searchContainer = document.createElement("div");
  const searchInput = document.createElement("input");
  const resultCount = document.createElement("p");
  
  searchInput.type = "text";
  searchInput.placeholder = "Search episodes...";
  searchInput.addEventListener("input", () => filterEpisodes(searchInput.value, resultCount));
  
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(resultCount);
  rootElem.prepend(searchContainer);
}

function filterEpisodes(query, resultCount) {
  const allEpisodes = getAllEpisodes();
  const filteredEpisodes = allEpisodes.filter(({ name, summary }) => 
    name.toLowerCase().includes(query.toLowerCase()) || 
    summary.toLowerCase().includes(query.toLowerCase())
  );
  
  resultCount.textContent = `Showing ${filteredEpisodes.length} episode(s)`;
  makePageForEpisodes(filteredEpisodes);
}

function createEpisodeSelector(episodeList) {
  const rootElem = document.getElementById("root");
  const select = document.createElement("select");
  const defaultOption = document.createElement("option");
  
  defaultOption.textContent = "Select an episode...";
  defaultOption.value = "";
  select.appendChild(defaultOption);
  
  episodeList.forEach(({ name, season, number }) => {
    const option = document.createElement("option");
    option.value = `S${String(season).padStart(2, '0')}E${String(number).padStart(2, '0')}`;
    option.textContent = `${option.value} - ${name}`;
    select.appendChild(option);
  });
  
  select.addEventListener("change", (event) => {
    if (event.target.value) {
      scrollToEpisode(event.target.value);
    }
  });
  
  rootElem.prepend(select);
}

function scrollToEpisode(episodeCode) {
  const episodes = document.querySelectorAll(".episode");
  episodes.forEach(episode => {
    if (episode.querySelector("h2").textContent.includes(episodeCode)) {
      episode.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  let episodeSection = document.getElementById("episodeSection");
  if (episodeSection) {
    episodeSection.innerHTML = "";
  } else {
    episodeSection = document.createElement("div");
    episodeSection.id = "episodeSection";
    rootElem.appendChild(episodeSection);
  }
  
  episodeList.forEach(({ name, season, number, image, summary }) => {
    const episodeCode = `S${String(season).padStart(2, '0')}E${String(number).padStart(2, '0')}`;
    const episodeElement = document.createElement("div");
    episodeElement.classList.add("episode");
    
    const titleElement = document.createElement("h2");
    titleElement.textContent = `${name} - ${episodeCode}`;
    
    const imageElement = document.createElement("img");
    imageElement.src = image.original;
    imageElement.alt = `Image for ${name}`;
    imageElement.style.width = "300px";
    
    const summaryElement = document.createElement("p");
    summaryElement.innerHTML = summary;
    
    episodeElement.appendChild(titleElement);
    episodeElement.appendChild(imageElement);
    episodeElement.appendChild(summaryElement);
    episodeSection.appendChild(episodeElement);
  });
}

window.onload = setup;
