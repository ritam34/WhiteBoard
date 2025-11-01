import { toast } from 'react-toastify';

export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

const defaultOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const notifySuccess = (message, options = {}) => {
  toast.success(message, { ...defaultOptions, ...options });
};

export const notifyError = (message, options = {}) => {
  toast.error(message, { ...defaultOptions, ...options });
};

export const notifyInfo = (message, options = {}) => {
  toast.info(message, { ...defaultOptions, ...options });
};

export const notifyWarning = (message, options = {}) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

export const notifyUserJoined = (userName) => {
  toast.info(`👋 ${userName} joined`, {
    position: 'bottom-right',
    autoClose: 2000,
    hideProgressBar: true,
  });
};

export const notifyUserLeft = (userName) => {
  toast.info(`👋 ${userName || 'A user'} left`, {
    position: 'bottom-right',
    autoClose: 2000,
    hideProgressBar: true,
  });
};

export const notifyConnectionStatus = (isConnected) => {
  if (isConnected) {
    toast.success('Connected to board', {
      position: 'top-right',
      autoClose: 2000,
    });
  } else {
    toast.warning('Disconnected from board', {
      position: 'top-right',
      autoClose: 3000,
    });
  }
};

export const notifyAction = (message) => {
  toast.info(message, {
    position: 'bottom-right',
    autoClose: 1500,
    hideProgressBar: true,
  });
};

export const dismissAll = () => {
  toast.dismiss();
};