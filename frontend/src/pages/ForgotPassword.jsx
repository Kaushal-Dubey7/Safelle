import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Shield, Mail, Phone } from 'lucide-react';
import { authService } from '../services/authService';
import { Button } from '../components/ui';

export default function ForgotPassword() {
  const [tab, setTab] = useState('email');
  const [otpStep, setOtpStep] = useState(0);
  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSubmit = async (values, { setSubmitting }) => {
    try {
      await authService.forgotPassword({ email: values.email });
      setEmailSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOTP = async (values, { setSubmitting }) => {
    try {
      await authService.sendOtp({ phone: values.phone });
      setOtpPhone(values.phone);
      setOtpStep(1);
      toast.success('OTP sent to your phone!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Enter all 6 digits'); return; }
    try {
      await authService.verifyOtp({ phone: otpPhone, otp: otpString });
      setOtpStep(2);
      toast.success('OTP verified!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP.');
    }
  };

  const handleNewPassword = async (values, { setSubmitting }) => {
    try {
      toast.success('Password reset successful! Please login.');
    } catch (error) {
      toast.error('Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-9 h-9 rounded-lg bg-accent-glow flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">SAFELLE</h1>
          </div>
          <h2 className="text-xl font-semibold text-center mb-1">Reset Password</h2>
          <p className="text-text-secondary text-sm text-center mb-6">Choose your recovery method</p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-bg-primary rounded-btn mb-6">
            {[
              { key: 'email', icon: Mail, label: 'Email Reset' },
              { key: 'phone', icon: Phone, label: 'Phone OTP' },
            ].map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => { setTab(key); setOtpStep(0); setEmailSent(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-btn text-sm font-medium transition-all ${
                  tab === key ? 'bg-bg-surface text-accent-pink shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {tab === 'email' && !emailSent && (
            <Formik initialValues={{ email: '' }} validationSchema={Yup.object({ email: Yup.string().email().required('Email is required') })} onSubmit={handleEmailSubmit}>
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
                    <Field name="email" type="email" placeholder="you@example.com" className="input-field" />
                    {errors.email && touched.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
                  </div>
                  <Button type="submit" loading={isSubmitting} className="w-full h-12">Send Reset Link</Button>
                </Form>
              )}
            </Formik>
          )}

          {tab === 'email' && emailSent && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Check your inbox</h3>
              <p className="text-text-secondary text-sm">We've sent a password reset link to your email.</p>
            </div>
          )}

          {tab === 'phone' && otpStep === 0 && (
            <Formik initialValues={{ phone: '' }} validationSchema={Yup.object({ phone: Yup.string().required('Phone is required') })} onSubmit={handleSendOTP}>
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone Number</label>
                    <Field name="phone" placeholder="+91XXXXXXXXXX" className="input-field" />
                    {errors.phone && touched.phone && <p className="text-xs text-danger mt-1">{errors.phone}</p>}
                  </div>
                  <Button type="submit" loading={isSubmitting} className="w-full h-12">Send OTP</Button>
                </Form>
              )}
            </Formik>
          )}

          {tab === 'phone' && otpStep === 1 && (
            <div className="space-y-6">
              <p className="text-text-secondary text-sm text-center">Enter the 6-digit code sent to {otpPhone}</p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOTPChange(e, i)} onKeyDown={(e) => handleOTPKeyDown(e, i)}
                    className="w-14 h-16 text-center text-2xl font-bold input-field" />
                ))}
              </div>
              <Button onClick={handleVerifyOTP} className="w-full h-12">Verify OTP</Button>
            </div>
          )}

          {tab === 'phone' && otpStep === 2 && (
            <Formik initialValues={{ newPassword: '', confirmPassword: '' }}
              validationSchema={Yup.object({
                newPassword: Yup.string().min(6).required('Required'),
                confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Must match').required('Required'),
              })} onSubmit={handleNewPassword}>
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">New Password</label>
                    <Field name="newPassword" type="password" placeholder="Min 6 characters" className="input-field" />
                    {errors.newPassword && touched.newPassword && <p className="text-xs text-danger mt-1">{errors.newPassword}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
                    <Field name="confirmPassword" type="password" placeholder="Re-enter password" className="input-field" />
                    {errors.confirmPassword && touched.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
                  </div>
                  <Button type="submit" loading={isSubmitting} className="w-full h-12">Reset Password</Button>
                </Form>
              )}
            </Formik>
          )}

          <p className="text-center text-sm text-text-secondary mt-6">
            Remember your password? <Link to="/login" className="text-accent-pink hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
