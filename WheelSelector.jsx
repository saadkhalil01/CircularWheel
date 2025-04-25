import React, { useEffect } from 'react';
import { StyleSheet, Vibration, } from 'react-native';
import Animated, {
  useDerivedValue,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Canvas,
  Circle,
  Group,
  Image,
  ImageSVG,
  vec,
  useImage,
} from '@shopify/react-native-skia';
import { CHART_SIZE, ELEMENT_ANGLE, TAU } from './constant';
import { buildChart, clamp, friction, normalizeAngle, snapPoint } from './utils';

const chart = buildChart(CHART_SIZE);

// Map from wheel position to actual score value
// This maps the segment at the knob position to the correct score
const POSITION_TO_SCORE = {
  0: 10, // Top segment (270°) shows 10
  1: 9,
  2: 8,
  3: 7,
  4: 6,
  5: 5,
  6: 4,
  7: 3,
  8: 2,
  9: 1  // Last segment shows 1
};

const WheelSelector = ({ angle, setScore, setColor }) => {
  const one = useImage(require('./images/one.png'));
  const two = useImage(require('./images/two.png'));
  const three = useImage(require('./images/three.png'));
  const four = useImage(require('./images/four.png'));
  const five = useImage(require('./images/five.png'));
  const six = useImage(require('./images/six.png'));
  const seven = useImage(require('./images/seven.png'));
  const eight = useImage(require('./images/eight.png'));
  const nine = useImage(require('./images/nine.png'));
  const ten = useImage(require('./images/ten.png'));

  const knobImage = useImage(require('./images/knob.png'));

  // Order pictures to match wheel positioning
  // Based on the screenshot, numbers go counterclockwise from right
  const images = [
    ten, nine, eight, seven, six, five, four, three, two, one
  ];
  const pictures = images.reverse();
  // Track total cumulative rotation (not normalized)
  const totalRotation = useSharedValue(0);
  const offset = useSharedValue(0);
  const dragAngle = useSharedValue(0);
  const lastSnapPoint = useSharedValue(0);

  // Function to convert wheel position to score and update
  const updateScoreFromWheelPosition = (wheelPosition) => {
    if (setScore) {
      // Map wheel position to correct score using our mapping
      const newScore = POSITION_TO_SCORE[wheelPosition];
      setScore(newScore);
      Vibration.vibrate(100);
    }
  };

  // Initial score update
  useEffect(() => {
    if (setScore) {
      // Start with score of 1 (default wheel position)
      setScore(1);
    }
  }, []);

  const pan = Gesture.Pan()
    .onStart(e => {
      const x = e.x - CHART_SIZE / 2;
      const y = -1 * (e.y - CHART_SIZE / 2);

      const initialAngle = Math.atan2(y, x);
      dragAngle.value = normalizeAngle(initialAngle);
      offset.value = angle.value;
    })
    .onUpdate(e => {
      const x = e.x - CHART_SIZE / 2;
      const y = -1 * (e.y - CHART_SIZE / 2);
      const currentAngle = Math.atan2(y, x);
      const normalizedCurrent = normalizeAngle(currentAngle);

      const delta = dragAngle.value - normalizedCurrent;

      // Handle the case when crossing the 0/2PI boundary
      let adjustedDelta = delta;
      if (Math.abs(delta) > Math.PI) {
        adjustedDelta = delta > 0 ? delta - TAU : delta + TAU;
      }

      // Update angle with continuous rotation
      angle.value = offset.value + adjustedDelta;

      // Calculate the wheel position from the current angle
      const normalizedAngle = normalizeAngle(angle.value);
      const wheelPosition = Math.floor(normalizedAngle / ELEMENT_ANGLE) % 10;

      // Update score based on wheel position
      runOnJS(updateScoreFromWheelPosition)(wheelPosition);
    })
    .onEnd(() => {
      // Snap to the nearest segment center
      const normalizedAngle = normalizeAngle(angle.value);

      // Create 10 snap points at segment centers
      const snapPoints = Array.from({ length: 10 }, (_, i) =>
        normalizeAngle(i * ELEMENT_ANGLE + ELEMENT_ANGLE / 2)
      );

      // Find the closest snap point
      const snapTo = snapPoint(normalizedAngle, 0, snapPoints);

      // Calculate full rotations
      const fullRotations = Math.floor(angle.value / TAU) * TAU;

      // Apply snap but maintain full rotation count
      lastSnapPoint.value = snapTo;
      angle.value = withSpring(fullRotations + snapTo, {
        damping: 20,
        stiffness: 150,
      });

      // Calculate the wheel position after snapping
      const snappedPosition = Math.floor(normalizeAngle(snapTo) / ELEMENT_ANGLE) % 10;

      // Update score based on snapped position
      runOnJS(updateScoreFromWheelPosition)(snappedPosition);
    });

  const wheelTransform = useDerivedValue(() => {
    return [{ rotate: angle.value }];
  }, [angle]);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View>
        <Canvas style={styles.canvas}>
          <Group
            transform={wheelTransform}
            origin={vec(CHART_SIZE / 2, CHART_SIZE / 2)}>
            <ImageSVG
              svg={chart}
              x={0}
              y={0}
              width={CHART_SIZE}
              height={CHART_SIZE}
            />

            {pictures.map((pic, index) => {
              const width = 40;
              const height = 45;

              const center = CHART_SIZE / 2;
              const translateY = -1 * (center - center * 0.2 + height / 2);

              // Position each image at center of its segment
              // Each segment is ELEMENT_ANGLE radians
              const itemAngle = index * ELEMENT_ANGLE + ELEMENT_ANGLE / 2;

              return (
                <Image
                  key={`image-${index}`}
                  image={pic}
                  x={center - width / 2}
                  y={center}
                  width={width}
                  height={height}
                  transform={[
                    { rotate: itemAngle },
                    { translateY },
                  ]}
                  origin={vec(center, center)}
                />
              );
            })}
          </Group>

          <Circle
            cx={CHART_SIZE / 2}
            cy={CHART_SIZE / 2}
            r={CHART_SIZE * 0.32}
            color={'rgba(0, 0, 0, 0.2)'}
          />
          <Circle
            cx={CHART_SIZE / 2}
            cy={CHART_SIZE / 2}
            r={CHART_SIZE * 0.3}
            color={'#0b192c'}
          />
          <Image
            image={knobImage}
            x={CHART_SIZE / 2 - CHART_SIZE * 0.045}
            y={CHART_SIZE / 2 - CHART_SIZE * 0.35}
            width={CHART_SIZE * 0.09}
            height={CHART_SIZE * 0.09}
          />
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: CHART_SIZE,
    height: CHART_SIZE,
  },
});

export default WheelSelector;