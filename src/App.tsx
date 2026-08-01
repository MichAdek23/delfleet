import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { CompanySignup } from './pages/CompanySignup';
import { CompanyLogin } from './pages/CompanyLogin';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { FleetDriversPage } from './pages/dashboard/FleetDriversPage';
import { AddDriverPage } from './pages/dashboard/AddDriverPage';
import { DriverDetailsPage } from './pages/dashboard/DriverDetailsPage';
import { CommissionSettingsPage } from './pages/dashboard/CommissionSettingsPage';
import { BankPayoutsPage } from './pages/dashboard/BankPayoutsPage';
import { RequestPayoutPage } from './pages/dashboard/RequestPayoutPage';
import { CompanySettingsPage } from './pages/dashboard/CompanySettingsPage';
import { AddDriverModal } from './components/AddDriverModal';
import { WithdrawalModal } from './components/WithdrawalModal';
import { FleetDriver } from './components/FleetMap';
import { supabase } from './lib/supabase';

function AppContent() {
  // Synchronously initialize currentCompany from localStorage to prevent redirect on reload
  const [currentCompany, setCurrentCompany] = useState<any>(() => {
    const saved = localStorage.getItem('deliva_fleet_company');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed parsing stored company session:', e);
      }
    }
    return null;
  });

  const [initializingSession, setInitializingSession] = useState(true);
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals State
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  const navigate = useNavigate();

  // Restore and verify active Supabase session on reload
  useEffect(() => {
    checkActiveAuthSession();
  }, []);

  const checkActiveAuthSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const cleanEmail = session.user.email.trim().toLowerCase();
        const { data: company } = await supabase
          .from('fleet_companies')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (company) {
          setCurrentCompany(company);
          localStorage.setItem('deliva_fleet_company', JSON.stringify(company));
        }
      }
    } catch (e) {
      console.error('Auth session check notice:', e);
    } finally {
      setInitializingSession(false);
    }
  };

  useEffect(() => {
    if (currentCompany?.id) {
      fetchDashboardData();
    }
  }, [currentCompany?.id]);

  const fetchDashboardData = async () => {
    if (!currentCompany?.id) return;
    try {
      setLoading(true);

      const { data: updatedComp } = await supabase
        .from('fleet_companies')
        .select('*')
        .eq('id', currentCompany.id)
        .maybeSingle();

      if (updatedComp) {
        setCurrentCompany(updatedComp);
        localStorage.setItem('deliva_fleet_company', JSON.stringify(updatedComp));
      }

      const { data: driverProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('fleet_id', currentCompany.id);

      if (driverProfiles) {
        const mappedDrivers: FleetDriver[] = driverProfiles.map((d) => ({
          id: d.id,
          name: `${d.first_name || 'Driver'} ${d.last_name || ''}`,
          phone: d.phone || 'N/A',
          status: d.is_online ? (d.on_delivery ? 'in_transit' : 'online') : 'offline',
          vehicle_type: d.vehicle_type || 'Motorcycle',
          vehicle_plate: d.vehicle_plate_number || d.license_number || 'REG-PENDING',
          current_lat: d.current_latitude ? Number(d.current_latitude) : 6.5244 + (Math.random() - 0.5) * 0.04,
          current_lng: d.current_longitude ? Number(d.current_longitude) : 3.3792 + (Math.random() - 0.5) * 0.04,
          total_deliveries_count: d.total_deliveries_count || 0,
        }));
        setDrivers(mappedDrivers);
      }

      const { data: txList } = await supabase
        .from('fleet_transactions')
        .select('*')
        .eq('fleet_company_id', currentCompany.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txList) setTransactions(txList);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (company: any) => {
    setCurrentCompany(company);
    localStorage.setItem('deliva_fleet_company', JSON.stringify(company));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setCurrentCompany(null);
    localStorage.removeItem('deliva_fleet_company');
    supabase.auth.signOut();
    navigate('/');
  };

  const handleSaveCommission = async (newPercentage: number) => {
    const { error } = await supabase
      .from('fleet_companies')
      .update({ commission_percentage: newPercentage })
      .eq('id', currentCompany.id);

    if (error) throw error;

    const updated = { ...currentCompany, commission_percentage: newPercentage };
    setCurrentCompany(updated);
    localStorage.setItem('deliva_fleet_company', JSON.stringify(updated));
  };

  const handleAddDriver = async (driverData: any) => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        first_name: driverData.first_name,
        last_name: driverData.last_name,
        email: driverData.email,
        phone: driverData.phone,
        role: 'driver',
        fleet_id: currentCompany.id,
        is_fleet_driver: true,
        vehicle_type: driverData.vehicle_type,
        vehicle_plate_number: driverData.vehicle_plate,
        is_verified: true,
      });

    if (error) throw error;
    await fetchDashboardData();
  };

  const handleRequestWithdrawal = async (amount: number, bankDetails: any) => {
    const { error: dbErr } = await supabase.rpc('increment_fleet_wallet_balance', {
      p_fleet_company_id: currentCompany.id,
      p_amount: -amount,
    });

    if (dbErr) throw dbErr;

    await supabase.from('fleet_transactions').insert({
      fleet_company_id: currentCompany.id,
      transaction_type: 'withdrawal',
      gross_amount: amount,
      fleet_commission: amount,
      status: 'completed',
      description: `Payout transfer to ${bankDetails.bank_name} (${bankDetails.account_number})`,
    });

    await fetchDashboardData();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      
      <Routes>
        {/* Public Routes with Navbar */}
        <Route
          path="/"
          element={
            <>
              <Navbar
                currentTab="landing"
                onNavigate={(tab) => navigate(tab === 'landing' ? '/' : `/${tab}`)}
                companyName={currentCompany?.company_name}
                onLogout={handleLogout}
              />
              <LandingPage onNavigate={(tab) => navigate(tab === 'landing' ? '/' : `/${tab}`)} />
            </>
          }
        />

        <Route
          path="/signup"
          element={
            <CompanySignup
              onSignupSuccess={handleLoginSuccess}
            />
          }
        />

        <Route
          path="/login"
          element={
            <CompanyLogin />
          }
        />

        <Route
          path="/verify-otp"
          element={
            <VerifyOtpPage
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        {/* Protected Dashboard Layout with Sub-Routes */}
        <Route
          path="/dashboard"
          element={
            initializingSession ? (
              <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', color: '#0F172A', fontWeight: '700' }}>
                Loading Deliva Fleet Session...
              </div>
            ) : currentCompany ? (
              <DashboardLayout
                company={currentCompany}
                drivers={drivers}
                transactions={transactions}
                onLogout={handleLogout}
                loading={loading}
                onRefresh={fetchDashboardData}
                setIsAddDriverOpen={setIsAddDriverOpen}
                setIsWithdrawalOpen={setIsWithdrawalOpen}
                handleSaveCommission={handleSaveCommission}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route
            index
            element={<DashboardOverview />}
          />
          <Route
            path="drivers"
            element={<FleetDriversPage />}
          />
          <Route
            path="drivers/:driverId"
            element={<DriverDetailsPage />}
          />
          <Route
            path="add-driver"
            element={<AddDriverPage />}
          />
          <Route
            path="commissions"
            element={<CommissionSettingsPage />}
          />
          <Route
            path="payouts"
            element={<BankPayoutsPage />}
          />
          <Route
            path="request-payout"
            element={<RequestPayoutPage />}
          />
          <Route
            path="settings"
            element={<CompanySettingsPage />}
          />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals */}
      <AddDriverModal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        onAddDriver={handleAddDriver}
      />

      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        currentBalance={currentCompany?.wallet_balance || 0}
        onRequestWithdrawal={handleRequestWithdrawal}
      />

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
