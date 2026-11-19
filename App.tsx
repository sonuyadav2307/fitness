/**
 * Fitness app with Create Exercise and SWP tabs.
 *
 * @format
 */

import { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { TabBar } from './src/components/TabBar';
import { CreateExerciseScreen } from './src/screens/CreateExerciseScreen';
import { SwpScreen } from './src/screens/SwpScreen';
import {
  darkPalette,
  lightPalette,
  ThemeProvider,
  useTheme,
} from './src/theme';
import type { Exercise, MuscleGroup, PlanEntry, TabId } from './src/types';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ThemeProvider value={isDarkMode ? darkPalette : lightPalette}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabId>('create-exercise');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plan, setPlan] = useState<PlanEntry[]>([]);

  const addExercise = (draft: { name: string; muscle: MuscleGroup }) => {
    const name = draft.name.trim();
    if (!name) {
      return;
    }

    setExercises(current => [
      { id: createExerciseId(), name, muscle: draft.muscle },
      ...current,
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises(current => current.filter(exercise => exercise.id !== id));
    setPlan(current => current.filter(entry => entry.exerciseId !== id));
  };

  const addToPlan = (exerciseId: string) => {
    setPlan(current =>
      current.some(entry => entry.exerciseId === exerciseId)
        ? current
        : [...current, { exerciseId, sets: 3, reps: 10 }],
    );
  };

  const removeFromPlan = (exerciseId: string) => {
    setPlan(current =>
      current.filter(entry => entry.exerciseId !== exerciseId),
    );
  };

  const updatePlan = (
    exerciseId: string,
    patch: Partial<Pick<PlanEntry, 'sets' | 'reps'>>,
  ) => {
    setPlan(current =>
      current.map(entry => {
        if (entry.exerciseId !== exerciseId) {
          return entry;
        }

        return {
          ...entry,
          sets:
            patch.sets === undefined ? entry.sets : clamp(patch.sets, 1, 20),
          reps:
            patch.reps === undefined ? entry.reps : clamp(patch.reps, 1, 100),
        };
      }),
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <View style={styles.content}>
        {tab === 'create-exercise' ? (
          <CreateExerciseScreen
            exercises={exercises}
            onAdd={addExercise}
            onRemove={removeExercise}
          />
        ) : (
          <SwpScreen
            exercises={exercises}
            onAdd={addToPlan}
            onChange={updatePlan}
            onOpenCreate={() => setTab('create-exercise')}
            onRemove={removeFromPlan}
            plan={plan}
          />
        )}
      </View>
      <TabBar bottomInset={insets.bottom} onSelect={setTab} selected={tab} />
    </View>
  );
}

function createExerciseId() {
  return `ex-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default App;
