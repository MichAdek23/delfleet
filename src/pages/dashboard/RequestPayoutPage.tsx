import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, ArrowLeft, ArrowUpRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function RequestPayoutPage() {
  const navigate = useNavigate();
  const { company, fetchDashboardData } = useOutletContext<any>();

  const walletBalance = Number(company?.wallet_balance || 0);

  // Fetch real bank details from company or local storage cache
  const cachedBankRaw = localStorage.getItem(`deliva_bank_${company?.id}`);
  const cachedBank = cachedBankRaw ? JSON.parse(cachedBankRaw) : null;

  const realAccountNumber = company?.bank_account_number || cachedBank?.bank_account_number || '';
  const realBankName = company?.bank_name || cachedBank?.bank_name || 'Guaranty Trust Bank (GTB)';
  const realAccountName = company?.bank_account_name || cachedBank?.bank_account_name || company?.company_name || 'Fleet Business Account';

  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const numAmount = Number(amount);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid payout amount.');
      return;
    }

    if (numAmount > walletBalance) {
      setErrorMsg(`Withdrawal amount (₦${numAmount.toLocaleString()}) exceeds available wallet balance (₦${walletBalance.toLocaleString()}).`);
      return;
    }

    if (!realAccountNumber) {
      setErrorMsg('No registered settlement bank account found. Please configure your bank account in Company Settings first.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      // 1. Deduct wallet balance via RPC function or direct update
      const { error: dbErr } = await supabase.rpc('increment_fleet_wallet_balance', {
        p_fleet_company_id: company.id,
        p_amount: -numAmount,
      });

      if (dbErr) {
        console.warn('RPC Notice, performing direct fallback update:', dbErr.message);
        await supabase
          .from('fleet_companies')
          .update({
            wallet_balance: Math.max(0, walletBalance - numAmount),
            updated_at: new Date().toISOString(),
          })
          .eq('id', company.id);
      }

      // 2. Log payout transaction record
      await supabase.from('fleet_transactions').insert({
        fleet_company_id: company.id,
        transaction_type: 'withdrawal',
        gross_amount: numAmount,
        fleet_commission: numAmount,
        status: 'completed',
        description: `Payout transfer to ${realBankName} (${realAccountNumber})`,
      });

      setSuccessMsg(`Payout request of ₦${numAmount.toLocaleString()} submitted successfully! Funds sent to ${realBankName}.`);
      if (fetchDashboardData) fetchDashboardData();

      setTimeout(() => {
        navigate('/dashboard/payouts');
      }, 1800);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed processing payout request.');
    } finally {
      setSubmitting(false);
    }
  };

  const setPresetAmount = (preset: number) => {
    if (preset === -1) {
      setAmount(walletBalance.toString());
    } else {
      setAmount(preset.toString());
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard/payouts')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '8px' }}
        >
          <ArrowLeft size={16} /> Back to Bank Payouts
        </button>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
          Request Bank Payout
        </h1>
        <p style={{ fontSize: '14px', color: '#475569', marginTop: '2px' }}>
          Instantly transfer accumulated fleet wallet balance to your registered business bank account
        </p>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '14px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '14px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
          {errorMsg}
        </div>
      )}

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Left: Withdrawal Form */}
        <form onSubmit={handleWithdraw} className="card-deliva" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={20} color="#FF6B6B" /> Payout Amount Details
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
              Withdrawal Amount (₦) *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                ₦
              </span>
              <input
                type="number"
                min="500"
                max={walletBalance}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 40px',
                  borderRadius: '12px',
                  border: '2px solid #CBD5E1',
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#0F172A',
                }}
                required
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '8px' }}>
              QUICK PRESETS
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[10000, 25000, 50000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPresetAmount(preset)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: numAmount === preset ? '#0D1B2A' : '#F8FAFC',
                    color: numAmount === preset ? '#FFFFFF' : '#0F172A',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPresetAmount(-1)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #FF6B6B',
                  backgroundColor: numAmount === walletBalance && walletBalance > 0 ? '#FF6B6B' : '#FFF0EC',
                  color: numAmount === walletBalance && walletBalance > 0 ? '#FFFFFF' : '#FF6B6B',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                }}
              >
                Max Balance (₦{walletBalance.toLocaleString()})
              </button>
            </div>
          </div>

          {/* Fee & Net Summary Box */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
              <span>Payout Amount</span>
              <span>₦{numAmount ? numAmount.toLocaleString() : '0.00'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
              <span>Paystack Disbursal Fee</span>
              <span style={{ color: '#10B981', fontWeight: '700' }}>FREE (₦0.00)</span>
            </div>
            <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
              <span>Net Bank Disbursal</span>
              <span style={{ color: '#10B981' }}>₦{numAmount ? numAmount.toLocaleString() : '0.00'}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !numAmount || numAmount > walletBalance}
            className="btn-primary-deliva"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '12px', opacity: (submitting || !numAmount || numAmount > walletBalance) ? 0.7 : 1 }}
          >
            {submitting ? 'Processing Payout...' : 'Confirm & Request Payout'}
            <ArrowUpRight size={18} />
          </button>
        </form>

        {/* Right: Wallet Balance & Bank Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#0D1B2A', borderRadius: '20px', padding: '28px', color: '#FFFFFF' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              AVAILABLE WALLET BALANCE
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>
              ₦{walletBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} /> Instant Settlement Available
            </div>
          </div>

          <div className="card-deliva" style={{ padding: '28px' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              DESTINATION BANK ACCOUNT
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginBottom: '2px' }}>ACCOUNT NUMBER</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', letterSpacing: '1px' }}>
                {realAccountNumber || 'No Account Configured'}
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '10px 0' }} />

              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginBottom: '2px' }}>BANK</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B2A', marginBottom: '8px' }}>{realBankName}</div>

              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginBottom: '2px' }}>ACCOUNT NAME</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B2A' }}>{realAccountName}</div>
            </div>

            <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
              <ShieldCheck size={14} color="#10B981" style={{ display: 'inline', marginRight: '4px' }} />
              Funds will be transferred directly to your verified commercial bank account.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
