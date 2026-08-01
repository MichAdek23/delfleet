import React, { useState } from 'react';
import { X, Building2, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onRequestWithdrawal: (amount: number, bankDetails: { bank_name: string; account_number: string; account_name: string }) => Promise<void>;
}

export function WithdrawalModal({ isOpen, onClose, currentBalance, onRequestWithdrawal }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      return;
    }
    if (numAmount > currentBalance) {
      setErrorMsg('Withdrawal amount exceeds your current wallet balance.');
      return;
    }
    if (!bankName || !accountNumber || !accountName) {
      setErrorMsg('Please complete all company bank details.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await onRequestWithdrawal(numAmount, { bank_name: bankName, account_number: accountNumber, account_name: accountName });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process payout request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(7, 15, 30, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '24px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
      }}>
        <div style={{
          backgroundColor: '#0b192c',
          padding: '24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Wallet size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Request Company Payout</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Available: ₦{currentBalance.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: '#94a3b8', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#10b981' }}>
            <CheckCircle2 size={54} style={{ marginBottom: '16px' }} />
            <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Payout Request Submitted!</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Funds will be transferred directly to your bank account via Paystack.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {errorMsg && (
              <div style={{
                backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', marginBottom: '16px', border: '1px solid #fecaca',
              }}>
                {errorMsg}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Withdrawal Amount (₦) *
              </label>
              <input
                type="number"
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: '700' }}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Bank Name *
              </label>
              <input
                type="text"
                placeholder="e.g. GTBank / Access / Zenith"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Account Number *
              </label>
              <input
                type="text"
                placeholder="0123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Account Name *
              </label>
              <input
                type="text"
                placeholder="Company Reg Account Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Processing...' : 'Confirm Payout'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
