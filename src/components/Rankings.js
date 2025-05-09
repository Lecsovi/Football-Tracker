'use client';

export default function Rankings({ groups }) {
  if (!groups || groups.length === 0) return <p>No groups available.</p>;

  const teamNames = JSON.parse(localStorage.getItem('tournament-team-names') || '{}');

  const groupRankings = groups.map(group => {
    const sorted = [...(group.standings || [])].sort(compareTeams);
    return {
      group: group.name,
      first: sorted[0],
      second: sorted[1],
      third: sorted[2],
      fourth: sorted[3]
    };
  });

  const groupCount = groupRankings.length;

  const firsts = groupRankings.map(g => g.first).filter(Boolean);
  const seconds = groupRankings.map(g => g.second).filter(Boolean);
  const thirds = groupRankings.map(g => g.third).filter(Boolean);
  const fourths = groupRankings.map(g => g.fourth).filter(Boolean);

  const seeded = [...firsts];
  const nonSeeded = [];

  if (groupCount >= 12) {
    nonSeeded.push(...seconds, ...thirds.sort(compareTeams).slice(0, 8));
  } else if (groupCount === 11) {
    nonSeeded.push(...seconds, ...thirds.sort(compareTeams).slice(0, 10));
  } else if (groupCount === 10) {
    nonSeeded.push(...seconds, ...thirds, ...fourths.sort(compareTeams).slice(0, 2));
  } else if (groupCount === 9) {
    nonSeeded.push(...seconds, ...thirds, ...fourths.sort(compareTeams).slice(0, 5));
  } else if (groupCount === 8) {
    nonSeeded.push(...seconds);
  } else if (groupCount === 7) {
    nonSeeded.push(...seconds, ...thirds.sort(compareTeams).slice(0, 2));
  } else if (groupCount === 6) {
    nonSeeded.push(...seconds, ...thirds.sort(compareTeams).slice(0, 4));
  } else if (groupCount === 5) {
    nonSeeded.push(...seconds, ...thirds, ...fourths.sort(compareTeams).slice(0, 1));
  } else if (groupCount === 4) {
    nonSeeded.push(...seconds);
  }

  return (
    <div className="space-y-6">
      <RankingBlock title="1st Placed Teams" teams={firsts} teamNames={teamNames} />
      <RankingBlock title="2nd Placed Teams" teams={seconds} teamNames={teamNames} />
      {thirds.length > 0 && <RankingBlock title="3rd Placed Teams" teams={thirds} teamNames={teamNames} />}
      {fourths.length > 0 && <RankingBlock title="4th Placed Teams" teams={fourths} teamNames={teamNames} />}

      <div>
        <h2 className="text-xl font-bold mb-2">Knockout Stage Seeding</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Seeded</h3>
            <ul className="list-disc list-inside">
              {seeded.map(team => (
                <li key={team.id}>{teamNames[team.id] || team.team}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Non-Seeded</h3>
            <ul className="list-disc list-inside">
              {nonSeeded.map(team => (
                <li key={team.id}>{teamNames[team.id] || team.team}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankingBlock({ title, teams, teamNames }) {
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
          {teams.sort(compareTeams).map(team => (
            <tr key={team.id}>
              <td className="p-1">{teamNames[team.id] || team.team}</td>
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
  return b.points - a.points || b.gd - a.gd || b.gf - a.gf;
}