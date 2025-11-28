import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUserEventsCtx } from '@/context';
import Reaction from './Reaction';

interface ReactionData {
  id: string;
  emoji: string;
  username: string;
}

const ReactionWrapper = () => {
  const {
    events: { reactionEvents },
  } = useUserEventsCtx();

  const reactions = useMemo(
    () =>
      reactionEvents.map((r) => ({
        id: r.id,
        emoji: r.reaction_type,
        username: r.username,
      })),
    [reactionEvents]
  );

  const [activeReactions, setActiveReactions] = useState<ReactionData[]>([]);

  // Update active reactions when new reactions come in
  useEffect(() => {
    setActiveReactions((currentActiveReactions) => {
      const newReactions = reactions.filter(
        (reaction: ReactionData) =>
          !currentActiveReactions.find((active) => active.id === reaction.id)
      );

      if (newReactions.length > 0) {
        return [...currentActiveReactions, ...newReactions];
      }

      return currentActiveReactions;
    });
  }, [reactions]);

  const handleAnimationEnd = useCallback((id: string) => {
    setActiveReactions((prev) => prev.filter((reaction) => reaction.id !== id));
  }, []);

  return (
    <div className='fixed inset-0 z-50 pointer-events-none'>
      {activeReactions.map((reaction) => (
        <Reaction
          key={reaction.id}
          id={reaction.id}
          emoji={reaction.emoji}
          username={reaction.username}
          onAnimationEnd={handleAnimationEnd}
        />
      ))}
    </div>
  );
};

export default ReactionWrapper;
