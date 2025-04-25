import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Extended colors array for 10 segments
export const colors = [
    '#cd5e80', // Green
    '#e05d65',
    '#ee3a64',
    '#3585ea', // Light Orange
    '#3099e8', // Brown
    '#37b6ff', // Orange
    '#24cce3', // Light Purple
    '#8725d0', // Light Brown
    '#a939a9', // Yellow
    '#c1488c', // Light Yellow
];

export const TAU = Math.PI * 2;
export const SPACING = 16;

export const CHART_SIZE = width * 1;

// For 10 equal segments
export const ELEMENT_ANGLE = TAU / 10; // Each segment is 36 degrees (1/10 of the circle)

// Spring configuration for snapping
export const SPRING_CONFIG = {
    damping: 18,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
};