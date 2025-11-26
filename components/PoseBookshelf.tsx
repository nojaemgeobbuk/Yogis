
import React, { useMemo, useState } from 'react';
import type { JournalEntry, YogaPose } from '../types';
import PoseBookCard from './PoseBookCard';
import PoseEntriesModal from './PoseEntriesModal';

interface PoseBookshelfProps {
  entries: JournalEntry[];
}

type PoseWithEntries = {
  pose: YogaPose;
  entries: JournalEntry[];
};

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);


const PoseBookshelf: React.FC<PoseBookshelfProps> = ({ entries }) => {
  const [selectedPoseData, setSelectedPoseData] = useState<PoseWithEntries | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const frequentSequences = useMemo(() => {
    const sequenceMap = new Map<string, { poses: YogaPose[], count: number }>();
    
    // Find pairs of poses (sequences of 2)
    entries.forEach(entry => {
      if (entry.poses.length > 1) {
        for (let i = 0; i < entry.poses.length - 1; i++) {
          const pose1 = entry.poses[i];
          const pose2 = entry.poses[i+1];
          const sequence = [pose1, pose2];
          const key = `${pose1.name} -> ${pose2.name}`;
          
          if (sequenceMap.has(key)) {
            sequenceMap.get(key)!.count++;
          } else {
            sequenceMap.set(key, { poses: sequence, count: 1 });
          }
        }
      }
    });

    return Array.from(sequenceMap.values())
      .filter(seq => seq.count > 1) // Only show sequences practiced more than once
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Show top 3
  }, [entries]);

  const allPoses = useMemo(() => {
    const poseMap = new Map<string, PoseWithEntries>();

    entries.forEach(entry => {
      entry.poses.forEach(pose => {
        if (!poseMap.has(pose.name)) {
          poseMap.set(pose.name, { pose, entries: [] });
        }
        // Using non-null assertion as we know the key exists from the line above
        poseMap.get(pose.name)!.entries.push(entry);
      });
    });

    return Array.from(poseMap.values()).sort((a,b) => a.pose.name.localeCompare(b.pose.name));
  }, [entries]);

  const filteredPoses = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPoses;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return allPoses.filter(({ pose }) => 
        pose.name.toLowerCase().includes(lowerCaseQuery) ||
        pose.sanskritName.toLowerCase().includes(lowerCaseQuery)
    );
  }, [allPoses, searchQuery]);


  if (allPoses.length === 0) {
    return (
       <div className="text-center py-20 px-4">
        <h3 className="text-xl text-stone-600 dark:text-slate-300 font-semibold">나의 자세 탐험하기</h3>
        <p className="text-stone-500 dark:text-slate-400 mt-2">일지에서 자세를 추가하면 여기에 라이브러리가 생성됩니다.</p>
      </div>
    )
  }

  return (
    <div className="my-8">
      {frequentSequences.length > 0 && (
            <div className="w-full max-w-4xl mx-auto mb-12 p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-stone-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-stone-700 dark:text-slate-200 mb-4 text-center">자주 하는 시퀀스</h2>
                <div className="space-y-4">
                    {frequentSequences.map((seq, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-stone-50/80 dark:bg-slate-800 rounded-lg border border-stone-200 dark:border-slate-700">
                            <div className="flex items-center space-x-2 md:space-x-4">
                                {seq.poses.map((pose, poseIndex) => (
                                    <React.Fragment key={pose.name}>
                                        <div className="flex flex-col items-center text-center w-24">
                                            <div
                                                className="w-12 h-12 text-teal-700 dark:text-teal-400"
                                                dangerouslySetInnerHTML={{ __html: pose.svgIcon }}
                                            />
                                            <p className="text-xs font-semibold text-stone-700 dark:text-slate-300 mt-1 truncate">{pose.name}</p>
                                        </div>
                                        {poseIndex < seq.poses.length - 1 && (
                                            <div className="flex-shrink-0">
                                                <ArrowRightIcon />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="text-sm font-semibold text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/50 px-3 py-1.5 rounded-full whitespace-nowrap">
                                {seq.count}회 반복
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      <div className="w-full max-w-xl mx-auto mb-8">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="자세 이름 또는 산스크리트어로 검색..."
                className="w-full p-3 pl-11 border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-800 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-400 rounded-full focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition"
                aria-label="요가 자세 검색"
            />
        </div>
      </div>

      {filteredPoses.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPoses.map(poseData => (
            <PoseBookCard
              key={poseData.pose.name}
              pose={poseData.pose}
              entryCount={poseData.entries.length}
              onClick={() => setSelectedPoseData(poseData)}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-20 px-4">
          <h3 className="text-xl text-stone-600 dark:text-slate-300 font-semibold">검색 결과 없음</h3>
          <p className="text-stone-500 dark:text-slate-400 mt-2">"{searchQuery}"에 해당하는 자세를 찾을 수 없습니다.</p>
        </div>
      )}


      {selectedPoseData && (
        <PoseEntriesModal 
            poseData={selectedPoseData} 
            onClose={() => setSelectedPoseData(null)} 
        />
      )}
    </div>
  );
};

export default PoseBookshelf;
