interface ErrorFallbackProps {
  title?: string;
  message?: string;
  retry?: () => void;
  className?: string;
}

export const ErrorFallback = ({ 
  title = "Oops, algo salió mal", 
  message = "No pudimos cargar este contenido. Por favor, inténtalo más tarde.",
  retry,
  className = ""
}: ErrorFallbackProps) => {
  return (
    <div className={`py-16 px-4 text-center ${className}`}>
      <div className="container mx-auto max-w-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <svg 
            className="w-12 h-12 text-red-400 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
          <p className="text-red-600 mb-4">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Intentar nuevamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
