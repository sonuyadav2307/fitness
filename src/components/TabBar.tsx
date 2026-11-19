import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, type Palette } from '../theme';
import type { TabId } from '../types';

const TABS: { id: TabId; label: string; testID: string }[] = [
  {
    id: 'create-exercise',
    label: 'Create Exercise',
    testID: 'tab-create-exercise',
  },
  { id: 'swp', label: 'SWP', testID: 'tab-swp' },
];

type Props = {
  selected: TabId;
  onSelect: (tab: TabId) => void;
  bottomInset: number;
};

export function TabBar({ selected, onSelect, bottomInset }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(bottomInset, 8) }]}
    >
      {TABS.map(tab => {
        const isSelected = tab.id === selected;
        return (
          <Pressable
            key={tab.id}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              isSelected && styles.tabSelected,
              pressed && styles.pressed,
            ]}
            testID={tab.testID}
          >
            <Text
              numberOfLines={1}
              style={[styles.label, isSelected && styles.labelSelected]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    bar: {
      backgroundColor: colors.tabBar,
      borderTopColor: colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      paddingTop: 4,
    },
    tab: {
      alignItems: 'center',
      borderTopColor: 'transparent',
      borderTopWidth: 3,
      flex: 1,
      justifyContent: 'center',
      minHeight: 52,
      paddingHorizontal: 8,
      paddingVertical: 10,
    },
    tabSelected: {
      borderTopColor: colors.accent,
    },
    label: {
      color: colors.tabInactive,
      fontSize: 14,
      fontWeight: '600',
    },
    labelSelected: {
      color: colors.accent,
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
