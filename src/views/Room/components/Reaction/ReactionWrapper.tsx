import { useState, useCallback, useEffect } from 'react';
import Reaction from './Reaction';

interface ReactionData {
  id: string;
  emoji: string;
  username: string;
  timestamp: number;
}

interface ReactionWrapperProps {
    reactions: ReactionData[];
}

const ReactionWrapper = ({ reactions }: ReactionWrapperProps) => {
  const [activeReactions, setActiveReactions] = useState<ReactionData[]>([]);

  // Update active reactions when new reactions come in
  useEffect(() => {
    const newReactions = reactions.filter(
      reaction => !activeReactions.find(active => active.id === reaction.id)
    );
    
    if (newReactions.length > 0) {
      setActiveReactions(prev => [...prev, ...newReactions]);
    }
  }, [reactions, activeReactions]);

  const handleAnimationEnd = useCallback((id: string) => {
    setActiveReactions(prev => prev.filter(reaction => reaction.id !== id));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {activeReactions.map((reaction) => (
        <Reaction
          key={reaction.id}
          emoji={reaction.emoji}
          username={reaction.username}
          id={reaction.id}
          onAnimationEnd={handleAnimationEnd}
        />
      ))}
    </div>
  );
};

export default ReactionWrapper;