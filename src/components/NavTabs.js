'use client';

export default function NavTabs({ currentPage, setPage }) {
  const tabs = [
    { id: 'setup', label: 'Setup' },
    { id: 'groups', label: 'Group Stage' },
    { id: 'standings', label: 'Standings' },
    { id: 'rankings', label: 'Team Rankings' }
  ];

  return (
    <div className="flex space-x-4 border-b border-gray-200 mb-6 sticky top-0 bg-white z-10">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setPage(tab.id)}
          className={`px-4 py-2 font-medium transition duration-200 border-b-2 ${
            currentPage === tab.id
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}