/**
 * Form Validation Utilities
 * 
 * Client-side validation functions for forms.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  email: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  },

  password: (value: string, minLength: number = 8): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Password is required' };
    }
    
    if (value.length < minLength) {
      return { isValid: false, error: `Password must be at least ${minLength} characters` };
    }
    
    // Check for at least one uppercase, one lowercase, and one number
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      };
    }
    
    return { isValid: true };
  },

  required: (value: string | number | null | undefined, fieldName: string = 'Field'): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  },

  minLength: (value: string, minLength: number, fieldName: string = 'Field'): ValidationResult => {
    if (value.length < minLength) {
      return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
    }
    return { isValid: true };
  },

  maxLength: (value: string, maxLength: number, fieldName: string = 'Field'): ValidationResult => {
    if (value.length > maxLength) {
      return { isValid: false, error: `${fieldName} must be no more than ${maxLength} characters` };
    }
    return { isValid: true };
  },

  match: (value1: string, value2: string, fieldName: string = 'Fields'): ValidationResult => {
    if (value1 !== value2) {
      return { isValid: false, error: `${fieldName} do not match` };
    }
    return { isValid: true };
  },

  url: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'URL is required' };
    }
    
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  },
};

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, Array<(value: any) => ValidationResult>>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field as keyof T];
    
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        errors[field as keyof T] = result.error;
        isValid = false;
        break; // Stop at first error for each field
      }
    }
  }

  return { isValid, errors };
}

