const searchInput = document.querySelector("#search-input")
const loader = document.querySelector("#loader")
const podcastsList = document.querySelector("#podcasts-list")
const loadMoreBtn = document.querySelector("#load-more-btn")

const BASE_URL = "https://listen-api-test.listennotes.com/api/v2";
let currentPage = 1;
let nextPage=null;
isLoading = false;

function getBestPodcastsUrl(){
    
    const bestPodcastsUrl = `${BASE_URL}/best_podcasts?sort=recent_published_first&page=${currentPage}`;
   return bestPodcastsUrl
}


async function fetchBestPodcasts(){
    if (isLoading) return;
    const url= getBestPodcastsUrl();
    isLoading = true;
    loader.style.display = "block";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch podcasts");
        }
        const data = await response.json();
        nextPage = data.next_page_number;
        data.podcasts.forEach(podcast => {
        renderPodcastCard(podcast);
        
    });
      } catch (error) {
        console.error(error);
      } finally {
        loader.style.display = "none";
        isLoading = false;
      }

}

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
loadMoreBtn.addEventListener('click',function(){
   if (nextPage){
    currentPage = nextPage
   
 fetchBestPodcasts()}

  })
  