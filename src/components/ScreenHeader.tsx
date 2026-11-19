import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type Palette } from '../theme';

type Props = {
  title: string;
  subtitle: string;
};

export function ScreenHeader({ title, subtitle }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>Fitness</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    header: {
      gap: 6,
      marginBottom: 20,
    },
    eyebrow: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    title: {
      color: colors.text,
      fontSize: 30,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.muted,
      fontSize: 16,
      lineHeight: 22,
    },
  });
}
