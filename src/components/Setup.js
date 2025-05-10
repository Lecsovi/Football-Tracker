'use client';

import { useEffect, useState } from 'react';
import { saveTournamentData, loadTournamentData } from '../lib/firestore'; // ✅ Firestore functions

const SETUP_KEY = 'tournament-setup';
const TEAM_NAMES_KEY = 'tournament-team-names';

export default function Setup({ onInitialize }) {
  const [groupCount, setGroupCount] = useState(4);
  const [groupSizes, setGroupSizes] = useState({});
  const [teamNames, setTeamNames] = useState({});
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SETUP_KEY);
      const savedNames = localStorage.getItem(TEAM_NAMES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setGroupCount(parsed.length);
        const sizes = {};
        parsed.forEach(g => {
          sizes[g.letter] = g.size;
        });
        setGroupSizes(sizes);
      }

      if (savedNames) {
        setTeamNames(JSON.parse(savedNames));
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          loadTournamentData(parsedUser.username).then((data) => {
            if (data?.teamNames) {
              setTeamNames(data.teamNames);
              localStorage.setItem(TEAM_NAMES_KEY, JSON.stringify(data.teamNames));
            }
          });
        }
      }
    }
  }, []);

  if (!hasMounted) return null;

  const handleSizeChange = (letter, size) => {
    const parsed = parseInt(size);
    setGroupSizes(prev => ({
      ...prev,
      [letter]: isNaN(parsed) ? '' : Math.max(3, Math.min(parsed, 6))
    }));
  };

const handleTeamNameChange = (id, name) => {
  const trimmed = name.trim();
  setTeamNames(prev => {
    const updated = { ...prev, [id]: trimmed };
    localStorage.setItem(TEAM_NAMES_KEY, JSON.stringify(updated));

    // Save to Firestore as well
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const { username } = JSON.parse(storedUser);
      saveTournamentData(username, { teamNames: updated });
    }

    return updated;
  });
};

  const handleStart = () => {
    const groupsConfig = Array.from({ length: groupCount }, (_, i) => {
      const letter = String.fromCharCode(65 + i);
      const size = groupSizes[letter] ?? 4;
      const teams = Array.from({ length: size }, (_, idx) => {
        const id = `${letter}${idx + 1}`;
        return teamNames[id] || `Team ${id}`;
      });
      return { letter, size, teams };
    });

    localStorage.setItem(SETUP_KEY, JSON.stringify(groupsConfig));
    onInitialize(groupsConfig);
  };

  return (
    <div className="space-y-8 bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-md">
      <div>
        <label className="block text-lg font-medium mb-2 text-slate-700">
          Number of Groups:
        </label>
        <input
          type="number"
          min="1"
          max="12"
          value={String(groupCount)}
          onChange={e => {
            const parsed = parseInt(e.target.value);
            setGroupCount(isNaN(parsed) ? 0 : parsed);
          }}
          className="border w-24 p-3 text-lg rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: groupCount }, (_, i) => {
          const letter = String.fromCharCode(65 + i);
          const size = groupSizes[letter] ?? 4;

          return (
            <div
              key={letter}
              className="min-w-[220px] max-w-[300px] border rounded-xl p-4 bg-white/60 backdrop-blur shadow space-y-3"
            >
              <label className="block text-lg font-bold text-slate-800 mb-1">
                Group {letter}
              </label>

              <input
                type="number"
                min="3"
                max="6"
                value={String(size)}
                onChange={e => handleSizeChange(letter, e.target.value)}
                className="border w-20 p-2 rounded mb-2 block shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm text-slate-500">Number of teams</span>

              <div className="flex flex-col items-start gap-2">
                {Array.from({ length: size }, (_, j) => {
                  const id = `${letter}${j + 1}`;
                  return (
                    <input
                      key={id}
                      type="text"
                      placeholder={`Team ${id}`}
                      value={teamNames[id] ?? ''}
                      onChange={(e) => handleTeamNameChange(id, e.target.value)}
                      className="border h-12 w-48 p-2 rounded text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 text-center">
        <button
          onClick={handleStart}
          className="bg-blue-600 text-white px-6 py-3 text-lg rounded hover:bg-blue-700 transition shadow"
        >
          Initialize Tournament
        </button>
      </div>
    </div>
  );
}