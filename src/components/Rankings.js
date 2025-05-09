'use client';

export default function Rankings({ groups, matches }) {
  if (!groups || groups.length === 0) return <p>No groups available.</p>;

  const sortedGroups = groups.map(group => {
    const matchSubset = matches?.filter(m => m.group === group.name) || [];
    return {
      ...group,
      standings: sortGroupStandings(group.standings || [], matchSubset)
    };
  });

  const groupRankings = sortedGroups.map(group => {
    return {
      group: group.name,
      first: group.standings?.[0],
      second: group.standings?.[1],
      third: group.standings?.[2],
      fourth: group.standings?.[3],
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
      <RankingBlock title="1st Placed Teams" teams={firsts} />
      <RankingBlock title="2nd Placed Teams" teams={seconds} />
      {thirds.length > 0 && <RankingBlock title="3rd Placed Teams" teams={thirds} />}
      {fourths.length > 0 && <RankingBlock title="4th Placed Teams" teams={fourths} />}

      <div>
        <h2 className="text-xl font-bold mb-2">Knockout Stage Seeding</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Seeded</h3>
            <ul className="list-disc list-inside">
              {seeded.map(team => (
                <li key={team.id}>{team.team}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Non-Seeded</h3>
            <ul className="list-disc list-inside">
              {nonSeeded.map(team => (
                <li key={team.id}>{team.team}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
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

function sortGroupStandings(teams, matches) {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const tied = teams.filter(t => t.points === a.points);
    const tiedIds = tied.map(t => t.id);

    if (tiedIds.length > 1) {
      const miniTable = tied.map(t => ({ id: t.id, points: 0 }));

      matches.forEach(match => {
        if (!tiedIds.includes(match.teamA.id) || !tiedIds.includes(match.teamB.id)) return;
        const aEntry = miniTable.find(t => t.id === match.teamA.id);
        const bEntry = miniTable.find(t => t.id === match.teamB.id);
        const gA = parseInt(match.goalsA);
        const gB = parseInt(match.goalsB);
        if (isNaN(gA) || isNaN(gB)) return;

        if (gA > gB) aEntry.points += 3;
        else if (gA < gB) bEntry.points += 3;
        else {
          aEntry.points += 1;
          bEntry.points += 1;
        }
      });

      const aPoints = miniTable.find(t => t.id === a.id)?.points || 0;
      const bPoints = miniTable.find(t => t.id === b.id)?.points || 0;
      if (bPoints !== aPoints) return bPoints - aPoints;
    }

    return b.gd - a.gd || b.gf - a.gf;

    function compareTeams(a, b) {
  return b.points - a.points || b.gd - a.gd || b.gf - a.gf;
}
  });
}