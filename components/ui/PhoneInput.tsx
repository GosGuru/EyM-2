"use client";

import { forwardRef, useState } from "react";
import InputField from "./InputField";

interface PhoneInputProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ name, value, onChange, error }, ref) => {
    const [formattedValue, setFormattedValue] = useState(value || "");

    const formatPhone = (input: string): string => {
      // Remover todo lo que no sea dígito
      const digits = input.replace(/\D/g, "");
      
      // Formatear como: +598 XX XXX XXX (Uruguay)
      if (digits.length === 0) return "";
      
      if (digits.startsWith("598")) {
        const rest = digits.slice(3);
        if (rest.length <= 2) return `+598 ${rest}`;
        if (rest.length <= 5) return `+598 ${rest.slice(0, 2)} ${rest.slice(2)}`;
        return `+598 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 8)}`;
      }
      
      // Asumir prefijo local
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      setFormattedValue(formatted);
      onChange?.(formatted);
    };

    return (
      <InputField
        ref={ref}
        type="tel"
        name={name}
        label="Teléfono"
        placeholder="Ej: 099 123 456"
        value={formattedValue}
        onChange={handleChange}
        error={error}
        isOptional={true}
        helperText="Formato: XX XXX XXX o +598 XX XXX XXX"
        autoComplete="tel"
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
