const searchInput = document.querySelector("#search-input");
const loader = document.querySelector("#loader");
const podcastsList = document.querySelector("#podcasts-list");
const loadMoreBtn = document.querySelector("#load-more-btn");
const app = document.querySelector("#app");
const homePage = document.querySelector("#home-page");
const detailsPage = document.querySelector("#details-page");
const audioPlayer = document.querySelector("#audio-player");
const globalPlayer = document.querySelector("#global-player");
const globalPlayerCover = document.querySelector("#global-player-cover");
const globalPlayerTitle = document.querySelector("#global-player-title");
const globalPlayerReturn = document.querySelector("#global-player-return");
const globalPlayerClose = document.querySelector("#global-player-close");

let currentPlayingEpisode = null;


const BASE_URL = "https://listen-api-test.listennotes.com/api/v2";
let currentPage = 1;
let nextPage=null;
let isLoading = false;
let searchTimeout = null;
let currentSearchQuery = "";
let nextSearchOffset = null;

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
    let cardTitle = podcast.title || podcast.title_original;
    let cardPublisher = podcast.publisher || podcast.publisher_original;
    let cardImage = podcast.image || podcast.thumbnail;
    
        podcastCard.innerHTML = `
        <img src = "${cardImage}" alt = "${cardTitle}">
        <h3>${cardTitle}</h3>
        <p>${cardPublisher}</p>
    `
    podcastCard.addEventListener('click', function(){
        fetchPodcastDetails(podcast)
    })
    podcastsList.append(podcastCard)

}
fetchBestPodcasts();

loadMoreBtn.addEventListener('click',function(){
    if(currentSearchQuery !== ''){
        if (nextSearchOffset){
            fetchSearchPodcasts(currentSearchQuery, nextSearchOffset)
            
        }
        return;
        }
    if (nextPage) {
        currentPage = nextPage;
        fetchBestPodcasts()
    }
    });
  searchInput.addEventListener("input",function(){
    const searchValue  = searchInput.value.trim();

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(function(){
        if (searchValue === "") {
            podcastsList.innerHTML = "";
            currentPage = 1;
            nextPage = null;
            currentSearchQuery = "";
            nextSearchOffset = null;
        
            fetchBestPodcasts();
        
            return;
        }
          fetchSearchPodcasts(searchValue);
  }, 1000);
    })
    
function getSearchPodcastsUrl(query, offset){
    const encodedQuery = encodeURIComponent(query);
    let searchUrl;
    if(!offset){
        searchUrl = `${BASE_URL}/search?q=${encodedQuery}&type=podcast`;
    } else{
        searchUrl = `${BASE_URL}/search?q=${encodedQuery}&type=podcast&offset=${offset}`;
    }
   
    return searchUrl


}

