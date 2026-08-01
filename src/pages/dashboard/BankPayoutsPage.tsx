import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function BankPayoutsPage() {
  const navigate = useNavigate();
  const { company, transactions } = useOutletContext<any>();

  // Fetch real bank details from company or local storage cache
  const cachedBankRaw = localStorage.getItem(`deliva_bank_${company?.id}`);
  const cachedBank = cachedBankRaw ? JSON.parse(cachedBankRaw) : null;

  const realAccountNumber = company?.bank_account_number || cachedBank?.bank_account_number || 'NOT REGISTERED';
  const realBankName = company?.bank_name || cachedBank?.bank_name || 'Guaranty Trust Bank (GTB)';
  const realAccountName = company?.bank_account_name || cachedBank?.bank_account_name || company?.company_name || 'Fleet Business Account';

  const payoutsList = transactions.filter((t: any) => t.transaction_type === 'withdrawal' || t.transaction_type === 'payout');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            Bank Payouts & Wallet
          </h1>
          <p style={{ fontSize: '14px', color: '#475569', marginTop: '2px' }}>
            Withdraw accumulated company commissions to your registered business bank account
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/request-payout')}
          className="btn-primary-deliva"
          style={{ padding: '12px 24px', fontSize: '14px' }}
        >
          <CreditCard size={16} />
          Withdraw Funds Now
        </button>
      </div>

      {/* Wallet Balance & Real Bank Details Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        <div style={{
          backgroundColor: '#0D1B2A',
          borderRadius: '24px',
          padding: '32px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              AVAILABLE FLEET WALLET BALANCE
            </div>
            <div style={{ fontSize: '42px', fontWeight: '800', color: '#FFFFFF', marginBottom: '16px' }}>
              ₦{Number(company?.wallet_balance || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Ready for instant settlement via Paystack Payout Engine
            </div>
          </div>

          <div style={{ marginTop: '28px' }}>
            <button
              onClick={() => navigate('/dashboard/request-payout')}
              className="btn-primary-deliva"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Request Bank Payout
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        {/* Real Registered Bank Account Info Box */}
        <div className="card-deliva" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              REGISTERED SETTLEMENT BANK ACCOUNT
            </div>
            
            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginBottom: '4px' }}>ACCOUNT NUMBER</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '2px' }}>
                {realAccountNumber}
              </div>
              
              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '14px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>BANK NAME</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B2A' }}>
                    {realBankName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>ACCOUNT HOLDER NAME</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B2A' }}>
                    {realAccountName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
            🔒 <strong>Bank Verification:</strong> Settlements are disbursed automatically into verified business bank accounts matching your CAC RC name.
          </p>
        </div>

      </div>

      {/* Payout History Table */}
      <div className="card-deliva" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>
          Withdrawal & Payout History
        </h3>

        {payoutsList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
            No bank payouts requested yet. Accumulated commissions will appear here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px' }}>Amount Withdrawn</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutsList.map((tx: any) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {tx.description}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#EF4444' }}>
                      -₦{Number(tx.gross_amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        color: '#10B981',
                      }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
