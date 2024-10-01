export const Textarea: React.FC<{
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  readOnly?: boolean;
}> = ({ value, onChange, placeholder, className, id, readOnly }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border-2 border-gray-700 placeholder:text-gray-600 text-gray-400 rounded-md px-4 py-2 bg-transparent outline-none ${className} h-[100px]`}
      id={id}
      readOnly={readOnly}
    ></textarea>
  );
};
