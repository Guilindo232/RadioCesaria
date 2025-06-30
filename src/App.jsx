import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Volume2, VolumeX, X, Radio, History, Music, ListMusic, Info, Sun, Moon
} from 'lucide-react';

// --- Componente da Janela Arrastável ---
const Window = ({ title, children, onClose, initialPosition, zIndex, onFocus }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.dataset.dragHandle) {
      setIsDragging(true);
      onFocus();
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, handleMouseMove]);
  
  return (
    <div
      ref={windowRef}
      className="absolute bg-neutral-200 border border-neutral-400 shadow-2xl rounded-lg flex flex-col"
      style={{ top: position.y, left: position.x, zIndex }}
      onMouseDown={onFocus}
    >
      <div
        className="bg-neutral-700 text-white p-2 flex justify-between items-center rounded-t-md cursor-move"
        onMouseDown={handleMouseDown}
        data-drag-handle
      >
        <span className="font-bold text-sm" data-drag-handle>{title}</span>
        <button onClick={onClose} className="text-white hover:bg-red-500 p-1 rounded-full">
          <X size={16} />
        </button>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

// --- Componente da Janela do Player ---
const PlayerWindowContent = ({ nowPlaying, isPlaying, isMuted, onPlayPause, onMute, theme }) => {
  const [elapsed, setElapsed] = useState(nowPlaying?.elapsed || 0);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    setElapsed(nowPlaying?.elapsed || 0);
    const timer = setInterval(() => {
      if (isPlaying) {
        setElapsed(prevElapsed => prevElapsed + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nowPlaying, isPlaying]);

  if (!nowPlaying?.song) {
    return (
      <div className="w-80 h-96 bg-black text-white flex flex-col items-center justify-center p-4 rounded-b-md">
        <Music size={48} className="text-neutral-500 animate-pulse" />
        <p className="mt-4 text-neutral-400">A aguardar música...</p>
      </div>
    );
  }

  const { song, duration } = nowPlaying;
  const progressPercentage = duration > 0 ? (elapsed / duration) * 100 : 0;

  const bgClass = theme === 'dark' ? 'bg-neutral-900 text-white' : 'bg-white text-black';

  return (
    <div className={`w-80 h-96 ${bgClass} flex flex-col items-center p-4 rounded-b-md relative overflow-hidden`}>
      {/* Fundo com blur e preto e branco */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${song.art})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(16px) grayscale(100%)',
          opacity: 0.7,
        }}
      />
      {/* Conteúdo principal */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-48 aspect-square flex items-center justify-center flex-shrink-0">
          <img
            src={song.art}
            alt={`Capa do álbum ${song.album}`}
            className="w-full h-full object-cover rounded-md shadow-lg shadow-neutral-800"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = `https://placehold.co/192x192/222/EEE?text=${encodeURIComponent(song.artist)}`;
            }}
          />
        </div>
        <div className="text-center mt-3 w-full">
          <h2 className="text-xl font-bold truncate" title={song.title}>
            <span className={theme === 'dark' ? 'text-white' : 'text-black'}>{song.title}</span>
          </h2>
          <p className={`text-md ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'} truncate`} title={song.artist}>{song.artist}</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-700'} truncate`} title={song.album}>{song.album}</p>
        </div>
        <div className="w-full mt-3">
          <div className="bg-neutral-700 rounded-full h-1.5">
            <div 
              className="bg-white h-1.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center pb-2">
          <div className="flex items-center space-x-6">
              <button onClick={onMute} className="text-neutral-400 hover:text-white transition-colors">
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <button
                onClick={onPlayPause}
                className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center hover:scale-110 transition-transform"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <div className="w-6 h-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente da Janela do Histórico ---
const HistoryWindowContent = ({ songHistory, theme }) => {
  if (!songHistory || songHistory.length === 0) {
    return (
      <div className="w-96 h-96 bg-black text-white flex items-center justify-center p-4 rounded-b-md relative overflow-hidden">
        {/* Fundo escuro com blur e preto e branco (sem imagem) */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: '#000',
            filter: 'blur(16px) grayscale(100%)',
            opacity: 0.7,
          }}
        />
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <p className="text-neutral-300">Histórico de músicas está vazio.</p>
        </div>
      </div>
    );
  }
  // Usa a capa da música mais recente como fundo
  const lastArt = songHistory[0]?.song?.art;
  return (
    <div className="w-96 h-96 bg-black text-white flex flex-col rounded-b-md relative overflow-hidden">
      {/* Fundo com blur e preto e branco */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${lastArt})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(16px) grayscale(100%)',
          opacity: 0.7,
        }}
      />
      <div className="relative z-10 flex-grow p-2 overflow-y-auto">
        <ul className="space-y-2">
          {songHistory.map((item) => (
            <li key={item.sh_id} className="flex items-center p-2 bg-neutral-100/70 rounded-md">
              <img 
                src={item.song.art} 
                alt={item.song.album} 
                className="w-12 h-12 rounded-md mr-4 object-cover"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = `https://placehold.co/64x64/EFEFEF/AAAAAA?text=Art`;
                }}
              />
              <div>
                <p className="font-bold text-sm truncate text-black">{item.song.title}</p>
                <p className="text-xs text-neutral-600 truncate">{item.song.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// --- Componente da Janela de Pedidos de Música ---
const RequestsWindowContent = ({ theme }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Busca músicas disponíveis para pedido
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://radio.bandito.site/api/station/cesaria/requests');
        const data = await res.json();
        setSongs(data || []);
      } catch {
        setError('Erro ao buscar músicas disponíveis.');
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Filtra músicas pelo termo de busca
  const filteredSongs = songs.filter(
    s =>
      s.song.title.toLowerCase().includes(search.toLowerCase()) ||
      s.song.artist.toLowerCase().includes(search.toLowerCase())
  );

  // Solicita uma música
  const handleRequest = async (requestId) => {
    setRequesting(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`https://radio.bandito.site/api/station/cesaria/request/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Pedido realizado com sucesso!');
      } else {
        setError(data.message || 'Não foi possível realizar o pedido.');
      }
    } catch {
      setError('Erro ao enviar pedido.');
    } finally {
      setRequesting(false);
    }
  };

  // Usa a capa da primeira música como fundo, se houver
  const bgArt = filteredSongs[0]?.song?.art || songs[0]?.song?.art;

  return (
    <div className="w-96 h-96 bg-black text-white flex flex-col rounded-b-md relative overflow-hidden">
      {/* Fundo com blur e preto e branco */}
      {bgArt && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${bgArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(16px) grayscale(100%)',
            opacity: 0.7,
          }}
        />
      )}
      {!bgArt && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/80 to-neutral-800/80" />
      )}
      <div className="relative z-10 flex flex-col h-full">
        <div className="p-2">
          <input
            type="text"
            placeholder="Buscar música ou artista..."
            className="w-full p-2 rounded bg-neutral-900 text-white border border-neutral-700 mb-2"
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <span className="text-neutral-400">Carregando músicas...</span>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto px-2">
            {filteredSongs.length === 0 ? (
              <div className="text-neutral-400 text-center mt-8">Nenhuma música encontrada.</div>
            ) : (
              <ul className="space-y-2">
                {filteredSongs.map((item) => (
                  <li key={item.request_id} className="flex items-center bg-neutral-100/80 rounded p-2">
                    <img
                      src={item.song.art}
                      alt={item.song.album}
                      className="w-10 h-10 rounded mr-3 object-cover"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/40x40/EFEFEF/AAAAAA?text=Art`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-black">{item.song.title}</p>
                      <p className="text-xs text-neutral-600 truncate">{item.song.artist}</p>
                    </div>
                    <button
                      className="ml-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs disabled:opacity-50"
                      onClick={() => handleRequest(item.request_id)}
                      disabled={requesting}
                    >
                      Pedir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {(success || error) && (
          <div className={`p-2 text-center text-sm ${success ? 'text-green-400' : 'text-red-400'}`}>
            {success || error}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Componente da Janela de Informações da Playlist ---
const PlaylistInfoWindowContent = ({ nowPlaying, theme }) => {
  const playlistName = nowPlaying?.playlist ?? 'Desconhecida';
  // Corrigido: acessar .song dentro de playing_next
  const nextSong = nowPlaying?.playing_next?.song;

  // Usa a capa da próxima música como fundo, se houver
  const bgArt = nextSong?.art || nowPlaying?.song?.art;

  return (
    <div className="w-96 h-72 bg-black text-white flex flex-col rounded-b-md relative overflow-hidden">
      {/* Fundo com blur e preto e branco */}
      {bgArt && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${bgArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(16px) grayscale(100%)',
            opacity: 0.7,
          }}
        />
      )}
      {!bgArt && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/80 to-neutral-800/80" />
      )}
      <div className="relative z-10 flex flex-col h-full p-4">
        <h2 className="text-lg font-bold mb-2">Playlist Info:</h2>
        <div className="mb-4">
          <span className="font-semibold">Playlist Atual:</span>
          <span className="ml-2">{playlistName}</span>
        </div>
        <div>
          <span className="font-semibold">Tocando a seguir:</span>
          {nextSong ? (
            <div className="flex items-center mt-2">
              <img
                src={nextSong.art}
                alt={nextSong.album}
                className="w-12 h-12 rounded mr-3 object-cover"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/48x48/EFEFEF/AAAAAA?text=Art`;
                }}
              />
              <div>
                <p className="font-bold text-sm truncate text-black">{nextSong.title}</p>
                <p className="text-xs text-neutral-600 truncate">{nextSong.artist}</p>
                <p className="text-xs text-neutral-500 truncate">{nextSong.album}</p>
              </div>
            </div>
          ) : (
            <span className="ml-2 text-neutral-400">Não Encontrado</span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal da Aplicação ---
function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [songHistory, setSongHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  
  const [windows, setWindows] = useState({
    player: { isOpen: true, zIndex: 10 },
    history: { isOpen: false, zIndex: 9 },
    requests: { isOpen: false, zIndex: 8 },
    playlistInfo: { isOpen: false, zIndex: 7 },
  });

  const streamUrl = 'https://radio.bandito.site/listen/cesaria/radio.mp3';
  const audioRef = useRef(null);

  // Alterna tema
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  // Aplica classe no body para Tailwind (opcional, se usar dark: no Tailwind)
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const fetchRadioData = async () => {
    try {
      const response = await fetch('https://radio.bandito.site/api/nowplaying/cesaria');
      const data = await response.json();
      setNowPlaying(data.now_playing);
      setSongHistory(data.song_history || []);
    } catch (error) {
      console.error('Erro ao buscar dados da rádio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadioData();
    const interval = setInterval(fetchRadioData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);
  
  const toggleWindow = (windowName) => {
    setWindows(prev => {
      const otherWindows = Object.keys(prev).filter(w => w !== windowName);
      const maxZIndex = Math.max(...otherWindows.map(w => prev[w].zIndex), 0);

      // Se o player está sendo fechado, também para a reprodução
      if (windowName === 'player' && prev.player.isOpen) {
        setIsPlaying(false);
      }

      return {
        ...prev,
        [windowName]: {
          ...prev[windowName],
          isOpen: !prev[windowName].isOpen,
          zIndex: maxZIndex + 1,
        }
      };
    });
  };

  const focusWindow = (windowName) => {
     setWindows(prev => {
      if (prev[windowName].zIndex === Math.max(...Object.values(prev).map(w => w.zIndex))) {
        return prev;
      }
      const maxZIndex = Math.max(...Object.values(prev).map(w => w.zIndex));
      return {
        ...prev,
        [windowName]: { ...prev[windowName], zIndex: maxZIndex + 1 },
      };
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-800 text-white font-sans">
        A carregar Rádio...
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen font-prompt overflow-hidden flex psych-background ${theme === 'dark' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-black'}`}>
      <aside className={`bg-black/30 backdrop-blur-md p-3 flex flex-col items-center space-y-4`}>
        <div
          className="relative flex flex-col items-center justify-center"
          style={{
            // Aumenta a altura e desce o container para quase encostar no primeiro ícone
            height: 'auto',
            minHeight: 0,
            flex: 1,
            overflow: 'hidden',
            marginTop: '1.5rem', // desce mais o bloco
            marginBottom: '-19.5rem',
            width: '5.5rem', // mais largo para dar mais destaque
            maxHeight: 'calc(100vh - 20rem)', // ocupa quase toda a lateral, só deixa espaço para os ícones
          }}
        >
          <div
            className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
            style={{ minHeight: 0, height: '100%' }}
          >
            {/* RADIO CESARIA - sobe */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none"
              style={{ top: 0 }}
            >
              <div className="marquee-vertical-up flex flex-col items-center">
                <span className="radio-cesaria-title font-bold [writing-mode:vertical-lr] rotate-180"
                  style={{
                    fontSize: '4.2rem',
                    letterSpacing: '0.1em',
                    color: '#fff',
                  }}
                >
                  RADIO CESARIA
                </span>
                {/* Espaço entre os textos duplicados */}
                <span style={{ height: '2.5rem', display: 'block' }}></span>
                <span className="radio-cesaria-title font-bold [writing-mode:vertical-lr] rotate-180"
                  style={{
                    fontSize: '4.2rem',
                    letterSpacing: '0.1em',
                    color: '#fff',
                  }}
                >
                  RADIO CESARIA
                </span>
              </div>
            </div>
            {/* Slogan - desce, mesma rotação */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none"
              style={{ top: 0 }}
            >
              <div className="marquee-vertical-down flex flex-col items-center">
                <span className="font-bold [writing-mode:vertical-lr] rotate-180"
                  style={{
                    fontSize: '1.7rem',
                    letterSpacing: '0.1em',
                    color: '#ffb703',
                    fontFamily: "'Prompt', sans-serif",
                    textShadow: '0 2px 8px #000a',
                  }}
                >
                  CUIDAR É O NOSSO REMÉDIO
                </span>
                {/* Espaço entre os textos duplicados */}
                <span style={{ height: '2.5rem', display: 'block' }}></span>
                <span className="font-bold [writing-mode:vertical-lr] rotate-180"
                  style={{
                    fontSize: '1.7rem',
                    letterSpacing: '0.1em',
                    color: '#ffb703',
                    fontFamily: "'Prompt', sans-serif",
                    textShadow: '0 2px 8px #000a',
                  }}
                >
                  CUIDAR É O NOSSO REMÉDIO
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-grow"></div>
        <button onClick={toggleTheme} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors mb-2" title="Alternar tema">
          {theme === 'dark' ? <Sun size={24} className="text-yellow-300" /> : <Moon size={24} className="text-neutral-800" />}
        </button>
        <button onClick={() => toggleWindow('player')} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Abrir Player">
          <Radio size={28} className="text-white" />
        </button>
        <button onClick={() => toggleWindow('history')} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Abrir Histórico">
          <History size={28} className="text-white" />
        </button>
        <button onClick={() => toggleWindow('requests')} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Pedidos de Música">
          <ListMusic size={28} className="text-white" />
        </button>
        <button onClick={() => toggleWindow('playlistInfo')} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Info Playlist">
          <Info size={28} className="text-white" />
        </button>
      </aside>
      <main className="flex-grow h-full w-full relative">
        {/* Fundo global com blur, claro, preto e branco */}
        {nowPlaying?.song?.art && (
          <div
            className="fixed inset-0 z-[-1]"
            style={{
              backgroundImage: `url(${nowPlaying.song.art})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(32px) brightness(1.2) grayscale(100%)',
              opacity: 0.5,
            }}
          />
        )}
        {/* Layer de overlay: escuro no tema dark, claro no tema light */}
        <div
          className={`fixed inset-0 z-[-1] pointer-events-none ${
            theme === 'dark'
              ? 'bg-black/70'
              : 'bg-white/60'
          }`}
        />
        {windows.player.isOpen && (
          <Window 
            title="Rádio Player" 
            onClose={() => toggleWindow('player')}
            initialPosition={{ x: 100, y: 80 }}
            zIndex={windows.player.zIndex}
            onFocus={() => focusWindow('player')}
          >
            <PlayerWindowContent
              nowPlaying={nowPlaying}
              isPlaying={isPlaying}
              isMuted={isMuted}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onMute={() => setIsMuted(!isMuted)}
              theme={theme}
            />
          </Window>
        )}
        {windows.history.isOpen && (
          <Window 
            title="Histórico de Músicas" 
            onClose={() => toggleWindow('history')}
            initialPosition={{ x: 200, y: 200 }}
            zIndex={windows.history.zIndex}
            onFocus={() => focusWindow('history')}
          >
            <HistoryWindowContent songHistory={songHistory} theme={theme} />
          </Window>
        )}
        {windows.requests.isOpen && (
          <Window
            title="Pedidos de Música"
            onClose={() => toggleWindow('requests')}
            initialPosition={{ x: 320, y: 120 }}
            zIndex={windows.requests.zIndex}
            onFocus={() => focusWindow('requests')}
          >
            <RequestsWindowContent theme={theme} />
          </Window>
        )}
        {windows.playlistInfo.isOpen && (
          <Window
            title="Info da Playlist"
            onClose={() => toggleWindow('playlistInfo')}
            initialPosition={{ x: 440, y: 160 }}
            zIndex={windows.playlistInfo.zIndex}
            onFocus={() => focusWindow('playlistInfo')}
          >
            <PlaylistInfoWindowContent nowPlaying={nowPlaying} theme={theme} />
          </Window>
        )}
      </main>
      <audio ref={audioRef} src={streamUrl} preload="auto" />
    </div>
  );
}

export default App;
