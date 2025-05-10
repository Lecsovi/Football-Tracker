'use client';

import { useEffect, useState } from 'react';
import { loadTournamentData } from '@/lib/firestore';

export default function StandingsDisplay() {
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const username = Lecsovi; // Replace with the actual admin username
      const data = await loadTournamentData(username);
      if (data) {
        setGroups(data.tournament.groups || []);
        setMatches(data.matches || []);
      }
    };

    fetchData();
  }, []);

  const sortGroupStandings = (teams, matches) => {
    return [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;

      const tiedIds = teams.filter(t => t.points === a.points).map(t => t.id);
      if (tiedIds.length > 1) {
        const miniTable = tiedIds.map(id => ({ id, points: 0 }));

        matches.forEach(match => {
          if (!tiedIds.includes(match.teamA.id) || !tiedIds.includes(match.teamB.id)) return;
          const a = miniTable.find(t => t.id === match.teamA.id);
          const b = miniTable.find(t => t.id === match.teamB.id);
          const gA = parseInt(match.goalsA);
          const gB = parseInt(match.goalsB);
          if (isNaN(gA) || isNaN(gB)) return;

          if (gA > gB) a.points += 3;
          else if (gA < gB) b.points += 3;
          else { a.points += 1; b.points += 1; }
        });

        const aHead = miniTable.find(t => t.id === a.id)?.points || 0;
        const bHead = miniTable.find(t => t.id === b.id)?.points || 0;

        if (bHead !== aHead) return bHead - aHead;
      }

      return b.gd - a.gd || b.gf - a.gf;
    });
  };

  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const groupChunks = chunkArray(groups, 4);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Live Standings Display</h1>

      {groupChunks.map((chunk, rowIndex) => (
        <div key={rowIndex} className="flex w-full">
          {chunk.map(group => (
            <div
              key={group.name}
              className="w-1/4 bg-white p-4 border-r last:border-r-0 border-gray-300 shadow-sm"
            >
              <h2 className="text-xl font-bold text-center mb-3">Group {group.name}</h2>
              <table className="w-full border-collapse text-sm table-fixed">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="w-[9rem] text-center px-2 py-2">Team</th>
                    <th className="w-[2.5rem]">P</th>
                    <th className="w-[2.5rem]">W</th>
                    <th className="w-[2.5rem]">D</th>
                    <th className="w-[2.5rem]">L</th>
                    <th className="w-[2.5rem]">GF</th>
                    <th className="w-[2.5rem]">GA</th>
                    <th className="w-[2.5rem]">GD</th>
                    <th className="w-[2.5rem]">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.standings?.map(team => (
                    <tr key={team.id} className="h-[3rem] text-center">
                      <td className="text-center align-middle px-2 font-medium truncate">
                        {team.team}
                      </td>
                      <td>{team.played}</td>
                      <td>{team.won}</td>
                      <td>{team.drawn}</td>
                      <td>{team.lost}</td>
                      <td>{team.gf}</td>
                      <td>{team.ga}</td>
                      <td>{team.gd}</td>
                      <td>{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}