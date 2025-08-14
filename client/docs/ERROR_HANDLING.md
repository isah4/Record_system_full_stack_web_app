# Error Handling & Toast Notifications Guide

This guide explains how to implement comprehensive error handling with toast notifications in the BizTracker application.

## Overview

The application uses a centralized error handling system with the `useErrorHandler` hook that provides toast notifications for errors, successes, warnings, and info messages.

## Setup

The toast system is already configured in the main layout (`app/layout.tsx`) with the Toaster component.

## Using the Error Handler Hook

### Basic Import

```typescript
import { useErrorHandler } from '@/hooks/use-error-handler';
```

### Hook Methods

```typescript
const { handleError, handleSuccess, handleWarning, handleInfo } = useErrorHandler();
```

## Error Handling Patterns

### 1. API Call Error Handling

```typescript
// ✅ GOOD - Using error handler
const { handleError, handleSuccess } = useErrorHandler();

const fetchData = async () => {
  try {
    const data = await apiService.authenticatedRequest('/api/data');
    setData(data);
    handleSuccess("Data loaded successfully!");
  } catch (error) {
    handleError(error, {
      title: "Failed to load data",
      description: "Could not fetch the requested data. Please try again."
    });
  }
};

// ❌ BAD - Old pattern
const fetchData = async () => {
  try {
    const data = await apiService.authenticatedRequest('/api/data');
    setData(data);
  } catch (error) {
    setError(error.message); // This only shows in component
    console.error(error); // Poor user experience
  }
};
```

### 2. Form Submission with Validation

```typescript
const { handleError, handleSuccess } = useErrorHandler();
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (formData) => {
  // Client-side validation
  if (!formData.email || !formData.password) {
    handleError("Please fill in all required fields", {
      title: "Validation Error"
    });
    return;
  }

  setSubmitting(true);
  try {
    await api.post('/api/submit', formData);
    handleSuccess("Form submitted successfully!");
    onClose(); // Close modal or redirect
  } catch (error) {
    handleError(error, {
      title: "Submission Failed",
      description: "Could not save your changes. Please try again."
    });
  } finally {
    setSubmitting(false);
  }
};
```

### 3. Authentication Error Handling

```typescript
const { handleError, handleSuccess } = useErrorHandler();

const handleLogin = async (email, password) => {
  try {
    await login(email, password);
    handleSuccess("Login successful! Welcome back.");
    router.push('/dashboard');
  } catch (error) {
    handleError(error, {
      title: "Login Failed",
      description: "Please check your credentials and try again."
    });
  }
};
```

### 4. Component Lifecycle Error Handling

```typescript
const { handleError } = useErrorHandler();

useEffect(() => {
  const loadInitialData = async () => {
    try {
      const [users, settings] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/settings')
      ]);
      setUsers(users);
      setSettings(settings);
    } catch (error) {
      // Only show error if it's not an auth error
      if (!error.message?.includes('401')) {
        handleError(error, {
          title: "Failed to load page data",
          description: "Some data could not be loaded. Please refresh the page."
        });
      }
    }
  };

  loadInitialData();
}, [handleError]);
```

## Toast Notification Types

### Error Messages
```typescript
handleError(error, {
  title: "Error Title",
  description: "Detailed error message",
  duration: 5000 // optional, defaults to 5s
});
```

### Success Messages  
```typescript
handleSuccess("Operation completed successfully!", {
  title: "Success", // optional, defaults to "Success"
  duration: 3000 // optional, defaults to 3s
});
```

### Warning Messages
```typescript
handleWarning("This action cannot be undone", {
  title: "Warning",
  duration: 4000
});
```

### Info Messages
```typescript
handleInfo("New feature available", {
  title: "Info",
  duration: 3000
});
```

## Error Handler Options

```typescript
interface ErrorHandlerOptions {
  title?: string;           // Toast title
  description?: string;     // Override error message
  duration?: number;        // Toast duration in ms
  showToast?: boolean;      // Whether to show toast (default: true)
}
```

## Async Operations Helper

For complex async operations, use the `useAsyncHandler` hook:

```typescript
import { useAsyncHandler } from '@/hooks/use-error-handler';

const { executeAsync } = useAsyncHandler();

const handleOperation = () => {
  executeAsync(
    () => api.post('/api/complex-operation', data),
    {
      successMessage: "Operation completed successfully!",
      onSuccess: (result) => {
        // Handle success
        setResult(result);
        onClose();
      },
      onError: (error) => {
        // Additional error handling if needed
        console.error("Operation failed:", error);
      },
      errorOptions: {
        title: "Operation Failed",
        description: "Could not complete the operation."
      }
    }
  );
};
```

## Best Practices

### 1. Consistent Error Messages
- Use clear, user-friendly error messages
- Provide actionable information when possible
- Be consistent with terminology across the app

### 2. Loading States
Always show loading states during async operations:

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await api.post('/api/submit', data);
    handleSuccess("Submitted successfully!");
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};

// In JSX
<Button disabled={loading}>
  {loading ? (
    <>
      <LoaderIcon className="animate-spin" />
      Submitting...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

### 3. Error Boundaries
For catching unexpected React errors, consider implementing error boundaries:

```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // You could also send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### 4. Network Error Handling
The API service automatically handles network errors and provides user-friendly messages for common scenarios:

- Network connectivity issues
- Server errors (5xx)
- Authentication errors (401)
- Permission errors (403)
- Not found errors (404)
- Validation errors (422)

### 5. Don't Overwhelm Users
- Avoid showing multiple error toasts for the same operation
- Use appropriate duration based on message importance
- Consider grouping related errors

## Migration from Old Error Handling

### Before (❌ Old Pattern)
```typescript
const [error, setError] = useState(null);

try {
  await api.post('/api/data');
} catch (err) {
  setError(err.message);
}

// In JSX
{error && <div className="error">{error}</div>}
```

### After (✅ New Pattern)
```typescript
const { handleError, handleSuccess } = useErrorHandler();

try {
  await api.post('/api/data');
  handleSuccess("Data saved successfully!");
} catch (err) {
  handleError(err, {
    title: "Save Failed",
    description: "Could not save your data. Please try again."
  });
}
```

## Examples in Codebase

Check these files for implementation examples:

- `app/components/QuickSaleForm.tsx` - Form submission with validation
- `app/components/ItemFormModal.tsx` - CRUD operations with success/error handling
- `app/components/MobileStatsGrid.tsx` - Data fetching with error handling
- `components/auth/LoginForm.tsx` - Authentication error handling
- `app/page.tsx` - Page-level error handling

## Testing Error Handling

When testing components with error handling:

```typescript
import { render, screen } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/use-error-handler';

// Mock the hook
jest.mock('@/hooks/use-error-handler');

test('shows error toast when operation fails', async () => {
  const mockHandleError = jest.fn();
  (useErrorHandler as jest.Mock).mockReturnValue({
    handleError: mockHandleError,
    handleSuccess: jest.fn()
  });

  // ... test implementation
  
  expect(mockHandleError).toHaveBeenCalledWith(
    expect.any(Error),
    expect.objectContaining({
      title: "Expected Error Title"
    })
  );
});
```

This error handling system provides a consistent, user-friendly way to handle all errors and success states across the application.
