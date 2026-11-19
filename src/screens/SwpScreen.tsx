import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTheme, type Palette } from '../theme';
import type { Exercise, PlanEntry } from '../types';

type Props = {
  exercises: Exercise[];
  plan: PlanEntry[];
  onAdd: (exerciseId: string) => void;
  onRemove: (exerciseId: string) => void;
  onChange: (
    exerciseId: string,
    patch: Partial<Pick<PlanEntry, 'sets' | 'reps'>>,
  ) => void;
  onOpenCreate: () => void;
};

export function SwpScreen({
  exercises,
  plan,
  onAdd,
  onRemove,
  onChange,
  onOpenCreate,
}: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const exerciseById = new Map(
    exercises.map(exercise => [exercise.id, exercise]),
  );
  const plannedIds = new Set(plan.map(entry => entry.exerciseId));
  const available = exercises.filter(exercise => !plannedIds.has(exercise.id));
  const planRows = plan.flatMap(entry => {
    const exercise = exerciseById.get(entry.exerciseId);
    return exercise ? [{ entry, exercise }] : [];
  });

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="swp-screen"
    >
      <ScreenHeader
        subtitle="Choose exercises and set the sets and reps."
        title="SWP"
      />

      {exercises.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.empty}>
            Create an exercise first. You can add it to this plan after that.
          </Text>
          <Pressable
            accessibilityLabel="Go to Create Exercise"
            accessibilityRole="button"
            onPress={onOpenCreate}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            testID="go-to-create-exercise"
          >
            <Text style={styles.buttonText}>Create Exercise</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.section}>In this plan</Text>
          {planRows.length === 0 ? (
            <Text style={styles.empty}>
              Nothing in this plan yet. Add an exercise below.
            </Text>
          ) : (
            planRows.map(({ entry, exercise }) => (
              <View key={entry.exerciseId} style={styles.card}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.meta}>{exercise.muscle}</Text>
                <View style={styles.stepperRow}>
                  <Stepper
                    decreaseLabel={`Decrease sets for ${exercise.name}`}
                    increaseLabel={`Increase sets for ${exercise.name}`}
                    label="Sets"
                    onDecrease={() =>
                      onChange(exercise.id, { sets: entry.sets - 1 })
                    }
                    onIncrease={() =>
                      onChange(exercise.id, { sets: entry.sets + 1 })
                    }
                    styles={styles}
                    testID={`plan-sets-${exercise.id}`}
                    value={entry.sets}
                  />
                  <Stepper
                    decreaseLabel={`Decrease reps for ${exercise.name}`}
                    increaseLabel={`Increase reps for ${exercise.name}`}
                    label="Reps"
                    onDecrease={() =>
                      onChange(exercise.id, { reps: entry.reps - 1 })
                    }
                    onIncrease={() =>
                      onChange(exercise.id, { reps: entry.reps + 1 })
                    }
                    styles={styles}
                    testID={`plan-reps-${exercise.id}`}
                    value={entry.reps}
                  />
                </View>
                <Pressable
                  accessibilityLabel={`Remove ${exercise.name} from plan`}
                  accessibilityRole="button"
                  onPress={() => onRemove(exercise.id)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            ))
          )}

          <Text style={styles.section}>Available exercises</Text>
          {available.length === 0 ? (
            <Text style={styles.empty}>
              Every exercise is already in this plan.
            </Text>
          ) : (
            available.map(exercise => (
              <View key={exercise.id} style={styles.availableRow}>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.meta}>{exercise.muscle}</Text>
                </View>
                <Pressable
                  accessibilityLabel={`Add ${exercise.name} to plan`}
                  accessibilityRole="button"
                  onPress={() => onAdd(exercise.id)}
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.pressed,
                  ]}
                  testID={`add-to-plan-${exercise.id}`}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

function Stepper({
  label,
  value,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  testID,
  styles,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseLabel: string;
  increaseLabel: string;
  testID: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          accessibilityLabel={decreaseLabel}
          accessibilityRole="button"
          onPress={onDecrease}
          style={({ pressed }) => [
            styles.stepperButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.stepperButtonText}>-</Text>
        </Pressable>
        <Text style={styles.stepperValue} testID={testID}>
          {value}
        </Text>
        <Pressable
          accessibilityLabel={increaseLabel}
          accessibilityRole="button"
          onPress={onIncrease}
          style={({ pressed }) => [
            styles.stepperButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    content: {
      paddingBottom: 28,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    section: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      marginTop: 8,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      gap: 8,
      marginBottom: 12,
      padding: 16,
    },
    empty: {
      color: colors.muted,
      fontSize: 15,
      lineHeight: 21,
      marginBottom: 12,
    },
    exerciseName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    meta: {
      color: colors.muted,
      fontSize: 14,
    },
    stepperRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 4,
    },
    stepper: {
      flexGrow: 1,
      gap: 6,
      minWidth: 140,
    },
    stepperLabel: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
    },
    stepperControls: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    stepperButton: {
      alignItems: 'center',
      backgroundColor: colors.accentSoft,
      borderRadius: 10,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    stepperButtonText: {
      color: colors.accent,
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 22,
    },
    stepperValue: {
      color: colors.text,
      fontSize: 18,
      fontVariant: ['tabular-nums'],
      fontWeight: '700',
      minWidth: 28,
      textAlign: 'center',
    },
    remove: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: '700',
    },
    availableRow: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      marginBottom: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    exerciseCopy: {
      flex: 1,
      gap: 2,
    },
    addButton: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    addButtonText: {
      color: colors.accentText,
      fontSize: 14,
      fontWeight: '700',
    },
    button: {
      alignItems: 'center',
      backgroundColor: colors.accent,
      borderRadius: 12,
      minHeight: 48,
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
