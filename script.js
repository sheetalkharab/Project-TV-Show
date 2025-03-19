//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  //create a section for all episodes
  const episodeSection = document.createElement('div');

  episodeList.forEach(({name, season, number, image, summary}) => {
    const episodeCode= `S${String(season).padStart(2, '0')}E${String(number).padStart(2, '0')}`;
    
    //create a section for each episode
    const episodeElement = document.createElement('div');
    episodeElement.classList.add('episode');
    
    //title and episode code
    const titleElement =document.createElement('h2');
    titleElement.textContent = `${name} - ${episodeCode}`;

    //image element for each episode
    const imageElement = document.createElement('img');
    imageElement.src = image.original;
    imageElement.alt= `Image for ${name}`;
    imageElement.style.width = '300px';

    //summary 
    const summaryElement= document.createElement('p');
    summaryElement.innerHTML= summary;

    episodeElement.appendChild(titleElement);
    episodeElement.appendChild(imageElement);
    episodeElement.appendChild(summaryElement);

    episodeSection.appendChild(episodeElement);


  });
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
  rootElem.appendChild(episodeSection);

  const sourceLink = document.createElement('p');
  sourceLink.innerHTML =  'Data from <a href= "https://www.tvmaze.com/api#licensing" target="_blank">TVMaze.com</a>';
  rootElem.appendChild(sourceLink);
} 

window.onload = setup;
