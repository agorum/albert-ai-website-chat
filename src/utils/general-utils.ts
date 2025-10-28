/**
 * General utility functions
 * 
 * This module provides general-purpose utility functions used throughout
 * the application, including object manipulation and value constraints.
 */

import { DeepPartial } from '../types';

/**
 * Performs a deep merge tailored for configuration objects.
 * Arrays are replaced (not merged), and undefined values are ignored.
 * 
 * @param target - The base object to merge into
 * @param source - The partial object with values to merge
 * @returns The merged object
 */
export function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  if (!source) {
    return target;
  }
  
  const output: any = Array.isArray(target) ? [...(target as any)] : { ...target };
  
  Object.keys(source).forEach((key) => {
    const typedKey = key as keyof T;
    const sourceValue = source[typedKey];
    
    if (sourceValue === undefined) {
      return;
    }
    
    const targetValue = (target as any)[typedKey];
    
    if (Array.isArray(sourceValue)) {
      // Replace arrays entirely (don't merge)
      output[typedKey] = [...sourceValue];
    } else if (
      sourceValue !== null &&
      typeof sourceValue === "object" &&
      targetValue !== null &&
      typeof targetValue === "object"
    ) {
      // Recursively merge objects
      output[typedKey] = deepMerge(targetValue, sourceValue as any);
    } else {
      // Replace primitive values
      output[typedKey] = sourceValue;
    }
  });
  
  return output;
}

/**
 * Restricts a numeric value to the provided min/max range.
 * 
 * @param value - The value to constrain
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalizes a backend endpoint URL by stripping trailing slashes.
 * This ensures path concatenation remains predictable.
 * 
 * @param endpoint - The endpoint URL to normalize
 * @returns The normalized endpoint URL
 */
export function normalizeEndpoint(endpoint: string): string {
  return endpoint.trim().replace(/\/+$/, "");
}

/**
 * Checks whether the provided icon reference points to an SVG asset.
 * 
 * @param icon - The icon string to check
 * @returns True if the icon is an SVG reference
 */
export function isSvgIcon(icon: string): boolean {
  const value = icon.trim();
  if (!value) {
    return false;
  }
  
  // Check for data URI
  if (/^data:image\/svg\+xml/i.test(value)) {
    return true;
  }
  
  // Check for .svg extension
  if (/\.svg(\?.*)?$/i.test(value)) {
    return true;
  }
  
  // Check absolute URLs with .svg extension
  if (/^(https?:)?\/\/.+/i.test(value)) {
    return /\.svg(\?.*)?$/i.test(value);
  }
  
  // Check relative paths with .svg extension
  if (value.startsWith("./") || value.startsWith("../")) {
    return /\.svg(\?.*)?$/i.test(value);
  }
  
  return false;
}