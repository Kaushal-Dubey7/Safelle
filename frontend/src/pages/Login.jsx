import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { loginSchema } from '../utils/validators';
import { Button } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { data } = await authService.login(values);
      login(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(233,30,140,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(233,30,140,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="flex w-full max-w-4xl relative z-10">
        {/* Brand Panel - Desktop Only */}
        <div className="hidden lg:flex flex-col justify-center flex-1 pr-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-glow flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">
              <span className="gradient-text">SAFELLE</span>
            </h1>
          </div>
          <p className="text-xl text-text-secondary mb-8">Safety Simplified.<br />Your safest route home.</p>
          <div className="flex gap-6">
            {[
              { value: '445K+', label: 'Crimes Tracked' },
              { value: '52%', label: 'Women Feel Unsafe' },
              { value: '24/7', label: 'Real-time Alerts' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-text-secondary italic">You are not alone.</p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="card p-8">
            <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
              <div className="w-9 h-9 rounded-lg bg-accent-glow flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">SAFELLE</h1>
            </div>

            <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
            <p className="text-text-secondary text-sm mb-6">Sign in to continue to SAFELLE</p>

            <Formik initialValues={{ email: '', password: '' }} validationSchema={loginSchema} onSubmit={handleSubmit}>
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                    <Field name="email" type="email" placeholder="you@example.com" className="input-field" />
                    {errors.email && touched.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-text-secondary">Password</label>
                      <Link to="/forgot-password" className="text-xs text-accent-pink hover:underline">Forgot Password?</Link>
                    </div>
                    <div className="relative">
                      <Field name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && touched.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
                  </div>

                  <Button type="submit" loading={isSubmitting} className="w-full h-12 text-base">
                    Sign In
                  </Button>
                </Form>
              )}
            </Formik>

            <div className="mt-4">
              <button disabled className="w-full h-12 rounded-btn border border-border text-text-secondary text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google Sign In — Coming Soon
              </button>
            </div>

            <p className="text-center text-sm text-text-secondary mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-accent-pink hover:underline font-medium">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
