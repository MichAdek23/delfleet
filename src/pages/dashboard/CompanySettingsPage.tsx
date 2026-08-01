import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Building2, Save, CheckCircle2, ShieldCheck, CreditCard, Lock, Percent, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchPaystackBanks, resolveBankAccount, PaystackBank } from '../../services/paystackBankService';

export function CompanySettingsPage() {
  const { company, fetchDashboardData } = useOutletContext<any>();

  // Lock status check for CAC verification
  const isVerified = company?.is_verified !== false;

  // Profile Details
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tinNumber, setTinNumber] = useState('');

  // Paystack Banks & Account Resolution
  const [banksList, setBanksList] = useState<PaystackBank[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState('058'); // Default GTBank
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [accountResolved, setAccountResolved] = useState(false);

  // 14-Day Bank Account Lock Calculation from Backend Database & Local Cache
  const cachedBankRaw = localStorage.getItem(`deliva_bank_${company?.id}`);
  const cachedBank = cachedBankRaw ? JSON.parse(cachedBankRaw) : null;

  const bankUpdatedAt = company?.bank_details_updated_at || cachedBank?.bank_details_updated_at || company?.updated_at;
  const bankUpdatedTime = bankUpdatedAt ? new Date(bankUpdatedAt).getTime() : 0;
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
  const unlockTime = bankUpdatedTime + FOURTEEN_DAYS_MS;
  const currentAccNum = company?.bank_account_number || cachedBank?.bank_account_number || accountNumber;
  const isBankLocked = bankUpdatedTime > 0 && Date.now() < unlockTime && Boolean(currentAccNum);
  const unlockDateString = new Date(unlockTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const daysRemaining = Math.ceil((unlockTime - Date.now()) / (1000 * 60 * 60 * 24));

  // Commission Rates
  const [commissionRate, setCommissionRate] = useState(15);

  // Security Passwords
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const bankDropdownRef = useRef<HTMLDivElement>(null);

  // Close bank dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setIsBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Banks List from Paystack API
  useEffect(() => {
    loadPaystackBanks();
  }, []);

  const loadPaystackBanks = async () => {
    const list = await fetchPaystackBanks();
    setBanksList(list);
    
    const initialBank = list.find((b) => b.code === selectedBankCode);
    if (initialBank) {
      setBankSearchQuery(initialBank.name);
    }
  };

  useEffect(() => {
    if (company) {
      const cachedRaw = localStorage.getItem(`deliva_bank_${company.id}`);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;

      setCompanyName(company.company_name || '');
      setContactName(company.contact_name || '');
      setRegistrationNumber(company.registration_number || 'RC-1849204');
      setEmail(company.email || '');
      setPhone(company.phone || '');
      setTinNumber(company.tin_number || 'TIN-98201948');
      
      setAccountNumber(company.bank_account_number || cached?.bank_account_number || '');
      setAccountName(company.bank_account_name || cached?.bank_account_name || company.company_name || '');
      setCommissionRate(company.commission_percentage || 15);
      
      const bCode = company.bank_code || cached?.bank_code || '058';
      setSelectedBankCode(bCode);
      const bName = company.bank_name || cached?.bank_name;
      if (bName) {
        setBankSearchQuery(bName);
      } else {
        const match = banksList.find((b) => b.code === bCode);
        if (match) setBankSearchQuery(match.name);
      }
    }
  }, [company, banksList]);

  // Automatically Resolve Account Name when 10 digits entered & bank selected
  useEffect(() => {
    const cleanAccount = accountNumber.trim();
    if (cleanAccount.length === 10 && selectedBankCode && !isBankLocked) {
      autoResolveAccount(cleanAccount, selectedBankCode);
    } else {
      setAccountResolved(false);
    }
  }, [accountNumber, selectedBankCode, isBankLocked]);

  const autoResolveAccount = async (accNum: string, bCode: string) => {
    try {
      setResolvingAccount(true);
      const res = await resolveBankAccount(accNum, bCode);
      if (res && res.account_name) {
        setAccountName(res.account_name);
        setAccountResolved(true);
      } else {
        setAccountResolved(false);
      }
    } catch (err) {
      console.warn('Auto resolve notice:', err);
    } finally {
      setResolvingAccount(false);
    }
  };

  // Save Company CAC Details
  const handleSaveCompanyDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      if (company?.id) {
        const { error } = await supabase
          .from('fleet_companies')
          .update({
            company_name: companyName,
            contact_name: contactName,
            registration_number: registrationNumber,
            email: email,
            phone: phone,
            commission_percentage: Number(commissionRate),
            updated_at: new Date().toISOString(),
          })
          .eq('id', company.id);

        if (error) throw error;
      }

      setSuccessMsg('Company details saved successfully to database!');
      if (fetchDashboardData) fetchDashboardData();

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed updating company details.');
    } finally {
      setSaving(false);
    }
  };

  // Save Bank Account & Lock for 14 Days
  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBankLocked) {
      setErrorMsg(`Bank account details are locked for 14 days until ${unlockDateString}.`);
      return;
    }

    if (!accountNumber || accountNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit bank account number.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const nowIso = new Date().toISOString();
      const cleanAccNum = accountNumber.trim();
      const cleanAccName = accountName.trim();
      const cleanBankName = bankSearchQuery.trim();

      if (company?.id) {
        // Direct database update on fleet_companies table
        const { error: dbError } = await supabase
          .from('fleet_companies')
          .update({
            bank_account_number: cleanAccNum,
            bank_account_name: cleanAccName,
            updated_at: nowIso,
          })
          .eq('id', company.id);

        if (dbError) {
          console.error('DB Update Error:', dbError.message);
        }

        // Cache locally for instant reactivity across pages
        const savedBankObj = {
          bank_account_number: cleanAccNum,
          bank_account_name: cleanAccName,
          bank_name: cleanBankName,
          bank_code: selectedBankCode,
          bank_details_updated_at: nowIso,
        };
        localStorage.setItem(`deliva_bank_${company.id}`, JSON.stringify(savedBankObj));

        // Update context company object directly
        company.bank_account_number = cleanAccNum;
        company.bank_account_name = cleanAccName;
        company.bank_name = cleanBankName;
        company.bank_code = selectedBankCode;
        company.bank_details_updated_at = nowIso;
      }

      setSuccessMsg(`Bank account details saved & locked for 14 days until ${new Date(Date.now() + FOURTEEN_DAYS_MS).toLocaleDateString()}.`);
      if (fetchDashboardData) fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed saving bank details.');
    } finally {
      setSaving(false);
    }
  };

  // Password Security Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setSuccessMsg('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed updating password.');
    } finally {
      setSaving(false);
    }
  };

  const filteredBanks = banksList.filter((b) =>
    b.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
          Company Settings & Operations
        </h1>
        <p style={{ fontSize: '14px', color: '#475569', marginTop: '2px' }}>
          Manage your CAC business details, bank settlement accounts, commission rates, and 2FA security.
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

      {/* Section 1: Business Identity & CAC Details */}
      <form onSubmit={handleSaveCompanyDetails} className="card-deliva" style={{ padding: '32px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="#FF6B6B" /> 1. Business Identity & CAC Registration
          </h3>

          {isVerified && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#166534',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
            }}>
              <ShieldCheck size={16} color="#16A34A" /> CAC Verified Account
            </div>
          )}
        </div>

        <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Company Legal Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isVerified}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                backgroundColor: isVerified ? '#F8FAFC' : '#FFFFFF',
                color: isVerified ? '#64748B' : '#0F172A',
                cursor: isVerified ? 'not-allowed' : 'text',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              CAC Registration Number (RC) *
            </label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              disabled={isVerified}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                backgroundColor: isVerified ? '#F8FAFC' : '#FFFFFF',
                color: isVerified ? '#64748B' : '#0F172A',
                cursor: isVerified ? 'not-allowed' : 'text',
              }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Primary Contact Person *
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              disabled={isVerified}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                backgroundColor: isVerified ? '#F8FAFC' : '#FFFFFF',
                color: isVerified ? '#64748B' : '#0F172A',
                cursor: isVerified ? 'not-allowed' : 'text',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Business Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isVerified}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                backgroundColor: isVerified ? '#F8FAFC' : '#FFFFFF',
                color: isVerified ? '#64748B' : '#0F172A',
                cursor: isVerified ? 'not-allowed' : 'text',
              }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isVerified}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                backgroundColor: isVerified ? '#F8FAFC' : '#FFFFFF',
                color: isVerified ? '#64748B' : '#0F172A',
                cursor: isVerified ? 'not-allowed' : 'text',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Tax Identification Number (TIN)
            </label>
            <input
              type="text"
              value={tinNumber}
              onChange={(e) => setTinNumber(e.target.value)}
              disabled={isVerified}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                backgroundColor: isVerified ? '#F8FAFC' : '#FFFFFF',
                color: isVerified ? '#64748B' : '#0F172A',
                cursor: isVerified ? 'not-allowed' : 'text',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary-deliva"
          style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '10px', opacity: saving ? 0.7 : 1 }}
        >
          <Save size={16} /> Save Company Details
        </button>
      </form>

      {/* Section 2: Bank Settlement & Paystack Disbursal */}
      <form onSubmit={handleSaveBankDetails} className="card-deliva" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CreditCard size={20} color="#FF6B6B" /> 2. Bank Settlement & Paystack Disbursal
        </h3>

        {/* 14-Day Security Warning Box */}
        {isBankLocked ? (
          <div style={{
            backgroundColor: '#FEFCE8',
            border: '1px solid #FEF08A',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            fontSize: '13px',
            color: '#854D0E',
            fontWeight: '600',
            lineHeight: 1.5,
          }}>
            <AlertTriangle size={22} color="#CA8A04" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#713F12', marginBottom: '4px' }}>
                🔒 Bank Settlement Account Locked (14-Day Cooldown)
              </div>
              <div>
                Your bank settlement details were updated on <strong>{new Date(bankUpdatedAt).toLocaleDateString()}</strong>. For fraud prevention and banking compliance, settlement account details are locked for 14 days and cannot be modified until <strong>{unlockDateString}</strong> ({daysRemaining} days remaining).
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '12px',
            color: '#64748B',
            fontWeight: '600',
          }}>
            ⚠️ <strong>Notice:</strong> Saving new bank details will lock bank account modifications for 14 days for security compliance.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          
          {/* Searchable Bank Input Dropdown */}
          <div ref={bankDropdownRef} style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Bank *
            </label>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Type to search bank (e.g. GTB, Kuda, Zenith)..."
                value={bankSearchQuery}
                onChange={(e) => {
                  setBankSearchQuery(e.target.value);
                  setIsBankDropdownOpen(true);
                }}
                onFocus={() => !isBankLocked && setIsBankDropdownOpen(true)}
                disabled={isBankLocked}
                style={{
                  width: '100%',
                  padding: '12px 36px 12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  color: isBankLocked ? '#64748B' : '#0F172A',
                  backgroundColor: isBankLocked ? '#F8FAFC' : '#FFFFFF',
                  cursor: isBankLocked ? 'not-allowed' : 'text',
                }}
                required
              />
              <ChevronDown
                size={18}
                color="#64748B"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Dropdown Options List */}
            {!isBankLocked && isBankDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                maxHeight: '220px',
                overflowY: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                zIndex: 100,
              }}>
                {filteredBanks.length === 0 ? (
                  <div style={{ padding: '12px 16px', fontSize: '13px', color: '#94A3B8' }}>
                    No matching banks found
                  </div>
                ) : (
                  filteredBanks.map((b) => (
                    <div
                      key={b.code}
                      onClick={() => {
                        setSelectedBankCode(b.code);
                        setBankSearchQuery(b.name);
                        setIsBankDropdownOpen(false);
                      }}
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: selectedBankCode === b.code ? '#FF6B6B' : '#0F172A',
                        backgroundColor: selectedBankCode === b.code ? '#FFF0EC' : '#FFFFFF',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F1F5F9',
                      }}
                    >
                      {b.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Account Number (10 Digits) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                maxLength={10}
                placeholder="0123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                disabled={isBankLocked}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  backgroundColor: isBankLocked ? '#F8FAFC' : '#FFFFFF',
                  color: isBankLocked ? '#64748B' : '#0F172A',
                  cursor: isBankLocked ? 'not-allowed' : 'text',
                }}
                required
              />
              {resolvingAccount && (
                <RefreshCw size={16} color="#FF6B6B" className="animate-spin" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
              Account Holder Name
            </label>
            {accountResolved && (
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Paystack Verified
              </span>
            )}
          </div>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            disabled={isBankLocked}
            placeholder={resolvingAccount ? 'Resolving account name via Paystack...' : 'Account Name'}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: accountResolved ? '2px solid #10B981' : '1px solid #CBD5E1',
              fontSize: '14px',
              fontWeight: '700',
              color: isBankLocked ? '#64748B' : '#0F172A',
              backgroundColor: isBankLocked ? '#F8FAFC' : (accountResolved ? '#ECFDF5' : '#FFFFFF'),
              cursor: isBankLocked ? 'not-allowed' : 'text',
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving || isBankLocked}
          className="btn-primary-deliva"
          style={{
            padding: '12px 28px',
            fontSize: '14px',
            borderRadius: '10px',
            opacity: (saving || isBankLocked) ? 0.6 : 1,
            cursor: isBankLocked ? 'not-allowed' : 'pointer',
          }}
        >
          {isBankLocked ? <Lock size={16} /> : <Save size={16} />}
          {isBankLocked ? `Locked Until ${unlockDateString}` : (saving ? 'Saving Bank Details...' : 'Save Bank Account')}
        </button>
      </form>

      {/* Section 3: Fleet Commission Preferences */}
      <div className="card-deliva" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Percent size={20} color="#FF6B6B" /> 3. Fleet Fare Split & Commission Settings
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Fleet Commission Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '16px', fontWeight: '800', color: '#FF6B6B' }}
            />
            <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              The percentage fee automatically deducted for your company on every completed fare.
            </span>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
              3-Way Fare Breakdown Example
            </div>
            <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: '600', lineHeight: 1.6 }}>
              ● Fleet Company: <strong>{commissionRate}%</strong><br />
              ● Deliva Platform: <strong>10%</strong><br />
              ● Driver Take-Home: <strong>{100 - commissionRate - 10}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Security & Password Update */}
      <form onSubmit={handleUpdatePassword} className="card-deliva" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lock size={20} color="#FF6B6B" /> 4. Security & Password Change
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !newPassword}
          className="btn-primary-deliva"
          style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '10px', opacity: (saving || !newPassword) ? 0.7 : 1 }}
        >
          <ShieldCheck size={16} /> Update Password
        </button>
      </form>

    </div>
  );
}
