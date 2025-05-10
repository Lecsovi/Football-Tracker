'use client';

import { useEffect, useState } from 'react';
import useClientReady from '../hooks/useClientReady';
import { loadTournamentData, saveTournamentData } from '../lib/firestore'; // 🔥 Added Firestore sync

const MATCHES_KEY = 'tournament-matches';

export default function GroupStage({ groups, onUpdate, user }) {
  const isClientReady = useClientReady();
  const [matches, setMatches] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);

  const isAdmin = user?.role === 'admin';
  const canEdit = user?.role === 'admin' || user?.role === 'groupEditor';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fixtureTemplates = {
    4: [['A1','A2'], ['A3','A4'], ['A1','A3'], ['A2','A4'], ['A1','A4'], ['A2','A3']],
    5: [['A1','A2'], ['A3','A4'], ['A1','A5'], ['A2','A4'], ['A3','A5'], ['A1','A4'], ['A2','A3'], ['A4','A5'], ['A1','A3'], ['A2','A5']],
    6: [['A1','A2'], ['A3','A4'], ['A5','A6'], ['A1','A4'], ['A2','A6'], ['A3','A5'], ['A1','A6'], ['A4','A5'], ['A2','A3'], ['A1','A5'], ['A6','A3'], ['A4','A2'], ['A1','A3'], ['A5','A2'], ['A6','A4']]
  };

  useEffect(() => {
    if (!isClientReady || initialized || !groups.length) return;

    const fetchOrGenerateMatches = async () => {
      const storedUser = localStorage.getItem('user');
      const saved = localStorage.getItem(MATCHES_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        setMatches(parsed);
        setInitialized(true);
        return;
      }

      let firebaseData = null;
      if (storedUser) {
        const { username } = JSON.parse(storedUser);
        firebaseData = await loadTournamentData(username);
      }

      if (firebaseData?.matches?.length) {
        setMatches(firebaseData.matches);
        setInitialized(true);
        return;
      }

      // Generate new matches
      const generated = [];
      groups.forEach(group => {
        const size = group.teams.length;
        const template = fixtureTemplates[size];
        const groupLetter = group.name;
        if (!template) return;

        const teamMap = {};
        group.teams.forEach((team, i) => {
          teamMap[`${groupLetter}${i + 1}`] = team;
        });

        template.forEach(([home, away], idx) => {
          const homeId = home.replace('A', groupLetter);
          const awayId = away.replace('A', groupLetter);
          const teamA = teamMap[homeId];
          const teamB = teamMap[awayId];
          if (teamA && teamB) {
            generated.push({
              id: `${groupLetter}-${idx}`,
              group: groupLetter,
              teamA,
              teamB,
              goalsA: '',
              goalsB: ''
            });
          }
        });
      });

      setMatches(generated);
      setInitialized(true);
      localStorage.setItem(MATCHES_KEY, JSON.stringify(generated));

      if (storedUser) {
        const { username } = JSON.parse(storedUser);
        const tournament = firebaseData?.tournament || {};
        const teamNames = firebaseData?.teamNames || {};
        saveTournamentData(username, {
          tournament,
          matches: generated,
          teamNames
        });
      }
    };

    fetchOrGenerateMatches();
  }, [isClientReady, initialized, groups]);

  const updateMatches = (updated) => {
    setMatches(updated);
    localStorage.setItem(MATCHES_KEY, JSON.stringify(updated));
    if (onUpdate) onUpdate(updated);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const { username } = JSON.parse(storedUser);
      loadTournamentData(username).then(data => {
        saveTournamentData(username, {
          tournament: data?.tournament || {},
          matches: updated,
          teamNames: data?.teamNames || {}
        });
      });
    }
  };

  const handleInput = (id, field, value) => {
    if (!canEdit) return;
    const sanitized = value === '' ? '' : Math.max(0, parseInt(value));
    const updated = matches.map(m => (m.id === id ? { ...m, [field]: sanitized } : m));
    updateMatches(updated);
  };

  const randomizeResults = () => {
    if (!isAdmin) return;
    const randomized = matches.map(m => ({
      ...m,
      goalsA: String(Math.floor(Math.random() * 7)),
      goalsB: String(Math.floor(Math.random() * 7))
    }));
    updateMatches(randomized);
  };

  const resetResults = () => {
    if (!isAdmin) return;
    const cleared = matches.map(m => ({ ...m, goalsA: '', goalsB: '' }));
    updateMatches(cleared);
  };

  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  if (!isClientReady || !groups.length || !initialized) return null;

  const groupedChunks = chunkArray(groups, 4);

  return (
    <div className="space-y-10 relative">
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        {isAdmin && (
          <>
            <button onClick={randomizeResults} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow">
              Randomize All Results
            </button>
            <button onClick={resetResults} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition shadow">
              Reset All Results
            </button>
          </>
        )}
        {groups.map(group => (
          <a
            key={group.name}
            href={`#group-${group.name}`}
            className="text-lg font-semibold bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Group {group.name}
          </a>
        ))}
      </div>

      {groupedChunks.map((chunk, rowIdx) => (
        <div key={rowIdx} className="flex flex-wrap gap-6">
          {chunk.map(group => (
            <div id={`group-${group.name}`} key={group.name} className="bg-white p-4 rounded shadow space-y-3 w-full sm:w-[48%] lg:w-[23%] scroll-mt-16">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Group {group.name}
              </h2>
              {matches
                .filter(m => m.group === group.name)
                .map(match => (
                  <div key={match.id} className="flex items-center gap-2">
                    <span className="w-24 text-sm truncate">{match.teamA.name}</span>
                    <input
                      type="number"
                      min="0"
                      disabled={!canEdit}
                      className="w-12 p-1 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                      value={String(match.goalsA ?? '')}
                      onChange={(e) => handleInput(match.id, 'goalsA', e.target.value)}
                    />
                    <span>–</span>
                    <input
                      type="number"
                      min="0"
                      disabled={!canEdit}
                      className="w-12 p-1 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                      value={String(match.goalsB ?? '')}
                      onChange={(e) => handleInput(match.id, 'goalsB', e.target.value)}
                    />
                    <span className="w-24 text-sm truncate">{match.teamB.name}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      ))}

      {showTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#4f46e5',
            color: 'white',
            padding: '12px 20px',
            fontSize: '18px',
            borderRadius: '9999px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            zIndex: 1000
          }}
        >
          ↑ Top
        </button>
      )}
    </div>
  );
}