async function fetchSearchPodcasts(query, offset) {
    if (isLoading) return;

    const urlSearchPodcast= getSearchPodcastsUrl(query, offset);
   
    isLoading = true;
    loader.style.display = "block";

    try {
        const response = await fetch(urlSearchPodcast);
        if (!response.ok) {
            throw new Error("Failed to fetch podcasts");
        }
        const dataSearch = await response.json();
        
        if (!offset){
            podcastsList.innerHTML = "";
        }
         
        currentSearchQuery = query;
        nextSearchOffset = dataSearch.next_offset;
        
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
function getPodcastDetailsUrl(podcastId){
    const podcastIdUrl = `${BASE_URL}/podcasts/${podcastId}`
    return podcastIdUrl
}
async function fetchPodcastDetails(podcast){
    const idPodcast = podcast.id
    const urlPodcastDetails = getPodcastDetailsUrl(idPodcast);
    const responsePodcastDetails = await fetch(urlPodcastDetails);
        if (!responsePodcastDetails.ok) {
            throw new Error("Failed to fetch podcasts");
        }
        const podcastSearch = await responsePodcastDetails.json();
        
        renderPodcastDetailsPage(podcastSearch, podcast);  
}
function renderPodcastDetailsPage(podcastSearch, selectedPodcast){
    homePage.hidden = true;
    detailsPage.hidden = false;
    
    history.pushState({ page: "details" }, "", "#details");
    const detailsImage = selectedPodcast.image || selectedPodcast.thumbnail;
    const detailsTitle = selectedPodcast.title || selectedPodcast.title_original;
    const detailsPublisher = selectedPodcast.publisher || selectedPodcast.publisher_original;

    const firstEpisode = podcastSearch.episodes[0];
    let selectedEpisode = firstEpisode;
    const firstEpisodeDate = new Date(firstEpisode.pub_date_ms).toLocaleDateString();
    const firstEpisodeMinutes = Math.floor(firstEpisode.audio_length_sec / 60);
    const firstEpisodeSeconds = firstEpisode.audio_length_sec % 60;

    detailsPage.innerHTML = `
        <button id="back-to-home-btn" class="details__back">← Back</button>

        <section class="details__hero">
            <img id="details-main-image" src="${detailsImage}" alt="${detailsTitle}" class="details__image">

           <div class="details__info">
                <h2 id="details-main-title">${detailsTitle}</h2>
                <p id="details-main-subtitle" class="details__publisher">${detailsPublisher}</p>
                <p id="details-main-description" class="details__description">${podcastSearch.description}</p>

                <button id="latest-episode-btn" class="details__play-btn">
                    ▶ Start Listening
                </button>

                <p id="details-main-meta" class="details__episode-time">
                    ${firstEpisodeDate} · ${firstEpisodeMinutes} min ${firstEpisodeSeconds} sec
                </p>
                
            </div>
        </section>

    <section class="episodes">
        <h3>Episodes</h3>
        <ul id="episodes-list" class="episodes__list"></ul>
    </section>
`;
    

    const latestEpisodeBtn = document.querySelector("#latest-episode-btn");

    latestEpisodeBtn.addEventListener('click', function(){

        updateMainEpisodeInfo(selectedEpisode, detailsImage);
        playEpisodeInGlobalPlayer(selectedEpisode, detailsImage);
    });
    const listDetail = document.querySelector("#episodes-list");
    podcastSearch.episodes.forEach(function(episode){
        const li = document.createElement("li");
        li.dataset.episodeId = episode.id;
        const episodeDate = new Date(episode.pub_date_ms).toLocaleDateString();
        const episodeMinutes = Math.floor(episode.audio_length_sec / 60);
        const episodeSeconds = episode.audio_length_sec % 60;
        li.classList.add("episode__item");

        const episodeImage = episode.thumbnail || episode.image || detailsImage;
        const cleanDescription = episode.description
    ? episode.description.replace(/<[^>]*>/g, "")
    : "";

const shortDescription = cleanDescription.length > 180
    ? cleanDescription.slice(0, 180) + "..."
    : cleanDescription;

li.innerHTML = `
    <img src="${episodeImage}" alt="${episode.title}" class="episode__image">

    <div class="episode__content">
        <h4 class="episode__title">${episode.title}</h4>
        <p class="episode__description">${shortDescription}</p>

        <div class="episode__meta">
            <button class="episode__play-btn">▶</button>
            <span>${episodeDate}</span>
            <span>·</span>
            <span>${episodeMinutes} min ${episodeSeconds} sec</span>
        </div>
        
    </div>
    `;
    const buttonPlay = li.querySelector(".episode__play-btn");
    buttonPlay.addEventListener('click', function(){

        updateMainEpisodeInfo(episode, detailsImage);
        playEpisodeInGlobalPlayer(episode, detailsImage);
    });
        listDetail.append(li);
    })
    const backBtn = document.querySelector("#back-to-home-btn")
    backBtn.addEventListener('click', function(){
        homePage.hidden = false;
        detailsPage.hidden = true;
    })
    
    }

    function updateMainEpisodeInfo(episode, fallbackImage) {
        const mainImage = document.querySelector("#details-main-image");
        const mainTitle = document.querySelector("#details-main-title");
        const mainSubtitle = document.querySelector("#details-main-subtitle");
        const mainDescription = document.querySelector("#details-main-description");
        const mainMeta = document.querySelector("#details-main-meta");
    
        const episodeImage = fallbackImage;
        const episodeDate = new Date(episode.pub_date_ms).toLocaleDateString();
        const episodeMinutes = Math.floor(episode.audio_length_sec / 60);
        const episodeSeconds = episode.audio_length_sec % 60;
    
        const cleanDescription = episode.description
            ? episode.description.replace(/<[^>]*>/g, "")
            : "";
    
        const shortDescription = cleanDescription.length > 260
            ? cleanDescription.slice(0, 260) + "..."
            : cleanDescription;
    
        mainImage.src = episodeImage;
        mainImage.alt = episode.title;
        mainTitle.textContent = episode.title;
        mainSubtitle.textContent = "Now playing";
        mainDescription.textContent = shortDescription;
        mainMeta.textContent = `${episodeDate} · ${episodeMinutes} min ${episodeSeconds} sec`;
    }

    function playEpisodeInGlobalPlayer(episode, coverImage) {
        currentPlayingEpisode = episode;
        
    
        globalPlayer.hidden = false;
    
        globalPlayerCover.src = coverImage;
        globalPlayerCover.alt = episode.title;
        globalPlayerTitle.textContent = episode.title;
    
        audioPlayer.src = episode.audio;
        audioPlayer.load();
        
        audioPlayer.play().catch(function(error) {
            console.error("Audio play failed:", error);
            console.error("Problem audio URL:", episode.audio);
        });
    
        document.querySelectorAll(".episode__item--active").forEach((item) => {
            item.classList.remove("episode__item--active");
        });
    
        const activeEpisodeItem = document.querySelector(`[data-episode-id="${episode.id}"]`);
        if (activeEpisodeItem) {
            activeEpisodeItem.classList.add("episode__item--active");
        }
    }
    globalPlayerReturn.addEventListener("click", function () {
        if (!currentPlayingEpisode) return;
    
        homePage.hidden = true;
        detailsPage.hidden = false;
    
        const activeEpisodeItem = document.querySelector(`[data-episode-id="${currentPlayingEpisode.id}"]`);
    
        if (activeEpisodeItem) {
            activeEpisodeItem.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    });
    globalPlayerClose.addEventListener("click", function () {
        audioPlayer.pause();
        audioPlayer.removeAttribute("src");
        audioPlayer.load();
    
        globalPlayer.hidden = true;
        currentPlayingEpisode = null;
    });
    window.addEventListener("popstate", function () {
        homePage.hidden = false;
        detailsPage.hidden = true;
    });
    
    
        

