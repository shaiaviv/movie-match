import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket.js';

const GENRES = [
  { id: null,  label: 'All',        emoji: '🎬' },
  { id: 28,    label: 'Action',     emoji: '💥' },
  { id: 35,    label: 'Comedy',     emoji: '😂' },
  { id: 27,    label: 'Horror',     emoji: '👻' },
  { id: 10749, label: 'Romance',    emoji: '❤️' },
  { id: 878,   label: 'Sci-Fi',     emoji: '🚀' },
  { id: 18,    label: 'Drama',      emoji: '🎭' },
  { id: 16,    label: 'Animation',  emoji: '✨' },
  { id: 53,    label: 'Thriller',   emoji: '😰' },
  { id: 12,    label: 'Adventure',  emoji: '🗺️' },
  { id: 14,    label: 'Fantasy',    emoji: '🧙' },
  { id: 80,    label: 'Crime',      emoji: '🔪' },
  { id: 99,    label: 'Documentary',emoji: '🎥' },
];


const RUNTIMES = [
  { label: 'Any',    min: null, max: null  },
  { label: '< 90m', min: null, max: 89    },
  { label: '90–130m',min: 90,  max: 130   },
  { label: '130m +', min: 131, max: null  },
];

const AGE_RATINGS = ['Any', 'G', 'PG', 'PG-13', 'R'];

const LANGUAGES = [
  { label: 'Any', code: null },
  { label: 'EN',  code: 'en' },
  { label: 'ES',  code: 'es' },
  { label: 'FR',  code: 'fr' },
  { label: 'KO',  code: 'ko' },
  { label: 'JA',  code: 'ja' },
];

const YEAR_MIN = 1900;
const YEAR_MAX = new Date().getFullYear();

