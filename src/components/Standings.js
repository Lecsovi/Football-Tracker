'use client';

import { useEffect, useState } from 'react';
import { loadTournamentData } from '@/lib/firestore'; // 🔥 Firestore integration

export default function Standings({ groups, matches }) {
  const [teamNames, setTeamNames] = useState({});
  const [remoteTeamNames, setRemoteTeamNames] = useState({});

  useEffect(() => {
  const fetchTeamNames = async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const { username } = JSON.parse(storedUser);
      const data = await loadTournamentData(username);
      if (data?.teamNames) {
        localStorage.setItem('tournament-team-names', JSON.stringify(data.teamNames));
        setTeamNames(data.teamNames);
      }
    }
  };

  fetchTeamNames();
  window.addEventListener('storage', fetchTeamNames);
  return () => window.removeEventListener('storage', fetchTeamNames);
}, []);

  const allTeamNames = { ...remoteTeamNames, ...teamNames }; // Remote takes priority

  return (
    <div className="space-y-10">
      {groups.map(group => (
        <div key={group.name}>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Group {group.name} Standings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded shadow">
              <thead className="bg-slate-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Team</th>
                  <th className="px-3 py-2">P</th>
                  <th className="px-3 py-2">W</th>
                  <th className="px-3 py-2">D</th>
                  <th className="px-3 py-2">L</th>
                  <th className="px-3 py-2">GF</th>
                  <th className="px-3 py-2">GA</th>
                  <th className="px-3 py-2">GD</th>
                  <th className="px-3 py-2">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortGroupStandingsWithTiebreakers(group, matches, allTeamNames).map(team => (
                  <tr key={team.id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-2 font-medium text-gray-700">{team.team}</td>
                    <td className="px-3 py-2 text-center">{team.played}</td>
                    <td className="px-3 py-2 text-center">{team.won}</td>
                    <td className="px-3 py-2 text-center">{team.drawn}</td>
                    <td className="px-3 py-2 text-center">{team.lost}</td>
                    <td className="px-3 py-2 text-center">{team.gf}</td>
                    <td className="px-3 py-2 text-center">{team.ga}</td>
                    <td className="px-3 py-2 text-center">{team.gd}</td>
                    <td className="px-3 py-2 text-center font-semibold text-blue-700">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function sortGroupStandingsWithTiebreakers(group, matches, teamNames) {
  const standings = [...(group.standings || [])].map(team => ({
    ...team,
    team: teamNames[team.id] || team.team
  }));

  const groupMatches = matches?.filter(m => m.group === group.name && m.goalsA !== '' && m.goalsB !== '') || [];

  standings.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

  let i = 0;
  while (i < standings.length) {
    let j = i + 1;
    while (j < standings.length && standings[j].points === standings[i].points) j++;

    if (j - i > 1) {
      const tied = standings.slice(i, j);
      const ids = new Set(tied.map(t => t.id));
      const h2hMatches = groupMatches.filter(m => ids.has(m.teamA.id) && ids.has(m.teamB.id));

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
}