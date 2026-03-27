import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { User, Phone, Shield, Clock, Edit3, Plus, Trash2, Lock, LogOut, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { incidentService } from '../services/incidentService';
import { sosService } from '../services/sosService';
import { changePasswordSchema } from '../utils/validators';
import { Navbar } from '../components/layout/Navbar';
import { Button, Card, Badge, PageLoader } from '../components/ui';
import { getInitials, formatDate, timeAgo, INCIDENT_TYPE_CONFIG } from '../utils/formatters';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile().then(r => r.data),
  });

  const { data: myIncidents } = useQuery({
    queryKey: ['myIncidents'],
    queryFn: () => incidentService.getIncidents({ limit: 20 }).then(r => r.data),
  });

  const { data: mySOS } = useQuery({
    queryKey: ['mySOS'],
    queryFn: () => sosService.getMySOS().then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data).then(r => r.data),
    onSuccess: (data) => { updateUser(data); queryClient.invalidateQueries(['profile']); toast.success('Profile updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => userService.changePassword(data).then(r => r.data),
    onSuccess: () => toast.success('Password changed successfully!'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  if (isLoading) return <><Navbar /><PageLoader /></>;

  const tabs = [
    { key: 'personal', icon: User, label: 'Personal Info' },
    { key: 'contacts', icon: Phone, label: 'Contacts' },
    { key: 'security', icon: Lock, label: 'Security' },
    { key: 'activity', icon: Clock, label: 'Activity' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="pt-20 pb-8 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="md:col-span-1 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-accent-glow flex items-center justify-center text-white text-2xl font-bold mb-3 relative">
              {profile?.profilePicUrl ? (
                <img src={profile.profilePicUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(profile?.name || 'User')
              )}
            </div>
            <h3 className="font-semibold">{profile?.name}</h3>
            <p className="text-text-secondary text-sm">{profile?.email}</p>
            <Badge className="mt-2" color={profile?.role === 'admin' ? '#E91E8C' : '#7C3AED'}>
              {profile?.role === 'admin' ? 'Admin' : 'Member'}
            </Badge>
            <p className="text-xs text-text-secondary mt-3">Member since {formatDate(profile?.createdAt)}</p>

            <div className="w-full border-t border-border mt-4 pt-4 space-y-1">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-btn text-sm transition-colors ${
                    activeTab === tab.key ? 'text-accent-pink bg-accent-pink/10' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}>
                  <tab.icon className="w-4 h-4" />{tab.label}
                </button>
              ))}
            </div>

            <button onClick={handleLogout} className="w-full mt-4 flex items-center gap-2 px-3 py-2 rounded-btn text-sm text-danger hover:bg-danger/10 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </Card>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'personal' && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <Formik initialValues={{ name: profile?.name || '', phone: profile?.phone || '', age: profile?.age || '', address: profile?.address || '' }}
                  onSubmit={(values) => updateMutation.mutate(values)} enableReinitialize>
                  {({ isSubmitting }) => (
                    <Form className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Name</label><Field name="name" className="input-field" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Phone</label><Field name="phone" className="input-field" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Age</label><Field name="age" type="number" className="input-field" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Address</label><Field name="address" className="input-field" /></div>
                      </div>
                      <Button type="submit" loading={updateMutation.isPending} className="h-10"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
                    </Form>
                  )}
                </Formik>
              </Card>
            )}

            {activeTab === 'contacts' && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Emergency Contacts</h3>
                <Formik initialValues={{ contacts: profile?.contacts || [{ name: '', phone: '' }] }}
                  onSubmit={(values) => updateMutation.mutate({ contacts: values.contacts })} enableReinitialize>
                  {({ values }) => (
                    <Form className="space-y-3">
                      {values.contacts.map((_, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Field name={`contacts.${i}.name`} placeholder="Name" className="input-field flex-1" />
                          <Field name={`contacts.${i}.phone`} placeholder="Phone" className="input-field flex-1" />
                          {values.contacts.length > 1 && (
                            <button type="button" onClick={() => {
                              const newC = values.contacts.filter((_, idx) => idx !== i);
                              updateMutation.mutate({ contacts: newC });
                            }} className="p-2 text-danger hover:bg-danger/10 rounded-btn">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {values.contacts.length < 5 && (
                        <button type="button" onClick={() => {
                          const newC = [...values.contacts, { name: '', phone: '' }];
                          values.contacts = newC;
                        }} className="text-accent-pink text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Add Contact</button>
                      )}
                      <Button type="submit" loading={updateMutation.isPending} className="h-10"><Save className="w-4 h-4 mr-2" />Update Contacts</Button>
                    </Form>
                  )}
                </Formik>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <Formik initialValues={{ oldPassword: '', newPassword: '', confirmNewPassword: '' }} validationSchema={changePasswordSchema}
                  onSubmit={(values, { resetForm }) => { passwordMutation.mutate({ oldPassword: values.oldPassword, newPassword: values.newPassword }); resetForm(); }}>
                  {({ errors, touched }) => (
                    <Form className="space-y-4 max-w-md">
                      <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Current Password</label><Field name="oldPassword" type="password" className="input-field" />
                        {errors.oldPassword && touched.oldPassword && <p className="text-xs text-danger mt-1">{errors.oldPassword}</p>}</div>
                      <div><label className="block text-sm font-medium text-text-secondary mb-1.5">New Password</label><Field name="newPassword" type="password" className="input-field" />
                        {errors.newPassword && touched.newPassword && <p className="text-xs text-danger mt-1">{errors.newPassword}</p>}</div>
                      <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm New Password</label><Field name="confirmNewPassword" type="password" className="input-field" />
                        {errors.confirmNewPassword && touched.confirmNewPassword && <p className="text-xs text-danger mt-1">{errors.confirmNewPassword}</p>}</div>
                      <Button type="submit" loading={passwordMutation.isPending} className="h-10">Change Password</Button>
                    </Form>
                  )}
                </Formik>
              </Card>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <Card>
                  <h3 className="text-lg font-semibold mb-3">Your Reports</h3>
                  {myIncidents?.filter(i => i.reportedBy?._id === user?.id || i.reportedBy === user?.id).length > 0 ? (
                    <div className="space-y-2">{myIncidents.filter(i => i.reportedBy?._id === user?.id || i.reportedBy === user?.id).map(inc => {
                      const config = INCIDENT_TYPE_CONFIG[inc.type] || INCIDENT_TYPE_CONFIG.other;
                      return (<div key={inc._id} className="flex items-center justify-between py-2 px-3 rounded-btn hover:bg-white/5 transition-colors">
                        <Badge color={config.color} bg={config.bg}>{config.label}</Badge>
                        <span className="text-xs text-text-secondary">{timeAgo(inc.timestamp)}</span>
                      </div>);
                    })}</div>
                  ) : <p className="text-text-secondary text-sm">No reports yet</p>}
                </Card>
                <Card>
                  <h3 className="text-lg font-semibold mb-3">SOS History</h3>
                  {mySOS?.length > 0 ? (
                    <div className="space-y-2">{mySOS.map(sos => (
                      <div key={sos._id} className="flex items-center justify-between py-2 px-3 rounded-btn hover:bg-white/5 transition-colors">
                        <span className="text-sm">{sos.address?.substring(0, 40) || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          <Badge color={sos.resolved ? '#10B981' : '#EF4444'}>{sos.resolved ? 'Resolved' : 'Active'}</Badge>
                          <span className="text-xs text-text-secondary">{timeAgo(sos.timestamp)}</span>
                        </div>
                      </div>
                    ))}</div>
                  ) : <p className="text-text-secondary text-sm">No SOS events</p>}
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
