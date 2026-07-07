const searchInput = document.querySelector("#search-input")
const loader = document.querySelector("#loader")
const podcastsList = document.querySelector("#podcasts-list")
const loadMoreBtn = document.querySelector("#load-more-btn")

const BASE_URL = "https://listen-api-test.listennotes.com/api/v2";
let currentPage = 1;

function getBestPodcastsUrl(){
    
    const bestPodcastsUrl = `${BASE_URL}/best_podcasts?sort=recent_published_first&page=${currentPage}`;
   return bestPodcastsUrl
}


async function fetchBestPodcasts(){
    const url= getBestPodcastsUrl();
    const response = await fetch(url)
    const data = await response.json();
    
    data.podcasts.forEach(podcast => {
        renderPodcastCard(podcast);
    });


}
fetchBestPodcasts();
function renderPodcastCard(podcast){
    const podcastCard = document.createElement('div');
    podcastCard.classList.add('podcast__card');
    podcastCard.innerHTML = `
        <img src = "${podcast.image}" alt = "${podcast.title}">
        <h3>${podcast.title}</h3>
        <p>${podcast.publisher}</p>
    `
      
    
    podcastsList.append(podcastCard)

}
fetchBestPodcasts();