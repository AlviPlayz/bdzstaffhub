
import React from 'react';
import { ScoreEvent } from '@/services/staff/events/types';
import { format } from 'date-fns';

interface ScoreEventsListProps {
  events: ScoreEvent[];
}

const ScoreEventsList: React.FC<ScoreEventsListProps> = ({ events }) => {
  if (!events.length) {
    return (
      <div className="text-center p-4">
        <p className="text-cyber-cyan/60">No score events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
      {events.map(event => (
        <div 
          key={event.id} 
          className="cyber-panel-sm p-3 border-l-4 border-cyber-cyan flex justify-between items-center"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-digital">{event.action}</span>
              <span className="text-xs text-cyber-yellow bg-cyber-darkpurple px-2 py-0.5 rounded">
                {event.source}
              </span>
            </div>
            <p className="text-xs text-cyber-cyan/70">
              {event.created_at && format(new Date(event.created_at), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
          <div className="text-right">
            <span className={`font-mono font-bold ${event.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {event.points > 0 ? '+' : ''}{event.points.toFixed(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScoreEventsList;
