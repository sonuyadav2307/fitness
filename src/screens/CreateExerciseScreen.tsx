import { useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTheme, type Palette } from '../theme';
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from '../types';

type Props = {
  exercises: Exercise[];
  onAdd: (exercise: { name: string; muscle: MuscleGroup }) => void;
  onRemove: (id: string) => void;
};

export function CreateExerciseScreen({ exercises, onAdd, onRemove }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup>('Chest');
  const [error, setError] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter an exercise name.');
      return;
    }

    setError('');
    onAdd({ name: trimmed, muscle });
    setName('');
    Keyboard.dismiss();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="create-exercise-screen"
    >
      <ScreenHeader
        subtitle="Save a movement, then use it in SWP."
        title="Create Exercise"
      />

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          accessibilityLabel="Exercise name"
          maxLength={60}
          onChangeText={value => {
            setName(value);
            if (error) {
              setError('');
            }
          }}
          onSubmitEditing={submit}
          placeholder="Bench press"
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          style={styles.input}
          testID="exercise-name-input"
          value={name}
        />

        <Text style={styles.label}>Muscle</Text>
        <View accessibilityRole="radiogroup" style={styles.chips}>
          {MUSCLE_GROUPS.map(option => {
            const selected = option === muscle;
            return (
              <Pressable
                key={option}
                accessibilityLabel={option}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setMuscle(option)}
                style={[styles.chip, selected && styles.chipSelected]}
                testID={`muscle-${option}`}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityLabel="Add exercise"
          accessibilityRole="button"
          onPress={submit}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          testID="add-exercise-button"
        >
          <Text style={styles.buttonText}>Add exercise</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Your exercises</Text>
      {exercises.length === 0 ? (
        <Text style={styles.empty}>
          Nothing here yet. Exercises you add are available in SWP.
        </Text>
      ) : (
        exercises.map(exercise => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseCopy}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseMuscle} testID="exercise-muscle">
                {exercise.muscle}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={`Remove ${exercise.name} from exercises`}
              accessibilityRole="button"
              onPress={() => onRemove(exercise.id)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    content: {
      paddingBottom: 28,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      gap: 10,
      padding: 16,
    },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      marginTop: 4,
    },
    input: {
      backgroundColor: colors.input,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.text,
      fontSize: 16,
      minHeight: 48,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      backgroundColor: colors.input,
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    chipText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    chipTextSelected: {
      color: colors.accentText,
    },
    error: {
      color: colors.danger,
      fontSize: 14,
    },
    button: {
      alignItems: 'center',
      backgroundColor: colors.accent,
      borderRadius: 12,
      marginTop: 6,
      minHeight: 48,
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '700',
    },
    section: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      marginTop: 24,
    },
    empty: {
      color: colors.muted,
      fontSize: 15,
      lineHeight: 21,
    },
    exerciseCard: {
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
    exerciseName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    exerciseMuscle: {
      color: colors.muted,
      fontSize: 14,
    },
    remove: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
