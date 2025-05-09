'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tournament-data';

export default function Rankings({ groups }) {
  const [teamNames, setTeamNames] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const names = {};
      parsed.groups.forEach(group => {
        group.teams.forEach(team => {
          names[team.id] = team.name;
        });
      });
      setTeamNames(names);
    }
  }, []);

  if (!groups || groups.length === 0) return <p>No groups available.</p>;

  const sortedByRank = (position) => {
    return groups
      .map(group => {
        const sorted = [...(group.standings || [])].sort(compareTeams);
        return sorted[position];
      })
      .filter(Boolean)
      .map(team => ({
        ...team,
        team: teamNames[team.id] || team.team
      }))
      .sort(compareTeams);
  };

  const firsts = sortedByRank(0);
  const seconds = sortedByRank(1);
  const thirds = sortedByRank(2);
  const fourths = sortedByRank(3);

  return (
    <div className="space-y-6">
      <RankingBlock title="1st Placed Teams" teams={firsts} />
      <RankingBlock title="2nd Placed Teams" teams={seconds} />
      {thirds.length > 0 && <RankingBlock title="3rd Placed Teams" teams={thirds} />}
      {fourths.length > 0 && <RankingBlock title="4th Placed Teams" teams={fourths} />}
    </div>
  );
}

function RankingBlock({ title, teams }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-200">
          <tr>
            <th className="text-left p-1">Team</th>
            <th>P</th><th>W</th><th>D</th><th>L</th>
            <th>GF</th><th>GA</th><th>GD</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td className="p-1">{team.team}</td>
              <td>{team.played}</td>
              <td>{team.won}</td>
              <td>{team.drawn}</td>
              <td>{team.lost}</td>
              <td>{team.gf}</td>
              <td>{team.ga}</td>
              <td>{team.gd}</td>
              <td className="font-bold">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function compareTeams(a, b) {
  return (
    b.points - a.points ||
    b.gd - a.gd ||
    b.gf - a.gf
  );
}