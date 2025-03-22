//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  //create a section for all episodes
  rootElem.innerHTML = '';
  const template = document.getElementById("episode-card-template") ;
  
  episodeList.forEach((episode) => {
    const episodeSection = template.content.cloneNode(true); // Clone the template content
    const episodeNumber = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;
    episodeSection.querySelector(".episode-name").textContent = `${episode.name} - ${episodeNumber}`;
    episodeSection.querySelector("img").src = episode.image.medium;
    episodeSection.querySelector("[data-summary]").innerHTML = episode.summary;
 
  // rootElem.textContent = `All ${episodeList.length} episodes`;
  rootElem.appendChild(episodeSection);

  
} );
}



window.onload = setup;
