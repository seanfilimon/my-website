"use client";

import { useState } from "react";

interface DayData {
  date: string;
  commits: number;
  level: number; // 0-4 intensity level
}

interface ContributionGraphProps {
  data: DayData[];
}

export function ContributionGraph({ data }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Group days by week
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];
  
  data.forEach((day, index) => {
    currentWeek.push(day);
    if ((index + 1) % 7 === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const handleMouseEnter = (day: DayData, event: React.MouseEvent) => {
    setHoveredDay(day);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const getColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-muted/30';
      case 1: return 'bg-primary/20';
      case 2: return 'bg-primary/40';
      case 3: return 'bg-primary/60';
      case 4: return 'bg-primary/80';
      default: return 'bg-muted/30';
    }
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex gap-[3px] mb-2 ml-6">
        {months.map((month) => (
          <div key={month} className="text-xs text-muted-foreground" style={{ width: '56px' }}>
            {month}
          </div>
        ))}
      </div>

      {/* Contribution graph */}
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] text-xs text-muted-foreground pt-0">
          <div style={{ height: '12px' }}>Mon</div>
          <div style={{ height: '12px' }}></div>
          <div style={{ height: '12px' }}>Wed</div>
          <div style={{ height: '12px' }}></div>
          <div style={{ height: '12px' }}>Fri</div>
          <div style={{ height: '12px' }}></div>
          <div style={{ height: '12px' }}>Sun</div>
        </div>

        {/* Grid of days */}
        <div className="flex gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={(e) => handleMouseEnter(day, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`
                    h-[12px] w-[12px] rounded-sm cursor-pointer transition-all duration-200
                    ${getColor(day.level)}
                    hover:ring-2 hover:ring-primary/50 hover:scale-110
                  `}
                  title={`${day.date}: ${day.commits} commits`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-3 py-2 bg-popover border rounded-sm shadow-lg text-sm pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
          }}
        >
          <div className="font-semibold">{hoveredDay.commits} commits</div>
          <div className="text-xs text-muted-foreground">{hoveredDay.date}</div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-[12px] w-[12px] rounded-sm ${getColor(level)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

// Generate full year of commit data
export function generateYearData(): DayData[] {
  const data: DayData[] = [];
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  for (let i = 0; i < 365; i++) {
    const date = new Date(oneYearAgo);
    date.setDate(date.getDate() + i);
    
    // Random commit count for demo (in production, fetch from GitHub API)
    const commits = Math.floor(Math.random() * 20);
    const level = commits === 0 ? 0 : Math.min(Math.floor(commits / 5) + 1, 4);
    
    data.push({
      date: date.toISOString().split('T')[0],
      commits,
      level
    });
  }

  return data;
}

