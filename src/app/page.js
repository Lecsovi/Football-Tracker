'use client';

import { useEffect, useState } from 'react';
import NavTabs from '../components/NavTabs';
import Setup from '../components/Setup';
import GroupStage from '../components/GroupStage';
import Standings from '../components/Standings';
import Rankings from '../components/Rankings';
import Login from '../components/Login';

const STORAGE_KEY = 'tournament-data';
const MATCHES_KEY = 'tournament-matches';

export default function Home() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('setup');
  const [tournament, setTournament] = useState({ groups: [] });
  const [matches, setMatches] = useState([]);

  // Load tournament and matches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedMatches = localStorage.getItem(MATCHES_KEY);
    if (saved) {
      setTournament(JSON.parse(saved));
      setPage('groups');
    }
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    }
  }, []);

  // Save tournament whenever it changes
  useEffect(() => {
    if (tournament.groups.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament));
    }
  }, [tournament]);

  // Save matches whenever they change
  useEffect(() => {
    if (matches.length > 0) {
      localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    }
  }, [matches]);

  const handleInitialize = (groupsConfig) => {
    const groups = groupsConfig.map((g) => ({
      name: g.letter,
      teams: Array.from({ length: g.size }, (_, idx) => ({
        id: `${g.letter}${idx + 1}`,
        name: `Team ${g.letter}${idx + 1}`,
      })),
    }));

    setTournament({ groups });
    setMatches([]); // Clear matches on new setup
    localStorage.removeItem(MATCHES_KEY); // Clear old matches
    setPage('groups');
  };

  const handleMatchesUpdate = (updatedMatches) => {
    setMatches(updatedMatches);

    const standings = calculateStandings(tournament.groups, updatedMatches);
    const updatedGroups = tournament.groups.map(group => ({
      ...group,
      standings: Object.values(standings[group.name] || [])
    }));
    setTournament({ groups: updatedGroups });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setTournament({ groups: [] });
    setMatches([]);
    setPage('setup');
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <main>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Football Tournament Tracker</h1>
        <div className="text-right">
          <div className="text-sm">
            Logged in as <strong>{user.username}</strong> ({user.role})
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>

      <NavTabs currentPage={page} setPage={setPage} />

      {page === 'setup' && user.role === 'admin' && (
        <Setup onInitialize={handleInitialize} />
      )}
      {page === 'groups' && (
        <GroupStage
          groups={tournament.groups}
          onUpdate={handleMatchesUpdate}
          user={user}
        />
      )}
      {page === 'standings' && (
        <Standings groups={tournament.groups} matches={matches} />
      )}
      {page === 'rankings' && <Rankings groups={tournament.groups} matches={matches} />}

      {user.role === 'admin' && (
  <div className="mt-6 space-y-4">
    <button
      onClick={() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(MATCHES_KEY);
        setTournament({ groups: [] });
        setMatches([]);
        setPage('setup');
      }}
      className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
    >
      Reset Tournament
    </button>

    <button
      onClick={() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(MATCHES_KEY);
        localStorage.removeItem('user');
        localStorage.removeItem('tournament-team-names');
        window.location.reload();
      }}
      className="bg-orange-600 text-white px-4 py-2 rounded shadow hover:bg-orange-700"
    >
      Clear All Data
    </button>
  </div>
)}
    </main>
  );
}

function calculateStandings(groups, matches) {
  const standingsObj = {};
  const teamNames = JSON.parse(localStorage.getItem('tournament-team-names') || '{}');

  groups.forEach(group => {
    standingsObj[group.name] = {};

    group.teams.forEach(team => {
      const nameFromSetup = teamNames[team.id] || team.name;
      standingsObj[group.name][team.id] = {
        team: nameFromSetup,
        id: team.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0
      };
    });
  });

  matches.forEach(match => {
    const { group, teamA, teamB, goalsA, goalsB } = match;
    if (goalsA === '' || goalsB === '') return;

    const groupStandings = standingsObj[group];
    if (!groupStandings) return;

    const a = groupStandings[teamA?.id];
    const b = groupStandings[teamB?.id];
    if (!a || !b) return;

    const gA = parseInt(goalsA, 10);
    const gB = parseInt(goalsB, 10);

    a.played++; b.played++;
    a.gf += gA; a.ga += gB;
    b.gf += gB; b.ga += gA;
    a.gd = a.gf - a.ga; b.gd = b.gf - b.ga;

    if (gA > gB) { a.won++; b.lost++; a.points += 3; }
    else if (gA < gB) { b.won++; a.lost++; b.points += 3; }
    else { a.drawn++; b.drawn++; a.points++; b.points++; }
  });

  return standingsObj;
}