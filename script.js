const api_key = 'api_key=cddfc280e4aa3c34900434945df6c5f6';
const base_url = 'https://api.themoviedb.org/3';
const imgPath = 'https://image.tmdb.org/t/p/original';
// const api_url = base_url + '/discover/movie?sort_by=popularity.desc&'+ api_key;
const apiPath = {
    fetchAllCategories: base_url + '/genre/movie/list?' + api_key,
    fetchMovieList: (id) => base_url + '/discover/movie?' + api_key + `&with_genres=${id}`,
    fetchTrending: base_url + '/trending/movie/day?' + api_key + `&language=en-US`,
    searchOnYoutube: (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyCpKKhk4YHQzhGEeaHpTqQ1-lFxB_cRUNw`
}

function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSections();
}

function fetchTrendingMovies() {
    fetchAndBuildMovieSection(apiPath.fetchTrending, 'Trending Now')
        .then(list => {
            const randomIndex = parseInt(Math.random() * list.length);
            buildBannerSection(list[randomIndex]);
        }).catch(err => console.error(err));
}

function buildBannerSection(movie) {
    const bannerContainer = document.getElementById('banner-section');
    bannerContainer.style.backgroundImage = `url('${imgPath}${movie.backdrop_path}')`;
    const div = document.createElement('div');
    div.innerHTML = `
    <h2 class="banner_title">${movie.title}</h2>
    <p class="banner_info">Trending in Movies | Released Date - ${movie.release_date}</p>
    <p class="banner_overview">${movie.overview && movie.overview.length > 200 ? movie.overview.slice(0, 200).trim() + '.' : movie.overview}</p>
    <div class="action-buttons">
        <button class="action-btn btn1" onclick="playTrailer()"><i class="fa-solid fa-play" style="margin-right: 7px;"></i>Play</button>
        <button class="action-btn btn2"><i class="fa-solid fa-circle-info"
                style="margin-right: 7px;"></i><a href="https://about.netflix.com/en" id="a">Info</a></button>
    </div>
    `;
    div.className = "banner-content container";
    bannerContainer.append(div);
}

function fetchAndBuildAllSections() {
    fetch(apiPath.fetchAllCategories)
        .then(res => res.json())
        .then(data => {
            const categories = data.genres;

            if (Array.isArray(categories) && categories.length > 0) {
                categories.forEach(category => {
                    fetchAndBuildMovieSection(apiPath.fetchMovieList(category.id), category.name);
                });
            }
        })
        .catch(err => console.error(err))
}

function fetchAndBuildMovieSection(fetchUrl, categoryName) {
    console.log(fetchUrl, categoryName);
    return fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
            const movies = data.results;
            if (Array.isArray(movies) && movies.length > 0) {
                buildMoviesSection(movies, categoryName);
            }
            return movies;
        })
        .catch(err => console.error(err))
}

function buildMoviesSection(list, categoryName) {
    const movie_container = document.getElementById('movie-container');
    const movieListHtml = list.map(item => {
        return `
        <div class="movie-item" onmouseenter="searchMovieTrailer('${item.title}', 'yt${item.id}')">
          <img src="${imgPath}${item.backdrop_path}" alt="${item.title}" class="movie-item-img">
          <iframe width="250px" height="150px" src="" id="yt${item.id}"></iframe>
        </div>
        `;
    }).join('');


    const movieSectionHtml = `
    <h2 class="movie-section-heading">${categoryName}<span class="explore-head">Explore All<i class="fa-solid fa-angle-right" style="#54b9c5" id="arr"></i></span></h2>
    <div class="movies-row">
        ${movieListHtml}
    </div>`;

    const div = document.createElement('div');
    div.className = "movie-section";
    div.innerHTML = movieSectionHtml;
    // append html to movies container
    movie_container.append(div);
}


function searchMovieTrailer(movieName, iframeId) {
    if (!movieName) return;

    fetch(apiPath.searchOnYoutube(movieName))
        .then(res => res.json())
        .then(res => {
            const bestResult = res.items[0];
            const youtubeUrl = `https://www.youtube.com/watch?v=${bestResult.id.videoId}`;
            window.open(youtubeUrl, '_blank');
            console.log(youtubeUrl);
            const elements = document.getElementById(iframeId);
            elements.src = `https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&controls=0`;
        })
        .catch(err => console.log(err));
}

function playTrailer(movieName) {
    let btn1 = document.querySelector("btn1");
    searchMovieTrailer(movieName);
}


window.addEventListener('load', function () {
    init();
    window.addEventListener('scroll', function () {
        const header = document.getElementById('header');
        if (window.scrollY > 5) header.classList.add('bg-dark')
        else header.classList.remove('bg-dark');
    })
})
