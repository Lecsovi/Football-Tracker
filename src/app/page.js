'use client';

import { useEffect, useState } from 'react';
import NavTabs from '../components/NavTabs';
import Setup from '../components/Setup';
import GroupStage from '../components/GroupStage';
import Standings from '../components/Standings';
import Rankings from '../components/Rankings';
import Login from '../components/Login';

const STORAGE_KEY = 'tournament-data';
const SETUP_KEY = 'tournament-setup';

export default function Home() {
  const [page, setPage] = useState('setup');
  const [tournament, setTournament] = useState({ groups: [] });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTournament(JSON.parse(saved));
        setPage('groups');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && tournament.groups.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament));
    }
  }, [tournament]);

  const handleInitialize = (groupsConfig) => {
    const groups = groupsConfig.map((g, i) => ({
      name: g.letter,
      teams: Array.from({ length: g.size }, (_, idx) => ({
        id: `${g.letter}${idx + 1}`,
        name: `Team ${g.letter}${idx + 1}`
      })),
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(SETUP_KEY, JSON.stringify(groupsConfig));
    }

    setTournament({ groups });
    setPage('groups');
  };

  const handleMatchesUpdate = (updatedMatches) => {
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
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <main>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Football Tournament Tracker</h1>
        <div className="text-sm flex items-center gap-4">
          <span>
            Logged in as <strong>{user.username}</strong> ({user.role})
          </span>
          <button
            onClick={handleLogout}
            className="bg-gray-300 hover:bg-gray-400 px-3 py-1 text-sm rounded"
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
        <GroupStage groups={tournament.groups} onUpdate={handleMatchesUpdate} user={user} />
      )}
      {page === 'standings' && <Standings groups={tournament.groups} />}
      {page === 'rankings' && <Rankings groups={tournament.groups} />}

      {user.role === 'admin' && (
        <button
          onClick={() => {
            localStorage.clear();
            setTournament({ groups: [] });
            setPage('setup');
          }}
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
        >
          Reset Tournament
        </button>
      )}
    </main>
  );
}

function calculateStandings(groups, matches) {
  const standingsObj = {};

  groups.forEach(group => {
    standingsObj[group.name] = {};
    group.teams.forEach(team => {
      standingsObj[group.name][team.id] = {
        team: team.name,
        id: team.id,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, points: 0
      };
    });
  });

  matches.forEach(match => {
    const { group, teamA, teamB, goalsA, goalsB } = match;
    if (goalsA === '' || goalsB === '') return;

    const a = standingsObj[group][teamA.id];
    const b = standingsObj[group][teamB.id];
    const gA = parseInt(goalsA), gB = parseInt(goalsB);

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