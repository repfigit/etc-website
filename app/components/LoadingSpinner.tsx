export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3em 1em',
      minHeight: '200px'
    }}>
      <div
        className="loading-spinner"
        style={{
          width: '50px',
          height: '50px',
          border: '4px solid #1a1a1a',
          borderTop: '4px solid #4ecdc4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <p style={{ marginTop: '1em', color: '#4ecdc4' }}>{message}</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
