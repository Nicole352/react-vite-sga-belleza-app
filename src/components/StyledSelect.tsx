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
  padding: '12px',
  background: darkMode ? 'rgba(17,17,17,0.9)' : 'rgba(255,255,255,0.9)',
  border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)',
  borderRadius: 10,
  color: darkMode ? '#fff' : '#1e293b',
  fontSize: '14px',
  fontFamily: 'inherit'
});

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
            background: darkMode ? '#111' : '#f8f9fa', 
            color: darkMode ? '#bbb' : '#6b7280' 
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
            background: darkMode ? '#111' : '#fff', 
            color: darkMode ? '#fff' : '#1e293b',
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
