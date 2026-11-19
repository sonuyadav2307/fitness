/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

async function renderApp() {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  return renderer!;
}

function componentName(type: ReactTestRenderer.ReactTestInstance['type']) {
  if (typeof type === 'string') {
    return type;
  }

  const named = type as { displayName?: string; name?: string };
  return named.displayName || named.name || '';
}

function isComponent(
  node: ReactTestRenderer.ReactTestInstance,
  typeName: string,
) {
  return componentName(node.type) === typeName;
}

function pressables(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAll(node => isComponent(node, 'Pressable'));
}

function pressable(
  renderer: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  const match = pressables(renderer).find(node => node.props.testID === testID);

  if (!match) {
    throw new Error(`Missing pressable ${testID}`);
  }

  return match;
}

async function press(
  renderer: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  await ReactTestRenderer.act(() => {
    pressable(renderer, testID).props.onPress();
  });
}

async function pressLabel(
  renderer: ReactTestRenderer.ReactTestRenderer,
  accessibilityLabel: string,
) {
  const match = pressables(renderer).find(
    node => node.props.accessibilityLabel === accessibilityLabel,
  );

  if (!match) {
    throw new Error(`Missing pressable labeled ${accessibilityLabel}`);
  }

  await ReactTestRenderer.act(() => {
    match.props.onPress();
  });
}

function hasTestId(
  renderer: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  return renderer.root.findAllByProps({ testID }).length > 0;
}

function uniqueText(nodes: ReactTestRenderer.ReactTestInstance[]) {
  return [
    ...new Set(
      nodes
        .map(node => node.props.children)
        .filter(child => typeof child === 'string' || typeof child === 'number')
        .map(String),
    ),
  ];
}

function textByPrefix(
  renderer: ReactTestRenderer.ReactTestRenderer,
  prefix: string,
) {
  return uniqueText(
    renderer.root.findAll(
      node =>
        typeof node.props.testID === 'string' &&
        node.props.testID.startsWith(prefix),
    ),
  );
}

function textValues(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).flatMap(node => {
    const { children } = node.props;
    if (typeof children === 'string' || typeof children === 'number') {
      return [String(children)];
    }
    if (Array.isArray(children)) {
      return children
        .filter(child => typeof child === 'string' || typeof child === 'number')
        .map(String);
    }
    return [];
  });
}

async function addExercise(
  renderer: ReactTestRenderer.ReactTestRenderer,
  name: string,
  muscle?: string,
) {
  const input = renderer.root.findAll(node =>
    isComponent(node, 'TextInput'),
  )[0];

  await ReactTestRenderer.act(() => {
    input.props.onChangeText(name);
  });

  if (muscle) {
    await press(renderer, `muscle-${muscle}`);
  }

  await press(renderer, 'add-exercise-button');
}

test('shows Create Exercise and SWP tabs, starting on Create Exercise', async () => {
  const renderer = await renderApp();

  expect(textValues(renderer)).toEqual(
    expect.arrayContaining(['Create Exercise', 'SWP']),
  );
  expect(
    pressable(renderer, 'tab-create-exercise').props.accessibilityState,
  ).toEqual({ selected: true });
  expect(pressable(renderer, 'tab-swp').props.accessibilityState).toEqual({
    selected: false,
  });
  expect(hasTestId(renderer, 'create-exercise-screen')).toBe(true);
  expect(hasTestId(renderer, 'swp-screen')).toBe(false);
});

test('switches between Create Exercise and SWP', async () => {
  const renderer = await renderApp();

  await press(renderer, 'tab-swp');

  expect(pressable(renderer, 'tab-swp').props.accessibilityState).toEqual({
    selected: true,
  });
  expect(hasTestId(renderer, 'swp-screen')).toBe(true);
  expect(hasTestId(renderer, 'create-exercise-screen')).toBe(false);
  expect(textValues(renderer)).toContain(
    'Create an exercise first. You can add it to this plan after that.',
  );

  await press(renderer, 'go-to-create-exercise');

  expect(
    pressable(renderer, 'tab-create-exercise').props.accessibilityState,
  ).toEqual({ selected: true });
  expect(hasTestId(renderer, 'create-exercise-screen')).toBe(true);
});

test('requires an exercise name', async () => {
  const renderer = await renderApp();

  await ReactTestRenderer.act(() => {
    renderer.root
      .findAll(node => isComponent(node, 'TextInput'))[0]
      .props.onChangeText('   ');
  });
  await press(renderer, 'add-exercise-button');

  expect(textValues(renderer)).toContain('Enter an exercise name.');
  expect(
    renderer.root.findAllByProps({ testID: 'exercise-muscle' }),
  ).toHaveLength(0);
});

test('adds an exercise and uses it in the SWP plan', async () => {
  const renderer = await renderApp();

  await addExercise(renderer, '  Bench press  ', 'Chest');
  await addExercise(renderer, 'Squat', 'Legs');

  const muscles = uniqueText(
    renderer.root.findAllByProps({ testID: 'exercise-muscle' }),
  );
  expect(textValues(renderer)).toEqual(
    expect.arrayContaining(['Bench press', 'Squat']),
  );
  expect(muscles).toEqual(['Legs', 'Chest']);

  await press(renderer, 'tab-swp');
  expect(textValues(renderer)).toContain(
    'Nothing in this plan yet. Add an exercise below.',
  );

  const addButton = pressables(renderer).find(
    node => node.props.accessibilityLabel === 'Add Squat to plan',
  );
  expect(addButton).toBeTruthy();

  await press(renderer, addButton!.props.testID);

  expect(textValues(renderer)).toContain('Squat');
  expect(textValues(renderer)).not.toContain(
    'Nothing in this plan yet. Add an exercise below.',
  );

  expect(textByPrefix(renderer, 'plan-sets-')).toEqual(['3']);
  expect(textByPrefix(renderer, 'plan-reps-')).toEqual(['10']);

  await pressLabel(renderer, 'Increase sets for Squat');
  await pressLabel(renderer, 'Decrease reps for Squat');

  expect(textByPrefix(renderer, 'plan-sets-')).toEqual(['4']);
  expect(textByPrefix(renderer, 'plan-reps-')).toEqual(['9']);

  for (let count = 0; count < 20; count += 1) {
    await pressLabel(renderer, 'Decrease sets for Squat');
  }

  expect(textByPrefix(renderer, 'plan-sets-')).toEqual(['1']);

  await press(renderer, 'tab-create-exercise');
  await pressLabel(renderer, 'Remove Squat from exercises');
  await press(renderer, 'tab-swp');

  expect(textValues(renderer)).not.toContain('Squat');
  expect(textValues(renderer)).toContain('Bench press');
  expect(
    renderer.root.findAll(
      node =>
        typeof node.props.testID === 'string' &&
        node.props.testID.startsWith('plan-sets-'),
    ),
  ).toHaveLength(0);
});
