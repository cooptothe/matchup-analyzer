'use client';

import { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { RowData } from '../../public/data/types';

export default function Page() {
  const { fetchCsvData } = useFetch();
  const [data, setData] = useState<RowData[]>([]);
  const [batters, setBatters] = useState<string[]>([]);
  const [selectedBatter, setSelectedBatter] = useState<string | null>(null);
  const [pitchers, setPitchers] = useState<string[]>([]);
  const [selectedPitcher, setSelectedPitcher] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [videoLink, setVideoLink] = useState<string | null>(null);

  useEffect(() => {
    fetchCsvData('/data/battedBallData.csv', (fetchedData) => {
      setData(fetchedData);
      const uniqueBatters = Array.from(new Set(fetchedData.map(row => row.BATTER))).sort();
      setBatters(uniqueBatters);
    });
  }, []);

  const formatName = (name: string) => {
    if (!name.includes(',')) return name; // fallback for already formatted names
    const [last, first] = name.split(',').map(s => s.trim());
    return `${first} ${last}`;
  };
  

  const handleBatterClick = (batter: string) => {
    setSelectedBatter(batter);
    setSelectedPitcher(null);
    setOutcome(null);
    setVideoLink(null);

    const filtered = data.filter(row => row.BATTER === batter);
    const uniquePitchers = Array.from(new Set(filtered.map(row => row.PITCHER))).sort();
    setPitchers(uniquePitchers);
  };

  const handlePitcherSelect = (pitcher: string) => {
    setSelectedPitcher(pitcher);
    const subset = data.filter(row => {
      return row.BATTER === selectedBatter && row.PITCHER === pitcher;
    });

    const outcomeCounts: Record<string, number> = {};
    subset.forEach(row => {
      outcomeCounts[row.PLAY_OUTCOME] = (outcomeCounts[row.PLAY_OUTCOME] || 0) + 1;
    });

    const mostLikelyOutcome = Object.entries(outcomeCounts).sort((a, b) => b[1] - a[1])[0][0];
    setOutcome(mostLikelyOutcome);

    const matchingVideo = subset.find(row => row.PLAY_OUTCOME === mostLikelyOutcome)?.VIDEO_LINK || null;
    setVideoLink(matchingVideo);
  };

  return (

    <div className="flex flex-col md:flex-row h-screen bg-gray-200">
      {/* Left panel: Batters */}
      <div className="w-1/4 bg-gray-100 border-r border-gray-300 p-2 overflow-y-scroll">
        <h2 className="text-lg font-semibold mb-2">Batters</h2>
        <p className="text-sm text-gray-600 mb-6">Select a batter to see matchup details</p>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 border border-gray-900 rounded"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              const filteredBatters = batters.filter(batter => {
                const formattedBatter = batter.toLowerCase();
                const [lastName, firstName] = formattedBatter.split(',').map(s => s.trim());
                const fullName = `${firstName} ${lastName}`.toLowerCase();
                return fullName.includes(searchTerm) ||
                       formattedBatter.includes(searchTerm) ||
                       `${lastName}, ${firstName}`.includes(searchTerm) ||
                       `${firstName} ${lastName}`.includes(searchTerm);
              });
              setBatters(filteredBatters);
              if (searchTerm === '') {
                setBatters(Array.from(new Set(data.map(row => row.BATTER))).sort());
              }

            }}
          />
        </div>
        {batters.map(b => {
          const batterRow = data.find(row => row.BATTER === b);
          const batterId = batterRow?.BATTER_ID;
          return (
            <button
              key={batterId}
              onClick={() => handleBatterClick(b)}
              className="w-full text-left p-2 mb-2 bg-white hover:bg-gray-200 rounded shadow-sm transition-colors"
            >
              {b}
            </button>
          );
        })}
      </div>

      {/* Right panel: Matchup Details */}
      <div className="w-1/2 p-6">
        {selectedBatter && (
          <>
            <h2 className="text-2xl font-bold mb-4">{formatName(selectedBatter)}</h2>

            <label className="block mb-2 font-medium">Select Pitcher:</label>
            <select
              onChange={(e) => handlePitcherSelect(e.target.value)}
              value={selectedPitcher || ''}
              className="mb-4 p-2 border border-gray-900 rounded w-full"
            >
              <option value="" disabled>Select a pitcher</option>
              {pitchers.map(p => {
                const pitcherRow = data.find(row => row.PITCHER === p);
                const pitcherId = pitcherRow?.PITCHER_ID;
                if (!pitcherId) return null;
                return (
                  <option key={pitcherId} value={p}>{formatName(p)}</option>
                );
              })}
            </select>

            {outcome && (
              <div className="mt-6">
                <p className="text-xl mb-2">
                  <strong>Most Likely Outcome:</strong> {outcome}
                </p>

                {videoLink && (
                  <div className="space-y-2">
                    <a
                      href={videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Watch Video in New Tab
                    </a>

                    <video
                      key={videoLink}
                      width="100%"
                      controls
                      className="rounded border shadow-md"
                    >
                      <source src={videoLink} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
