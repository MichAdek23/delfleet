import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Percent, ShieldCheck, Zap } from 'lucide-react';
import { CommissionControl } from '../../components/CommissionControl';

export function CommissionSettingsPage() {
  const { company, handleSaveCommission } = useOutletContext<any>();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
          Commission Rate Settings
        </h1>
        <p style={{ fontSize: '14px', color: '#475569', marginTop: '2px' }}>
          Configure the percentage commission your company collects from fleet driver earnings
        </p>
      </div>

      <CommissionControl
        currentCommission={company?.commission_percentage || 15}
        delivaCommission={company?.deliva_commission_percentage || 10}
        onSaveCommission={handleSaveCommission}
      />
    </div>
  );
}
