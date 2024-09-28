export const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean
}> = ({ children, className, onClick, disabled }) => {
  return (
    <button
      className={`bg-fuel-green text-white px-4 py-2 rounded-md ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
