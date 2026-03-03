import fetch from 'node-fetch';

const BASE_URL = 'https://api.themoviedb.org/3';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function fetchMovies(apiKey) {
  const [page1, page2] = await Promise.all([
    fetch(`${BASE_URL}/movie/popular?api_key=${apiKey}&page=1`).then(r => r.json()),
    fetch(`${BASE_URL}/movie/popular?api_key=${apiKey}&page=2`).then(r => r.json()),
  ]);

  const combined = [...(page1.results || []), ...(page2.results || [])];

  const movies = combined
    .filter(m => m.poster_path && m.title && m.overview)
    .map(m => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      year: m.release_date ? m.release_date.slice(0, 4) : '?',
      rating: Math.round(m.vote_average * 10) / 10,
    }));

  return shuffle(movies).slice(0, 20);
}
