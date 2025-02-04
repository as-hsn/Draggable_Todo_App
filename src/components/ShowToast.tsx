import { toast, Id, ToastOptions } from 'react-toastify';

// Define the props for the ShowToast function
interface ShowToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning'; // Remove 'default' since it's not a valid toast type
}

// Track the ID of the active toast
let activeToastId: Id | null = null;

function ShowToast({ message, type }: ShowToastProps): null {
  // Check if a toast is currently active to prevent duplicates
  if (activeToastId === null || !toast.isActive(activeToastId)) {
    const toastOptions: ToastOptions = {
      autoClose: 2000,
      draggable: true,
    };

    // Use a switch-case or conditional logic to call the correct toast function
    switch (type) {
      case 'success':
        activeToastId = toast.success(message, toastOptions);
        break;
      case 'error':
        activeToastId = toast.error(message, toastOptions);
        break;
      case 'info':
        activeToastId = toast.info(message, toastOptions);
        break;
      case 'warning':
        activeToastId = toast.warning(message, toastOptions);
        break;
      default:
        activeToastId = toast(message, toastOptions); // Default toast
        break;
    }
  }

  // This function does not return JSX
  return null;
}

export default ShowToast;