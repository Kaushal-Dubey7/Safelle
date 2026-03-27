import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const signupStep1Schema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().matches(/^\+?\d{10,15}$/, 'Invalid phone number').required('Phone is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

export const signupStep2Schema = Yup.object({
  age: Yup.number().min(13, 'Must be at least 13 years old').nullable(),
  address: Yup.string(),
});

export const signupStep3Schema = Yup.object({
  contacts: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Contact name is required'),
      phone: Yup.string().required('Contact phone is required'),
    })
  ).min(1, 'At least one emergency contact is required'),
  agreeTerms: Yup.boolean().oneOf([true], 'You must agree to the terms'),
});

export const incidentSchema = Yup.object({
  type: Yup.string().oneOf(['harassment', 'theft', 'poor_lighting', 'unsafe_crowd', 'assault', 'other']).required('Select incident type'),
  severity: Yup.number().min(1).max(5).required('Select severity'),
  description: Yup.string(),
  lat: Yup.number().required('Location is required'),
  lng: Yup.number().required('Location is required'),
});

export const changePasswordSchema = Yup.object({
  oldPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm your new password'),
});

export function getPasswordStrength(password) {
  if (!password) return { level: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 'Weak', color: '#EF4444' };
  if (score <= 3) return { level: 'Fair', color: '#F59E0B' };
  return { level: 'Strong', color: '#10B981' };
}
