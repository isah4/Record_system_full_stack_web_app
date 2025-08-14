"use client";

import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export interface ErrorHandlerOptions {
  title?: string;
  description?: string;
  duration?: number;
  showToast?: boolean;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: Error | any,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      title = "Error",
      description,
      duration = 5000,
      showToast = true
    } = options;

    // Log error for debugging
    console.error("Error occurred:", error);

    // Extract error message
    let errorMessage = description;
    if (!errorMessage) {
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
      }
    }

    // Handle specific error types
    if (error?.response?.status === 401) {
      errorMessage = "Session expired. Please log in again.";
    } else if (error?.response?.status === 403) {
      errorMessage = "You don't have permission to perform this action.";
    } else if (error?.response?.status === 404) {
      errorMessage = "The requested resource was not found.";
    } else if (error?.response?.status === 422) {
      errorMessage = error?.response?.data?.error || "Validation error occurred.";
    } else if (error?.response?.status >= 500) {
      errorMessage = "Server error occurred. Please try again later.";
    } else if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
      errorMessage = "Network error. Please check your connection and try again.";
    }

    // Show toast notification
    if (showToast) {
      toast({
        variant: "destructive",
        title,
        description: errorMessage,
        duration,
      });
    }

    return errorMessage;
  }, [toast]);

  const handleSuccess = useCallback((
    message: string,
    options: { title?: string; duration?: number } = {}
  ) => {
    const { title = "Success", duration = 3000 } = options;

    toast({
      title,
      description: message,
      duration,
    });
  }, [toast]);

  const handleWarning = useCallback((
    message: string,
    options: { title?: string; duration?: number } = {}
  ) => {
    const { title = "Warning", duration = 4000 } = options;

    toast({
      title,
      description: message,
      duration,
    });
  }, [toast]);

  const handleInfo = useCallback((
    message: string,
    options: { title?: string; duration?: number } = {}
  ) => {
    const { title = "Info", duration = 3000 } = options;

    toast({
      title,
      description: message,
      duration,
    });
  }, [toast]);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}

// Utility function for async operations with error handling
export function useAsyncHandler() {
  const { handleError, handleSuccess } = useErrorHandler();

  const executeAsync = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    options: {
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
      successMessage?: string;
      errorOptions?: ErrorHandlerOptions;
    } = {}
  ): Promise<T | null> => {
    try {
      const result = await asyncOperation();
      
      if (options.successMessage) {
        handleSuccess(options.successMessage);
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      handleError(error, options.errorOptions);
      
      if (options.onError) {
        options.onError(error);
      }
      
      return null;
    }
  }, [handleError, handleSuccess]);

  return { executeAsync };
}
