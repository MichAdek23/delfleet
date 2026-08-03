import React, { useRef, useEffect } from 'react';

interface Nin11InputProps {
  value: string;
  onChange: (nin: string) => void;
  disabled?: boolean;
}

export function Nin11Input({ value, onChange, disabled = false }: Nin11InputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of 11 digits
  const digits = Array.from({ length: 11 }, (_, i) => value[i] || '');

  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = char;
    const newNin = newDigits.join('');
    onChange(newNin);

    if (char && index < 10 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 11);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, 10);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', margin: '16px 0' }}>
      {Array.from({ length: 11 }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[index]}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            style={{
              width: '40px',
              height: '50px',
              borderRadius: '10px',
              border: isFilled ? '2px solid #204b7a' : '1.5px solid #CBD5E1',
              backgroundColor: disabled ? '#F1F5F9' : isFilled ? 'rgba(32, 75, 122, 0.06)' : '#FFFFFF',
              fontSize: '20px',
              fontWeight: '800',
              color: '#204b7a',
              textAlign: 'center',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxShadow: isFilled ? '0 2px 8px rgba(32, 75, 122, 0.15)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
