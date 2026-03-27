import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, Plus, Trash2, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { signupStep1Schema, signupStep2Schema, signupStep3Schema, getPasswordStrength } from '../utils/validators';
import { Button } from '../components/ui';

const schemas = [signupStep1Schema, signupStep2Schema, signupStep3Schema];
const stepLabels = ['Account', 'Details', 'Contacts'];

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const initialValues = {
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    age: '', address: '', contacts: [{ name: '', phone: '' }], agreeTerms: false,
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { data } = await authService.register({
        name: values.name, email: values.email, phone: values.phone,
        password: values.password, age: values.age || undefined,
        address: values.address, contacts: values.contacts,
      });
      login(data.user, data.token);
      toast.success('Account created! Welcome to SAFELLE.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="w-full max-w-lg relative z-10">
        <div className="card p-8">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-9 h-9 rounded-lg bg-accent-glow flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">SAFELLE</h1>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-8">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-accent-pink' : 'bg-border'}`} />
                <p className={`text-xs mt-1.5 text-center ${i <= step ? 'text-accent-pink' : 'text-text-secondary'}`}>{label}</p>
              </div>
            ))}
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={schemas[step]}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, isSubmitting, validateForm, setTouched }) => (
              <Form className="space-y-4">
                {step === 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                      <Field name="name" placeholder="Your full name" className="input-field" />
                      {errors.name && touched.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                      <Field name="email" type="email" placeholder="you@example.com" className="input-field" />
                      {errors.email && touched.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone</label>
                      <Field name="phone" placeholder="+91XXXXXXXXXX" className="input-field" />
                      {errors.phone && touched.phone && <p className="text-xs text-danger mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
                      <div className="relative">
                        <Field name="password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" className="input-field pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {values.password && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-300" style={{
                              width: getPasswordStrength(values.password).level === 'Weak' ? '33%' : getPasswordStrength(values.password).level === 'Fair' ? '66%' : '100%',
                              backgroundColor: getPasswordStrength(values.password).color,
                            }} />
                          </div>
                          <span className="text-xs" style={{ color: getPasswordStrength(values.password).color }}>
                            {getPasswordStrength(values.password).level}
                          </span>
                        </div>
                      )}
                      {errors.password && touched.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
                      <Field name="confirmPassword" type="password" placeholder="Re-enter password" className="input-field" />
                      {errors.confirmPassword && touched.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-2 border-border overflow-hidden bg-bg-primary flex items-center justify-center">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-8 h-8 text-text-secondary" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent-glow flex items-center justify-center cursor-pointer hover:shadow-glow-pink transition-shadow">
                          <Plus className="w-4 h-4 text-white" />
                          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Age</label>
                      <Field name="age" type="number" min="13" placeholder="Your age" className="input-field" />
                      {errors.age && touched.age && <p className="text-xs text-danger mt-1">{errors.age}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Address</label>
                      <Field name="address" placeholder="Your address" className="input-field" />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <FieldArray name="contacts">
                      {({ push, remove }) => (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-text-secondary">Emergency Contacts</label>
                          {values.contacts.map((_, i) => (
                            <div key={i} className="flex gap-2">
                              <Field name={`contacts.${i}.name`} placeholder="Name" className="input-field flex-1" />
                              <Field name={`contacts.${i}.phone`} placeholder="Phone" className="input-field flex-1" />
                              {values.contacts.length > 1 && (
                                <button type="button" onClick={() => remove(i)} className="p-3 text-danger hover:bg-danger/10 rounded-btn transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          {values.contacts.length < 5 && (
                            <button type="button" onClick={() => push({ name: '', phone: '' })} className="flex items-center gap-1.5 text-accent-pink text-sm font-medium hover:underline">
                              <Plus className="w-4 h-4" /> Add Contact
                            </button>
                          )}
                          {errors.contacts && typeof errors.contacts === 'string' && <p className="text-xs text-danger">{errors.contacts}</p>}
                        </div>
                      )}
                    </FieldArray>

                    <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                      <Field type="checkbox" name="agreeTerms" className="rounded border-border text-accent-pink focus:ring-accent-pink bg-bg-primary" />
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                    {errors.agreeTerms && touched.agreeTerms && <p className="text-xs text-danger">{errors.agreeTerms}</p>}
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  {step > 0 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-1 flex-1">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  {step < 2 ? (
                    <Button
                      type="button"
                      onClick={async () => {
                        const errors = await validateForm();
                        if (Object.keys(errors).length === 0) {
                          setStep(step + 1);
                          setTouched({});
                        } else {
                          const touchedFields = Object.keys(errors).reduce((acc, key) => {
                            acc[key] = true;
                            return acc;
                          }, {});
                          setTouched(touchedFields);
                        }
                      }}
                      className={`flex items-center justify-center gap-1 ${step > 0 ? 'flex-1' : 'w-full'} h-12`}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="flex items-center justify-center gap-1 flex-1 h-12"
                    >
                      Create Account
                    </Button>
                  )}
                </div>
              </Form>
            )}
          </Formik>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account? <Link to="/login" className="text-accent-pink hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
