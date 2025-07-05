'use client';

import { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';


export default function Page() {
  const fetchHook = useFetch();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (fetchHook && fetchHook.fetchCsvData) {
      fetchHook.fetchCsvData('/data/BattedBallData.csv', setData);
    }
  }, []);

  console.log(data);

  return (
    <>
      <h1>BattingVSPitcher</h1>
      {data.map(batter => (
        <div key={batter.batter_id}>
          <h2>{batter.batter}</h2>
        </div>
      ))}
    </>
  )
}