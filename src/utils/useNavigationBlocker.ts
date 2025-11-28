import { useEffect, useRef } from 'react';
import { useBlocker, useLocation } from 'react-router-dom';

interface UseNavigationBlockerOptions {
  message: string;
  onBeforeLeave?: () => void;
  shouldBlock?: boolean;
  allowedPaths: string[];
}

// TODO: refactor this hook so that onBeforeLeave is not triggered instantly without user clicking on leave
export const useNavigationBlocker = ({
  message,
  onBeforeLeave,
  shouldBlock = true,
  allowedPaths = [],
}: UseNavigationBlockerOptions) => {
  const location = useLocation();
  const isConfirmed = useRef(false);

  // Block navigation when user tries to leave
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!shouldBlock) return false;
    if (isConfirmed.current) return false;

    // For post-call pages, block ALL navigation  (we handle redirects manually)
    if (currentLocation.pathname.includes('/post-call')) {
      return currentLocation.pathname !== nextLocation.pathname;
    }

    // Don't block if navigating to an allowed path
    const isAllowedPath = allowedPaths.some((path) =>
      nextLocation.pathname.includes(path)
    );

    if (isAllowedPath) return false;

    // Block if navigating away from current path (but not to allowed paths)
    return currentLocation.pathname !== nextLocation.pathname;
  });

  useEffect(() => {
    if (blocker.state === 'blocked') {
      // If current path contains /call or /post-call, show confirmation but redirect to home instead of proceeding
      if (
        location.pathname.includes('/call') ||
        location.pathname.includes('/post-call')
      ) {
        const shouldLeave = window.confirm(message);

        if (shouldLeave) {
          isConfirmed.current = true;
          onBeforeLeave?.();
          blocker.proceed();
        } else {
          blocker.reset();
        }
        return;
      }

      const shouldLeave = window.confirm(message);

      if (shouldLeave) {
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
      // If current path contains /call or /post-call, show confirmation for refresh/close
      if (
        location.pathname.includes('/call') ||
        location.pathname.includes('/post-call')
      ) {
        onBeforeLeave?.();
        event.preventDefault();
        return;
      }

      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message, shouldBlock, onBeforeLeave, location.pathname]);

  return {
    isBlocked: blocker.state === 'blocked',
  };
};
