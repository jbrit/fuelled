export const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}> = ({ children, className, onClick, disabled, loading }) => {
  return (
    <button
      className={`bg-fuel-green text-white px-4 py-2 rounded-md ${className} ${loading ? "animate-pulse" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {!loading ? children : "loading..."}
    </button>
  );
};
