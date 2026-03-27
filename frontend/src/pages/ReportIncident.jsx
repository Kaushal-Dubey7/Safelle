import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FileWarning, MapPin, Upload, Star, Camera, CheckCircle } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { incidentService } from '../services/incidentService';
import { incidentSchema } from '../utils/validators';
import { Navbar } from '../components/layout/Navbar';
import { Button, Card } from '../components/ui';
import { INCIDENT_TYPE_CONFIG } from '../utils/formatters';
import { SafelleMap } from '../components/map/SafelleMap';
import { Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';

function MapPicker({ onSelect }) {
  useMapEvents({
    click(e) { onSelect(e.latlng); },
  });
  return null;
}

export default function ReportIncident() {
  const navigate = useNavigate();
  const { lat, lng } = useGeolocation();
  const [locationMode, setLocationMode] = useState('my');
  const [pickedLocation, setPickedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  useState(() => {
    if (lat && lng) {
      axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'User-Agent': 'SAFELLE/1.0' } })
        .then(r => setAddress(r.data.display_name || ''))
        .catch(() => {});
    }
  }, [lat, lng]);

  const mutation = useMutation({
    mutationFn: (values) => incidentService.createIncident(values).then(r => r.data),
    onSuccess: () => {
      toast.success('Report submitted — thank you for making the community safer!');
      setShowConfetti(true);
      setTimeout(() => navigate('/map'), 2000);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit report'),
  });

  const effectiveLat = locationMode === 'my' ? lat : pickedLocation?.lat;
  const effectiveLng = locationMode === 'my' ? lng : pickedLocation?.lng;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="pt-20 pb-8 px-4 max-w-2xl mx-auto">
        {showConfetti && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center animate-float">
              <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
              <p className="text-xl font-bold text-success">Report Submitted!</p>
              <p className="text-text-secondary text-sm mt-2">Thank you for making the community safer.</p>
            </div>
          </div>
        )}

        <Card>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-accent-pink" /> Report an Incident
          </h2>

          <Formik
            initialValues={{ type: '', severity: 0, description: '', lat: effectiveLat || '', lng: effectiveLng || '', anonymous: false }}
            enableReinitialize
            validationSchema={incidentSchema}
            onSubmit={(values) => mutation.mutate(values)}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form className="space-y-6">
                {/* Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">Incident Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(INCIDENT_TYPE_CONFIG).map(([key, config]) => (
                      <button key={key} type="button" onClick={() => setFieldValue('type', key)}
                        className={`p-3 rounded-btn border text-sm font-medium transition-all text-left ${
                          values.type === key
                            ? 'border-accent-pink bg-accent-pink/10 text-accent-pink'
                            : 'border-border bg-bg-primary text-text-secondary hover:border-white/20'
                        }`}>
                        {config.label}
                      </button>
                    ))}
                  </div>
                  {errors.type && touched.type && <p className="text-xs text-danger mt-1">{errors.type}</p>}
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">Severity</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setFieldValue('severity', s)}
                        className="transition-transform hover:scale-110">
                        <Star className={`w-8 h-8 ${s <= values.severity ? 'text-accent-pink fill-accent-pink' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                  {errors.severity && touched.severity && <p className="text-xs text-danger mt-1">{errors.severity}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Description (optional)</label>
                  <Field as="textarea" name="description" rows={4} placeholder="Describe what happened..." className="input-field resize-none" />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Location</label>
                  <div className="flex gap-1 p-1 bg-bg-primary rounded-btn mb-3">
                    <button type="button" onClick={() => { setLocationMode('my'); setFieldValue('lat', lat); setFieldValue('lng', lng); }}
                      className={`flex-1 py-2 rounded-btn text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        locationMode === 'my' ? 'bg-success/20 text-success' : 'text-text-secondary hover:text-text-primary'
                      }`}>
                      <MapPin className="w-3.5 h-3.5" /> My Location
                    </button>
                    <button type="button" onClick={() => setLocationMode('pick')}
                      className={`flex-1 py-2 rounded-btn text-xs font-medium transition-all ${
                        locationMode === 'pick' ? 'bg-accent-pink/20 text-accent-pink' : 'text-text-secondary hover:text-text-primary'
                      }`}>
                      Pick on Map
                    </button>
                  </div>
                  {locationMode === 'my' && address && (
                    <p className="text-xs text-text-secondary bg-bg-primary p-2 rounded-btn">{address}</p>
                  )}
                  {locationMode === 'pick' && (
                    <div className="h-64 rounded-card overflow-hidden border border-border">
                      <SafelleMap center={[lat || 28.6139, lng || 77.2090]} zoom={14}>
                        <MapPicker onSelect={(latlng) => {
                          setPickedLocation(latlng);
                          setFieldValue('lat', latlng.lat);
                          setFieldValue('lng', latlng.lng);
                        }} />
                        {pickedLocation && <Marker position={[pickedLocation.lat, pickedLocation.lng]} />}
                      </SafelleMap>
                    </div>
                  )}
                  {errors.lat && touched.lat && <p className="text-xs text-danger mt-1">Location is required</p>}
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Photo (optional)</label>
                  <label className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded-card bg-bg-primary cursor-pointer hover:border-accent-pink transition-colors">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-full object-contain rounded-card" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-text-secondary mb-2" />
                        <p className="text-xs text-text-secondary">Drag & drop or click to upload</p>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setPhotoPreview(URL.createObjectURL(file));
                    }} />
                  </label>
                </div>

                {/* Anonymous */}
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <Field type="checkbox" name="anonymous" className="rounded border-border text-accent-pink focus:ring-accent-pink bg-bg-primary" />
                  Submit anonymously
                </label>

                <Button type="submit" loading={mutation.isPending} className="w-full h-12">
                  Submit Report
                </Button>
              </Form>
            )}
          </Formik>
        </Card>
      </main>
    </div>
  );
}
