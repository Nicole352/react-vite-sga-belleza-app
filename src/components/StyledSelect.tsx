import React from 'react';

export type Option = { value: string | number; label: string };

type StyledSelectProps = {
  name: string;
  options: Option[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  darkMode?: boolean;
};

const getBaseStyle = (darkMode: boolean = true): React.CSSProperties => ({
  width: '100%',
  padding: '7px 10px',
  background: 'var(--admin-input-bg, rgba(255,255,255,0.06))',
  border: '1px solid var(--admin-border, rgba(255,255,255,0.12))',
  borderRadius: 6,
  color: 'var(--admin-text-primary, #fff)',
  fontSize: '0.8rem',
  fontFamily: 'inherit',
  colorScheme: darkMode ? 'dark' : 'light',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none'
} as React.CSSProperties);

export const StyledSelect: React.FC<StyledSelectProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  required,
  disabled,
  placeholder,
  style,
  darkMode = true,
}) => {
  const baseStyle = getBaseStyle(darkMode);
  
  return (
    <select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      required={required}
      disabled={disabled}
      style={{ ...baseStyle, ...style }}
    >
      {placeholder !== undefined && (
        <option 
          value="" 
          disabled 
          style={{ 
            background: 'var(--admin-card-bg, rgba(0,0,0,0.9))', 
            color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))' 
          }}
        >
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option 
          key={opt.value} 
          value={opt.value} 
          style={{ 
            background: 'var(--admin-card-bg, rgba(0,0,0,0.9))', 
            color: 'var(--admin-text-primary, #fff)',
            padding: '8px'
          }}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default StyledSelect;
