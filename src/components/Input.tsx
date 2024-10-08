export const Input: React.FC<{
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  id?: string;
  readOnly?: boolean;
  accept?: string;
}> = ({
  value,
  onChange,
  placeholder,
  type,
  className,
  id,
  readOnly,
  accept,
}) => {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={`border-2 border-gray-700 placeholder:text-gray-600 text-gray-400 rounded-md px-4 py-2 bg-transparent outline-none ${className}`}
      id={id}
      readOnly={readOnly}
      accept={accept}
    />
  );
};
