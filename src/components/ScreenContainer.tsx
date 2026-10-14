import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

interface ScreenContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  /** Render without a ScrollView (for screens that manage their own list). */
  static?: boolean;
}

/**
 * Responsive page wrapper: consistent padding, and content centred with a max
 * width on tablets so forms and detail pages don't stretch edge-to-edge.
 */
export const ScreenContainer = ({ children, static: isStatic, contentContainerStyle, ...rest }: ScreenContainerProps) => {
  const { contentMaxWidth, horizontalPadding } = useResponsive();
  const inner = [
    styles.inner,
    { paddingHorizontal: horizontalPadding, maxWidth: contentMaxWidth },
  ];

  if (isStatic) {
    return (
      <View style={styles.screen}>
        <View style={[inner, styles.flex]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[inner, styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  inner: { width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  scrollContent: { paddingVertical: spacing.lg, flexGrow: 1 },
});
