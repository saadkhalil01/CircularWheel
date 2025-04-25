import { Skia } from '@shopify/react-native-skia';
import { ELEMENT_ANGLE, TAU, colors } from './constant';

// Normalizes any angle to range from 0 to 2π radians
export const normalizeAngle = (angle) => {
  'worklet';
  return (angle % TAU + TAU) % TAU;
};

// Flutter friction factor function
export const friction = (overScrollFraction) => {
  'worklet';
  return 0.52 * Math.pow(1 - overScrollFraction, 2);
};

// Keeps a value within a given set of boundaries
export const clamp = (value, lower, upper) => {
  'worklet';
  return Math.max(lower, Math.min(value, upper));
};

// William Candillon's snap point function from his redash library
export const snapPoint = (
  value,
  velocity,
  points
) => {
  'worklet';
  const point = value + 0.05 * velocity;
  const deltas = points.map((p) => Math.abs(point - p));
  const minDelta = Math.min.apply(null, deltas);
  return points.filter((p) => Math.abs(point - p) === minDelta)[0];
};

// Builds the chart pie with segments aligned properly
export const buildChart = (size) => {
  'worklet';
  const R = size / 2;

  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns='http://www.w3.org/2000/svg'>`;

  // Start from the right side (0 degrees) to match the screenshot
  // The image shows segment 1 on the right, numbers going counterclockwise
  let start = 0;

  // Create 10 equal segments
  for (let i = 0; i < 10; i++) {
    const end = normalizeAngle(start + ELEMENT_ANGLE);

    // Calculate points for arc
    const startX = R * Math.cos(start) + R;
    const startY = R * Math.sin(start) + R;
    const endX = R * Math.cos(end) + R;
    const endY = R * Math.sin(end) + R;

    // Use the correct color for this segment
    // Colors in reverse order to match the score layout from the screenshot
    const colorIndex = 9 - i;

    // Create segment path
    svg += `<path d="M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY} L ${R} ${R} Z" fill="${colors[colorIndex % colors.length]}" />`;

    start = end;
  }

  svg += '</svg>';
  return Skia.SVG.MakeFromString(svg);
};