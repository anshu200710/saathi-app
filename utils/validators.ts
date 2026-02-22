/**
 * utils/validators.ts — Input validation helpers
 */

export const validators = {
  mobile: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) return 'Mobile number is required';
    if (cleaned.length !== 10) return 'Enter a valid 10-digit mobile number';
    if (!/^[6-9]/.test(cleaned)) return 'Mobile number must start with 6, 7, 8, or 9';
    return null;
  },

  otp: (value: string) => {
    if (!value) return 'OTP is required';
    if (value.length !== 6) return 'Enter the 6-digit OTP';
    return null;
  },

  pan: (value: string) => {
    if (!value) return 'PAN is required';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase()))
      return 'Enter a valid PAN (e.g. ABCDE1234F)';
    return null;
  },

  gstin: (value: string) => {
    if (!value) return null; // GSTIN is optional
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(value.toUpperCase()))
      return 'Enter a valid 15-digit GSTIN';
    return null;
  },

  pincode: (value: string) => {
    if (!value) return 'Pincode is required';
    if (!/^\d{6}$/.test(value)) return 'Enter a valid 6-digit pincode';
    return null;
  },

  required: (value: string, fieldName = 'This field') => {
    if (!value?.trim()) return `${fieldName} is required`;
    return null;
  },
};