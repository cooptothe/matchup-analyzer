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
    const subset = data.filter(row => row.BATTER === selectedBatter && row.PITCHER === pitcher);
    const outcomeCounts: Record<string, number> = {};

    subset.forEach(row => {
      outcomeCounts[row.PLAY_OUTCOME] = (outcomeCounts[row.PLAY_OUTCOME] || 0) + 1;
    });

    const mostLikelyOutcome = Object.entries(outcomeCounts).sort((a, b) => b[1] - a[1])[0][0];
    setOutcome(mostLikelyOutcome);

    const matchingVideo = subset.find(row => row.PLAY_OUTCOME === mostLikelyOutcome)?.VIDEO_LINK || null;
    setVideoLink(matchingVideo);
    
  };

  console.log(batters);

  return (
    <div style={{ display: 'flex', padding: '1rem' }}>
      {/* Batter List */}
      <div style={{ width: '20%', overflowY: 'scroll', maxHeight: '90vh', paddingRight: '1rem' }}>
        <h2>Batters</h2>
        {batters.map(b => {
          // Find the first row for this batter to get the unique BATTER_ID
          const batterRow = data.find(row => row.BATTER === b);
          const batterId = batterRow?.BATTER_ID
          return (
        <div key={batterId} onClick={() => handleBatterClick(b)} style={{ cursor: 'pointer', marginBottom: 4 }}>
          {b}
        </div>
          );
        })}
      </div>

      {/* Matchup Analyzer */}
      <div style={{ width: '80%' }}>
        {selectedBatter && (
          <>
            <h2>{selectedBatter}</h2>
            <label>Select Pitcher:</label>
            <select onChange={(e) => handlePitcherSelect(e.target.value)} value={selectedPitcher || ''}>
              <option value="" disabled>Select a pitcher</option>
              {pitchers.map(p => {
                // Find the first row for this pitcher to get the unique PITCHER_ID
                const pitcherRow = data.find(row => row.PITCHER === p);
                const pitcherId = pitcherRow?.PITCHER_ID;
                if (!pitcherId) {
                  return null; // Skip if no unique ID found
              } return (
                <option key={pitcherId} value={p}>{p}</option>
              )})}
            </select>

            {outcome && (
              <div style={{ marginTop: '1rem' }}>
                <p><strong>Most Likely Outcome:</strong> {outcome}</p>
                {videoLink && (
                  <div>
                    <a href={videoLink} target="_blank" rel="noopener noreferrer">Watch Video</a>
                    <br />
                    <video width="400" controls>
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