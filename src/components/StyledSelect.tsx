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
};

const baseStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  background: 'rgba(17,17,17,0.9)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 10,
  color: '#fff',
};

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
}) => {
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
        <option value="" disabled style={{ background: '#111', color: '#bbb' }}>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ background: '#111', color: '#fff' }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default StyledSelect;
