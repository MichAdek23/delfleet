const PAYSTACK_SECRET = import.meta.env.VITE_PAYSTACK_SECRET_KEY || '';

export interface PaystackBank {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

// Fetch all Nigerian Banks from Paystack API
export async function fetchPaystackBanks(): Promise<PaystackBank[]> {
  try {
    const res = await fetch('https://api.paystack.co/bank?country=nigeria', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();
    if (json.status && Array.isArray(json.data)) {
      return json.data.map((b: any) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        active: b.active ?? true,
      }));
    }
  } catch (err) {
    console.warn('Paystack Bank List Fetch Error:', err);
  }

  // Fallback curated Nigerian bank list
  return [
    { id: 1, name: 'Guaranty Trust Bank (GTBank)', code: '058', active: true },
    { id: 2, name: 'Access Bank PLC', code: '044', active: true },
    { id: 3, name: 'First Bank of Nigeria', code: '011', active: true },
    { id: 4, name: 'Zenith Bank', code: '057', active: true },
    { id: 5, name: 'United Bank for Africa (UBA)', code: '033', active: true },
    { id: 6, name: 'Kuda Microfinance Bank', code: '50211', active: true },
    { id: 7, name: 'Moniepoint Microfinance Bank', code: '50515', active: true },
    { id: 8, name: 'OPay Digital Services', code: '999992', active: true },
    { id: 9, name: 'Palmpay', code: '999991', active: true },
    { id: 10, name: 'Stanbic IBTC Bank', code: '221', active: true },
  ];
}

// Resolve Account Number & Bank Code to verify Account Name via Paystack
export async function resolveBankAccount(accountNumber: string, bankCode: string): Promise<{ account_name: string; account_number: string } | null> {
  if (!accountNumber || accountNumber.length !== 10 || !bankCode) return null;

  try {
    const res = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber.trim()}&bank_code=${bankCode.trim()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();
    if (json.status && json.data?.account_name) {
      return {
        account_name: json.data.account_name,
        account_number: json.data.account_number,
      };
    }
  } catch (err) {
    console.warn('Paystack Account Resolution Error:', err);
  }

  return null;
}
