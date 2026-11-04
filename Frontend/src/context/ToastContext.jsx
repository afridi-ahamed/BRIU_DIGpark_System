import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let _id = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const safeDuration = Number.isFinite(Number(duration)) ? Number(duration) : 3000;
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type, duration: safeDuration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Convenience helpers
  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
    entry:   (msg, dur) => addToast(msg, 'entry', dur),
    exit:    (msg, dur) => addToast(msg, 'exit', dur),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
