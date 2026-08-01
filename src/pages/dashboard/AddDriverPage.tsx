import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Truck, ShieldCheck, ArrowLeft, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DRAFT_KEY = 'deliva_draft_driver_form';

export function AddDriverPage() {
  const navigate = useNavigate();
  const { company, fetchDashboardData } = useOutletContext<any>();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [ninNumber, setNinNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Restore draft from localStorage upon reload
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.firstName) setFirstName(draft.firstName);
        if (draft.lastName) setLastName(draft.lastName);
        if (draft.email) setEmail(draft.email);
        if (draft.phone) setPhone(draft.phone);
        if (draft.address) setAddress(draft.address);
        if (draft.vehicleType) setVehicleType(draft.vehicleType);
        if (draft.vehicleMake) setVehicleMake(draft.vehicleMake);
        if (draft.vehiclePlate) setVehiclePlate(draft.vehiclePlate);
        if (draft.vehicleColor) setVehicleColor(draft.vehicleColor);
        if (draft.licenseNumber) setLicenseNumber(draft.licenseNumber);
        if (draft.ninNumber) setNinNumber(draft.ninNumber);
        if (draft.emergencyName) setEmergencyName(draft.emergencyName);
        if (draft.emergencyPhone) setEmergencyPhone(draft.emergencyPhone);
      } catch (e) {
        console.error('Failed restoring driver form draft:', e);
      }
    }
  }, []);

  // Auto-save form draft as user types
  useEffect(() => {
    const draft = {
      firstName,
      lastName,
      email,
      phone,
      address,
      vehicleType,
      vehicleMake,
      vehiclePlate,
      vehicleColor,
      licenseNumber,
      ninNumber,
      emergencyName,
      emergencyPhone,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [firstName, lastName, email, phone, address, vehicleType, vehicleMake, vehiclePlate, vehicleColor, licenseNumber, ninNumber, emergencyName, emergencyPhone]);

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !vehiclePlate) {
      setErrorMsg('Please fill in all required driver details.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const cleanEmail = email ? email.trim().toLowerCase() : `driver_${Date.now()}@delivaglobe.com`;

      const { data: newDriver, error } = await supabase
        .from('profiles')
        .insert({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          address: address.trim(),
          role: 'driver',
          fleet_id: company.id,
          is_fleet_driver: true,
          vehicle_type: vehicleType,
          vehicle_plate_number: vehiclePlate.trim().toUpperCase(),
          license_number: licenseNumber.trim(),
          is_verified: true,
          is_online: false,
          total_deliveries_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Clear draft storage
      localStorage.removeItem(DRAFT_KEY);

      setSuccessMsg(`Driver ${firstName} ${lastName} successfully registered into your fleet!`);
      await fetchDashboardData();

      setTimeout(() => {
        navigate('/dashboard/drivers');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed registering driver. Please check inputs.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setVehicleType('Motorcycle');
    setVehicleMake('');
    setVehiclePlate('');
    setVehicleColor('');
    setLicenseNumber('');
    setNinNumber('');
    setEmergencyName('');
    setEmergencyPhone('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button
            onClick={() => navigate('/dashboard/drivers')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Drivers Roster
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            Register New Fleet Driver
          </h1>
          <p style={{ fontSize: '14px', color: '#475569', marginTop: '2px' }}>
            Add a driver to your fleet company database. Draft entries auto-save as you type.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearDraft}
          style={{ background: 'none', border: '1px solid #CBD5E1', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}
        >
          Clear Draft
        </button>
      </div>

      {/* Main Registration Form */}
      <div className="card-deliva" style={{ padding: '36px' }}>
        
        {successMsg && (
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegisterDriver}>
          
          {/* Section 1: Personal Details */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0D1B2A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#FF6B6B" /> 1. Driver Personal Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Samuel"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adebayo"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+234 801 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="driver@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Residential Address
              </label>
              <input
                type="text"
                placeholder="Street address, City, Lagos State"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Section 2: Vehicle Details */}
          <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0D1B2A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="#FF6B6B" /> 2. Vehicle Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Vehicle Category *
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Motorcycle">Motorcycle (Dispatch Bike)</option>
                  <option value="Tricycle">Tricycle (Keke Napep)</option>
                  <option value="Car">Sedan / Hatchback Car</option>
                  <option value="Mini Van">Mini Delivery Van</option>
                  <option value="Truck">Heavy Duty Truck</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Vehicle Plate Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. KSF-849-XY"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', textTransform: 'uppercase' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Make & Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bajaj Boxer 150 / Honda Civic"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Vehicle Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. Black / Red"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Licensing & Verification */}
          <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0D1B2A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#FF6B6B" /> 3. Verification & Emergency Contact
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Driver's License Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DL-98302194"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  NIN National ID Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 78201948501"
                  value={ninNumber}
                  onChange={(e) => setNinNumber(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Next of Kin / Emergency Contact Name
                </label>
                <input
                  type="text"
                  placeholder="Contact Person Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Emergency Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+234..."
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
              💾 Draft saved locally in browser cache
            </span>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard/drivers')}
                className="btn-secondary-deliva"
                style={{ padding: '12px 24px', fontSize: '14px' }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary-deliva"
                style={{ padding: '12px 32px', fontSize: '14px', opacity: saving ? 0.7 : 1 }}
              >
                <Save size={16} />
                {saving ? 'Saving Driver...' : 'Register Driver'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
