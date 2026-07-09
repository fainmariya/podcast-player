const searchInput = document.querySelector("#search-input")
const loader = document.querySelector("#loader")
const podcastsList = document.querySelector("#podcasts-list")
const loadMoreBtn = document.querySelector("#load-more-btn")

const BASE_URL = "https://listen-api-test.listennotes.com/api/v2";
let currentPage = 1;
let nextPage=null;
let isLoading = false;
let searchTimeout = null;

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
    let cardTitle = podcast.title || podcast.title_original;;
    let cardPublisher = podcast.publisher || podcast.publisher_original;
    let cardImage = podcast.image || podcast.thumbnail;
    
        podcastCard.innerHTML = `
        <img src = "${cardImage}" alt = "${cardTitle}">
        <h3>${cardTitle}</h3>
        <p>${cardPublisher}</p>
    `
   
    
    
      
    
    podcastsList.append(podcastCard)

}
fetchBestPodcasts();
loadMoreBtn.addEventListener('click',function(){
   if (nextPage){
    currentPage = nextPage
   
 fetchBestPodcasts()}

  })
  searchInput.addEventListener("input",function(){
    const searchValue  = searchInput.value.trim();

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(function(){
        if (searchValue === "") {
            podcastsList.innerHTML ="";
            currentPage =1;
            nextPage = null;
            fetchBestPodcasts();

            
            return;
          }
          fetchSearchPodcasts(searchValue);
  }, 1000);
    })
    
function getSearchPodcastsUrl(query){
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `${BASE_URL}/search?q=${encodedQuery}&type=podcast`
    return searchUrl


}
async function fetchSearchPodcasts(query) {
    if (isLoading) return;

    const urlSearchPodcast= getSearchPodcastsUrl(query);

    isLoading = true;
    loader.style.display = "block";

    try {
        const response = await fetch(urlSearchPodcast);
        if (!response.ok) {
            throw new Error("Failed to fetch podcasts");
        }
        const dataSearch = await response.json();
        podcastsList.innerHTML = "";
        dataSearch.results.forEach((result) => {
            renderPodcastCard(result.podcast);
          });
        
      } catch (error) {
        console.error(error);
      } finally {
        loader.style.display = "none";
        isLoading = false;
      }
}
  