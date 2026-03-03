import fetch from 'node-fetch';

const BASE_URL = 'https://api.themoviedb.org/3';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomPages(count, max = 10) {
  const pages = new Set();
  while (pages.size < count) pages.add(Math.floor(Math.random() * max) + 1);
  return [...pages];
}

function formatMovies(results) {
  return results
    .filter(m => m.poster_path && m.title && m.overview)
    .map(m => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      year: m.release_date ? m.release_date.slice(0, 4) : '?',
      rating: Math.round(m.vote_average * 10) / 10,
    }));
}

export async function fetchMovies(apiKey, genreId = null) {
  const pages = randomPages(3);
  const base = genreId
    ? `${BASE_URL}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=100`
    : `${BASE_URL}/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&vote_count.gte=200`;

  const results = await Promise.all(
    pages.map(p => fetch(`${base}&page=${p}`).then(r => r.json()))
  );

  const combined = results.flatMap(r => r.results || []);
  return shuffle(formatMovies(combined)).slice(0, 20);
}
