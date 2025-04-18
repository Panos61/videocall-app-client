// test
// todo: update responsiveness

type GridConfig = {
  containerClass: string;
  videoTileClass: string[];
};

export const computeGridLayout = (
  totalVideos: number,
  isMediumScreen: boolean
): GridConfig => {
  const isOdd = (n: number): boolean => n % 2 !== 0;
  const countTotal = isOdd(totalVideos) ? totalVideos - 1 : totalVideos;

  const maxCols = isMediumScreen ? 2 : Math.min(4, countTotal);
  const gridCols = isMediumScreen ? 'grid-cols-1' : `grid-cols-${maxCols}`;

  //@ update it for more that 2-3 users
  const gridRows = () => {
    if (isMediumScreen) {
      return 'grid-rows-2';
    }

    return 'auto-rows-auto';
  };

  const containerClass = `grid ${gridCols} ${gridRows()} gap-8 h-full`;

  const videoTileClass: string[] = [];
  for (let i = 0; i < totalVideos; i++) {
    if (!isMediumScreen && isOdd(totalVideos) && i === totalVideos - 1) {
      videoTileClass.push('col-span-full row-span-1');
    } else {
      videoTileClass.push('row-span-1 w-full');
    }
  }

  return { containerClass, videoTileClass };
};
