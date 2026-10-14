import { useWindowDimensions } from 'react-native';

/**
 * Breakpoints for phones → large phones/landscape → tablets.
 * Used to pick grid column counts and cap content width.
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const gridColumns = width >= 1024 ? 3 : width >= 600 ? 2 : 1;
  const contentMaxWidth = isTablet ? 720 : undefined;
  const horizontalPadding = width < 360 ? 12 : isTablet ? 24 : 16;

  return { width, height, isTablet, isLandscape, gridColumns, contentMaxWidth, horizontalPadding };
};