function YearRangeSlider({ yearFrom, yearTo, setYearFrom, setYearTo }) {
  const from = yearFrom ? parseInt(yearFrom) : YEAR_MIN;
  const to   = yearTo   ? parseInt(yearTo)   : YEAR_MAX;

  const fromPct = ((from - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
  const toPct   = ((to   - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;

  const isAll = from === YEAR_MIN && to === YEAR_MAX;
  const rangeLabel = isAll
    ? 'All eras'
    : `${from === YEAR_MIN ? 'Before' : from} – ${to === YEAR_MAX ? 'Now' : to}`;

  const TICKS = [1920, 1940, 1960, 1980, 2000, 2020];

  return (
    <div className="mb-5">
      {/* Header row */}
      <div className="flex justify-between items-center mb-3">
        <p className="font-sans text-cream-400 text-[10px] tracking-[0.35em] uppercase">Release year</p>
        <span
          className="font-mono text-xs font-semibold transition-all duration-200"
          style={{ color: isAll ? 'rgba(232,192,90,0.45)' : '#e8c05a' }}
        >
          {rangeLabel}
        </span>
      </div>

      {/* Slider area */}
      <div className="relative" style={{ height: 36 }}>
        {/* Base track */}
        <div
          className="absolute left-0 right-0 rounded-full"
          style={{ top: '50%', transform: 'translateY(-50%)', height: 2, background: 'rgba(255,255,255,0.06)' }}
        />
        {/* Tick marks at decades */}
        {TICKS.map(y => {
          const pct = ((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
          const inRange = y >= from && y <= to;
          return (
            <div
              key={y}
              className="absolute rounded-full transition-colors duration-300"
              style={{
                left: `${pct}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 2,
                height: inRange ? 8 : 5,
                background: inRange ? 'rgba(232,192,90,0.5)' : 'rgba(255,255,255,0.12)',
              }}
            />
          );
        })}
        {/* Gold fill between handles */}
        <div
          className="absolute rounded-full"
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
            height: 2,
            left: `${fromPct}%`,
            right: `${100 - toPct}%`,
            background: 'linear-gradient(90deg, #b88e28, #f2d875)',
            boxShadow: '0 0 6px rgba(232,192,90,0.35)',
            transition: 'left 0.02s, right 0.02s',
          }}
        />
        {/* From handle */}
        <input
          type="range"
          min={YEAR_MIN} max={YEAR_MAX} step="1"
          value={from}
          onChange={e => {
            const v = parseInt(e.target.value);
            if (v < to) setYearFrom(v === YEAR_MIN ? '' : String(v));
          }}
          className="year-range-input"
          style={{ zIndex: from > YEAR_MAX - 15 ? 5 : 3 }}
        />
        {/* To handle */}
        <input
          type="range"
          min={YEAR_MIN} max={YEAR_MAX} step="1"
          value={to}
          onChange={e => {
            const v = parseInt(e.target.value);
            if (v > from) setYearTo(v === YEAR_MAX ? '' : String(v));
          }}
          className="year-range-input"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* End labels */}
      <div className="flex justify-between mt-1">
        <span className="font-sans text-[9px] text-cream-600/35">{YEAR_MIN}</span>
        <span className="font-sans text-[9px] text-cream-600/35">{YEAR_MAX}</span>
      </div>
    </div>
  );
}

function Pills({ options, selected, onSelect, getKey, getLabel }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const key   = getKey   ? getKey(opt)   : opt;
        const label = getLabel ? getLabel(opt) : opt;
        return (
          <button
            key={key}
            onClick={() => onSelect(opt)}
            className={`px-3 py-1.5 rounded text-xs font-sans font-medium tracking-wide border transition-all duration-150 ${
              selected === opt
                ? 'border-gold-400/50 bg-gold-400/10 text-gold-300'
                : 'border-cream-200/8 bg-noir-800 text-cream-500 hover:border-cream-200/20 hover:text-cream-300'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div className="mb-4">
      <p className="font-sans text-cream-400 text-[10px] tracking-[0.35em] uppercase mb-2">{label}</p>
      {children}
    </div>
  );
}

function CinemaParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);

    const particles = Array.from({ length: 110 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.5 + Math.random() * 1.8,
      vy: -(0.1 + Math.random() * 0.26), vx: (Math.random() - 0.5) * 0.07,
      baseOp: 0.07 + Math.random() * 0.36,
      phase: Math.random() * Math.PI * 2, phaseSpeed: 0.007 + Math.random() * 0.011,
      warm: Math.random() > 0.22,
    }));

    const bokeh = Array.from({ length: 6 }, (_, i) => ({
      x: (i / 5) * W + (Math.random() - 0.5) * 120, y: Math.random() * H,
      r: 22 + Math.random() * 55, vy: -(0.03 + Math.random() * 0.07), vx: (Math.random() - 0.5) * 0.03,
      op: 0.022 + Math.random() * 0.042, col: i % 2 === 0 ? [232, 192, 90] : [115, 65, 175],
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      bokeh.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.y < -b.r * 2) { b.y = H + b.r; b.x = Math.random() * W; }
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${b.op})`);
        g.addColorStop(1, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      });
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.phase += p.phaseSpeed;
        if (p.y < -4)    { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4)    p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        const op = p.baseOp * (0.35 + 0.65 * Math.abs(Math.sin(p.phase)));
        ctx.fillStyle = p.warm ? `rgba(232,196,102,${op})` : `rgba(240,218,175,${op})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 2, willChange: 'transform' }} />;
}

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [selectedGenre,   setSelectedGenre]   = useState(GENRES[0]);
  const [yearFrom,        setYearFrom]        = useState('');
  const [yearTo,          setYearTo]          = useState('');
  const [selectedRuntime, setSelectedRuntime] = useState(RUNTIMES[0]);
  const [ageRating,       setAgeRating]       = useState('Any');
  const [language,        setLanguage]        = useState(LANGUAGES[0]);
  const [minRating,       setMinRating]       = useState(0);

  useEffect(() => {
    socket.connect();

    socket.on('room-created', ({ roomId, movies }) => {
      sessionStorage.setItem('movies', JSON.stringify(movies));
      sessionStorage.setItem('roomId', roomId);
      navigate(`/room/${roomId}`);
    });

    socket.on('room-joined', ({ roomId, movies }) => {
      sessionStorage.setItem('movies', JSON.stringify(movies));
      sessionStorage.setItem('roomId', roomId);
      navigate(`/room/${roomId}`);
    });

    socket.on('error', (msg) => {
      setError(msg);
      setLoading(false);
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('error');
    };
  }, [navigate]);

  function handleCreate() {
    setError('');
    setLoading(true);
    socket.emit('create-room', {
      genreId:       selectedGenre.id,
      yearFrom:      yearFrom ? parseInt(yearFrom) : undefined,
      yearTo:        yearTo   ? parseInt(yearTo)   : undefined,
      minRating:     minRating            || undefined,
      runtimeMin:    selectedRuntime.min  || undefined,
      runtimeMax:    selectedRuntime.max  || undefined,
      language:      language.code        || undefined,
      certification: ageRating !== 'Any'  ? ageRating : undefined,
    });
  }

  function handleJoin(e) {
    e.preventDefault();
    let joinCode = code.trim();
    // Accept a full room URL — extract the code from the path
    try {
      const url = new URL(joinCode);
      const parts = url.pathname.split('/').filter(Boolean);
      joinCode = parts[parts.length - 1];
    } catch {}
    joinCode = joinCode.toUpperCase();
    if (!joinCode) return;
    setError('');
    setLoading(true);
    socket.emit('join-room', joinCode);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 relative overflow-y-auto">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 35%, #1c1030 0%, #0c0a0f 65%)' }}
      />
      {/* Floating gradient orbs */}
      <div className="absolute pointer-events-none" style={{ width: 420, height: 420, top: '-8%', left: '-18%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,155,35,0.13) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'floatOrb 14s ease-in-out infinite' }} />
      <div className="absolute pointer-events-none" style={{ width: 360, height: 360, bottom: '4%', right: '-14%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(115,65,175,0.11) 0%, transparent 70%)', filter: 'blur(35px)', animation: 'floatOrb 19s ease-in-out infinite reverse' }} />
      <div className="absolute pointer-events-none" style={{ width: 220, height: 220, top: '38%', right: '8%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(175,50,50,0.08) 0%, transparent 70%)', filter: 'blur(28px)', animation: 'floatOrb 11s ease-in-out infinite', animationDelay: '-4s' }} />
      {/* Canvas particle field */}
      <CinemaParticles />
      {/* Ornamental edge lines */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,192,90,0.25), transparent)' }} />
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,192,90,0.12), transparent)' }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center py-8">

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-5 animate-fade-up" style={{ animationDelay: '0ms' }}>
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,192,90,0.5))' }} />
            <span className="font-sans text-gold-500 text-[10px] tracking-[0.4em] uppercase">Now Showing</span>
            <div className="h-px w-10" style={{ background: 'linear-gradient(270deg, transparent, rgba(232,192,90,0.5))' }} />
          </div>

          <h1 className="font-display leading-none select-none">
            <span
              className="block italic font-light text-cream-200 leading-none animate-fade-up"
              style={{ fontSize: 'clamp(3.5rem, 17vw, 4.8rem)', animationDelay: '130ms' }}
            >
              Movie
            </span>
            <span
              className="block font-semibold leading-none tracking-[0.1em] uppercase"
              style={{
                fontSize: 'clamp(3.5rem, 17vw, 4.8rem)',
                background: 'linear-gradient(105deg, #b88e28 0%, #e8c05a 30%, #f2d875 44%, #fffaec 50%, #f2d875 56%, #e8c05a 70%, #b88e28 100%)',
                backgroundSize: '250% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'fadeUp 0.55s 280ms ease both, shimmerText 4s 950ms linear infinite',
              }}
            >
              Match
            </span>
          </h1>

          <p className="mt-5 font-sans text-cream-500 text-sm tracking-[0.18em] animate-fade-up" style={{ animationDelay: '440ms' }}>
            Swipe together. Decide together.
          </p>
        </div>

        {/* ── Initial mode picker ── */}
        {!mode && (
          <div className="w-full flex flex-col gap-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 font-sans font-medium text-sm tracking-[0.2em] uppercase text-noir-950 bg-gold-400 hover:bg-gold-300 active:scale-[0.98] transition-all duration-150 rounded"
              style={{ boxShadow: '0 4px 28px rgba(232,192,90,0.22)' }}
            >
              Create a Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 font-sans font-medium text-sm tracking-[0.2em] uppercase text-cream-300 bg-transparent hover:text-cream-100 active:scale-[0.98] transition-all duration-150 rounded border border-cream-200/15 hover:border-cream-200/30"
            >
              Join a Room
            </button>
          </div>
        )}

        {/* ── Genre + filter picker (create flow) ── */}
        {mode === 'create' && (
          <div className="w-full animate-fade-up" style={{ animationDelay: '0ms' }}>

            {/* Genre */}
            <FilterSection label="Choose a genre">
              <div className="grid grid-cols-3 gap-1.5">
                {GENRES.map(g => (
                  <button
                    key={g.label}
                    onClick={() => setSelectedGenre(g)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded transition-all duration-150 border text-xs font-sans font-medium tracking-wide ${
                      selectedGenre.label === g.label
                        ? 'border-gold-400/50 bg-gold-400/10 text-gold-300'
                        : 'border-cream-200/8 bg-noir-800 text-cream-500 hover:border-cream-200/20 hover:text-cream-300'
                    }`}
                  >
                    <span className="text-lg leading-none">{g.emoji}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Year range */}
            <YearRangeSlider
              yearFrom={yearFrom} yearTo={yearTo}
              setYearFrom={setYearFrom} setYearTo={setYearTo}
            />

            {/* Runtime */}
            <FilterSection label="Runtime">
              <Pills
                options={RUNTIMES}
                selected={selectedRuntime}
                onSelect={setSelectedRuntime}
                getKey={r => r.label}
                getLabel={r => r.label}
              />
            </FilterSection>

            {/* Age rating */}
            <FilterSection label="Age rating">
              <Pills
                options={AGE_RATINGS}
                selected={ageRating}
                onSelect={setAgeRating}
              />
            </FilterSection>

            {/* Language */}
            <FilterSection label="Language">
              <Pills
                options={LANGUAGES}
                selected={language}
                onSelect={setLanguage}
                getKey={l => l.label}
                getLabel={l => l.label}
              />
            </FilterSection>

            {/* Min rating slider */}
            <div className="mb-5">
              <style>{`
                .rating-slider { -webkit-appearance: none; appearance: none; height: 3px; border-radius: 9999px; outline: none; cursor: pointer; }
                .rating-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #e8c05a; box-shadow: 0 0 8px rgba(232,192,90,0.45); cursor: pointer; }
                .rating-slider::-moz-range-thumb { width: 18px; height: 18px; border: none; border-radius: 50%; background: #e8c05a; box-shadow: 0 0 8px rgba(232,192,90,0.45); cursor: pointer; }
                .year-range-input { position: absolute; width: 100%; height: 100%; top: 0; left: 0; -webkit-appearance: none; appearance: none; background: transparent; outline: none; pointer-events: none; }
                .year-range-input::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: all; width: 20px; height: 20px; border-radius: 50%; background: radial-gradient(circle at 38% 35%, #f2d875, #b88e28); box-shadow: 0 0 0 2px rgba(232,192,90,0.18), 0 2px 10px rgba(0,0,0,0.6); cursor: grab; transition: box-shadow 0.15s; }
                .year-range-input::-webkit-slider-thumb:hover { box-shadow: 0 0 0 5px rgba(232,192,90,0.18), 0 0 14px rgba(232,192,90,0.55); }
                .year-range-input::-webkit-slider-thumb:active { cursor: grabbing; }
                .year-range-input::-moz-range-thumb { pointer-events: all; width: 20px; height: 20px; border: none; border-radius: 50%; background: radial-gradient(circle at 38% 35%, #f2d875, #b88e28); box-shadow: 0 0 0 2px rgba(232,192,90,0.18), 0 2px 10px rgba(0,0,0,0.6); cursor: grab; }
              `}</style>
              <div className="flex justify-between items-center mb-2">
                <p className="font-sans text-cream-400 text-[10px] tracking-[0.35em] uppercase">Min rating ★</p>
                <span className="font-mono text-gold-400 text-sm font-semibold">
                  {minRating === 0 ? 'Any' : `${minRating}+`}
                </span>
              </div>
              <input
                type="range"
                min="0" max="8" step="0.5"
                value={minRating}
                onChange={e => setMinRating(parseFloat(e.target.value))}
                className="rating-slider w-full"
                style={{ background: `linear-gradient(to right, #e8c05a ${minRating / 8 * 100}%, rgba(255,255,255,0.08) ${minRating / 8 * 100}%)` }}
              />
              <div className="flex justify-between mt-1">
                <span className="font-sans text-cream-600 text-[10px]">0</span>
                <span className="font-sans text-cream-600 text-[10px]">8+</span>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-4 font-sans font-medium text-sm tracking-[0.2em] uppercase text-noir-950 bg-gold-400 hover:bg-gold-300 disabled:opacity-50 active:scale-[0.98] transition-all duration-150 rounded"
              style={{ boxShadow: '0 4px 28px rgba(232,192,90,0.22)' }}
            >
              {loading ? 'Finding films…' : `Start — ${selectedGenre.label}`}
            </button>
            <button
              onClick={() => { setMode(null); setError(''); }}
              className="w-full mt-3 py-2 font-sans text-xs tracking-[0.25em] uppercase text-cream-600 hover:text-cream-400 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Join flow ── */}
        {mode === 'join' && (
          <form onSubmit={handleJoin} className="w-full animate-fade-up" style={{ animationDelay: '0ms' }}>
            <div className="text-center mb-5">
              <p className="font-sans text-cream-400 text-[11px] tracking-[0.35em] uppercase">Join a Room</p>
              <p className="font-sans text-cream-600 text-xs mt-1">Paste a room link or enter the 6-letter code</p>
            </div>

            <input
              type="text"
              value={code}
              onChange={e => {
                const val = e.target.value;
                // Don't force uppercase if it looks like a URL
                setCode(val.includes('/') ? val : val.toUpperCase());
              }}
              placeholder="XXXXXX or paste link"
              autoFocus
              className="w-full text-center text-base font-mono tracking-widest text-cream-200 bg-noir-800 border border-cream-200/12 focus:border-gold-400/50 focus:outline-none rounded py-4 px-4 placeholder:text-cream-600/40 transition-colors"
            />

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full mt-3 py-4 font-sans font-medium text-sm tracking-[0.2em] uppercase text-noir-950 bg-gold-400 hover:bg-gold-300 disabled:opacity-40 active:scale-[0.98] transition-all duration-150 rounded"
              style={{ boxShadow: '0 4px 28px rgba(232,192,90,0.22)' }}
            >
              {loading ? 'Joining…' : 'Join Room'}
            </button>
            <button
              type="button"
              onClick={() => { setMode(null); setError(''); setCode(''); }}
              className="w-full mt-3 py-2 font-sans text-xs tracking-[0.25em] uppercase text-cream-600 hover:text-cream-400 transition-colors"
            >
              ← Back
            </button>
          </form>
        )}

        {error && (
          <p className="mt-5 font-sans text-crimson-400 text-sm text-center animate-fade-up">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
