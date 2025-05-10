'use client';

import { useEffect, useState } from 'react';
import { loadTournamentData } from '@/lib/firestore';

export default function StandingsDisplay() {
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teamNames, setTeamNames] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const username = 'Lecsovi'; // Replace with actual username/document ID
      const data = await loadTournamentData(username);
      if (data) {
        setGroups(data.tournament.groups || []);
        setMatches(data.matches || []);
      }

      const storedNames = localStorage.getItem('tournament-team-names');
      if (storedNames) {
        setTeamNames(JSON.parse(storedNames));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const sortGroupStandingsWithTiebreakers = (group, allMatches) => {
    const standings = [...(group.standings || [])].map(team => ({
      ...team,
      team: teamNames[team.id] || team.team,
    }));

    const groupMatches = allMatches?.filter(
      m => m.group === group.name && m.goalsA !== '' && m.goalsB !== ''
    ) || [];

    standings.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

    let i = 0;
    while (i < standings.length) {
      let j = i + 1;
      while (j < standings.length && standings[j].points === standings[i].points) j++;

      if (j - i > 1) {
        const tied = standings.slice(i, j);
        const ids = new Set(tied.map(t => t.id));
        const h2hMatches = groupMatches.filter(
          m => ids.has(m.teamA.id) && ids.has(m.teamB.id)
        );

        const h2hStats = {};
        tied.forEach(t => {
          h2hStats[t.id] = { id: t.id, team: t.team, points: 0 };
        });

        h2hMatches.forEach(m => {
          const gA = parseInt(m.goalsA);
          const gB = parseInt(m.goalsB);
          if (gA > gB) h2hStats[m.teamA.id].points += 3;
          else if (gA < gB) h2hStats[m.teamB.id].points += 3;
          else {
            h2hStats[m.teamA.id].points += 1;
            h2hStats[m.teamB.id].points += 1;
          }
        });

        const ranked = [...tied].sort((a, b) =>
          h2hStats[b.id].points - h2hStats[a.id].points ||
          b.gd - a.gd ||
          b.gf - a.gf
        );

        standings.splice(i, j - i, ...ranked);
      }

      i = j;
    }

    return standings;
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
        <div key={rowIndex} className="flex flex-col lg:flex-row gap-6 w-full mb-6">
          {chunk.map(group => (
            <div
              key={group.name}
              className="flex-1 bg-white p-4 rounded border border-gray-300 shadow-sm overflow-x-auto"
            >
              <h2 className="text-xl font-bold text-center mb-3">Group {group.name}</h2>
              <table className="min-w-full border-collapse text-sm table-fixed">
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
                  {sortGroupStandingsWithTiebreakers(group, matches).map(team => (
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
                      <td className="font-semibold text-blue-700">{team.points}</td>
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