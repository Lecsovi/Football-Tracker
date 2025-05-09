'use client';

export default function Standings({ groups }) {
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
                {(group.standings || []).sort((a, b) => (
                  b.points - a.points ||
                  b.gd - a.gd ||
                  b.gf - a.gf
                )).map(team => (
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