import { supabase } from '../lib/supabase';

export async function sendEmailOtp(email: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase.functions.invoke('send-email-otp', {
      body: { email: cleanEmail },
    });

    if (!error && data?.code) {
      sessionStorage.setItem(`deliva_otp_${cleanEmail}`, data.code);
      return data.code;
    }
  } catch (err) {
    console.warn('[send-email-otp] Edge Function notice:', err);
  }

  // Fallback to Supabase Auth OTP trigger
  await supabase.auth.signInWithOtp({ email: cleanEmail });
  const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
  sessionStorage.setItem(`deliva_otp_${cleanEmail}`, fallbackCode);
  return fallbackCode;
}

export async function verifyEmailOtpCode(email: string, inputCode: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const code = inputCode.trim();
  const storedCode = sessionStorage.getItem(`deliva_otp_${cleanEmail}`);

  if (storedCode && storedCode === code) {
    return true;
  }

  // Verify via Supabase Auth OTP
  const { error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: code,
    type: 'email',
  });

  return !error || error.message.includes('already');
}
