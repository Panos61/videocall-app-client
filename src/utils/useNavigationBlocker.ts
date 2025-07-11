import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseNavigationBlockerOptions {
  message: string;
  onBeforeLeave?: () => void;
  shouldBlock?: boolean;
  allowedPaths: string[];
}

export const useNavigationBlocker = ({
  message,
  onBeforeLeave,
  shouldBlock = true,
  allowedPaths = [],
}: UseNavigationBlockerOptions) => {
  // Block navigation when user tries to leave
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!shouldBlock) return false;

    // Don't block if navigating to an allowed path
    const isAllowedPath = allowedPaths.some((path) =>
      nextLocation.pathname.includes(path)
    );

    if (isAllowedPath) return false;

    // Block if navigating away from current path (but not to allowed paths)
    return currentLocation.pathname !== nextLocation.pathname;
  });

  // Handle the confirmation dialog
  useEffect(() => {
    if (blocker.state === 'blocked') {
      const shouldLeave = window.confirm(message);

      if (shouldLeave) {
        // Run cleanup function if provided
        onBeforeLeave?.();
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, message, onBeforeLeave]);

  // Handle browser back button and page refresh
  useEffect(() => {
    if (!shouldBlock) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message, shouldBlock]);

  return {
    isBlocked: blocker.state === 'blocked',
  };
};
