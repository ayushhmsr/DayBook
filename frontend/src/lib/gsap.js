// One place to register GSAP plugins. Import gsap / useGSAP from here everywhere.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, Flip);

// Set while the page-transition curtain is covering the screen, so a page's
// intro animation can wait for the curtain to lift.
export const motionState = { fromTransition: false };

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const introDelay = () => (motionState.fromTransition ? 0.55 : 0.1);

export { gsap, ScrollTrigger, Flip, useGSAP };
