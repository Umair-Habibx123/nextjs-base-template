// hooks/useSessionRedirect.js
"use client";

import { useEffect, useState } from 'react';

export const useSessionRedirect = () => {
  const [returnTo, setReturnTo] = useState(null);

  // Set return URL in session storage
  const setRedirectUrl = (url) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_redirect_url', url);
    }
  };

  // Get return URL from session storage
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('auth_redirect_url');
    }
    return null;
  };

  // Clear return URL from session storage
  const clearRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_redirect_url');
    }
  };

  // Initialize returnTo from session storage on component mount
  useEffect(() => {
    const storedUrl = getRedirectUrl();
    if (storedUrl) {
      setReturnTo(storedUrl);
    }
  }, []);

  return {
    returnTo,
    setRedirectUrl,
    getRedirectUrl,
    clearRedirectUrl
  };
};