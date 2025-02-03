type buttonsType = 'button' | 'submit' | 'reset';

export const PrimaryButton = ({ onClick, children, disabled, className, type = 'button' as buttonsType }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-button ${className}`}
      style={{
        padding: '10px 20px',
        backgroundColor: disabled ? '#ccc' : '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
};
