import React, { useState } from 'react';
import { Percent, Shield, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CommissionControlProps {
  currentCommission: number;
  delivaCommission?: number;
  onSaveCommission: (newPercentage: number) => Promise<void>;
}

export function CommissionControl({
  currentCommission,
  delivaCommission = 10,
  onSaveCommission,
}: CommissionControlProps) {
  const [commission, setCommission] = useState(currentCommission);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleFare = 10000; // ₦10,000 sample delivery trip
  const delivaShare = (sampleFare * delivaCommission) / 100;
  const companyShare = (sampleFare * commission) / 100;
  const driverShare = sampleFare - delivaShare - companyShare;

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSaveCommission(commission);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '28px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            Fleet Commission Percentage
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Set the commission percentage your company collects from your drivers' gross earnings.
          </p>
        </div>
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '8px 16px',
          borderRadius: '12px',
          color: '#204b7a',
          fontWeight: '800',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span>{commission}%</span>
        </div>
      </div>

      {/* Slider Control */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="range"
          min="0"
          max="40"
          step="1"
          value={commission}
          onChange={(e) => setCommission(Number(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            accentColor: '#204b7a',
            cursor: 'pointer',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>
          <span>0% (No company fee)</span>
          <span>15% (Recommended)</span>
          <span>40% (Max company fee)</span>
        </div>
      </div>

      {/* Live Split Calculator Card */}
      <div style={{
        backgroundColor: '#0b192c',
        borderRadius: '16px',
        padding: '20px',
        color: '#ffffff',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '12px', color: '#f4a23a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          💡 Live Breakdown per ₦10,000 Trip
        </div>

        <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Deliva Platform ({delivaCommission}%)</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
              ₦{delivaShare.toLocaleString()}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(244, 162, 58, 0.15)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(244, 162, 58, 0.3)' }}>
            <div style={{ fontSize: '11px', color: '#f4a23a', fontWeight: '600' }}>Company Share ({commission}%)</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#f4a23a', marginTop: '4px' }}>
              ₦{companyShare.toLocaleString()}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: '600' }}>Driver Take-Home</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
              ₦{driverShare.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-stack" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {savedSuccess ? (
          <span style={{ color: '#10b981', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={18} /> Commission percentage updated!
          </span>
        ) : <span />}

        <button
          onClick={handleSave}
          disabled={saving || commission === currentCommission}
          className="btn-primary-deliva"
          style={{
            opacity: commission === currentCommission ? 0.6 : 1,
            cursor: commission === currentCommission ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Updating...' : 'Save Commission Setting'}
        </button>
      </div>
    </div>
  );
}
