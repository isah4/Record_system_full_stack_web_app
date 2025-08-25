"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DebugInfo() {
  const [isVisible, setIsVisible] = useState(false);
  const [envVars, setEnvVars] = useState<any>({});
  const [apiTest, setApiTest] = useState<any>(null);

  useEffect(() => {
    // Get environment variables
    setEnvVars({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  }, []);

  const testApiConnection = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setApiTest({ error: 'NEXT_PUBLIC_API_URL not defined' });
        return;
      }

      console.log('🧪 Testing API connection to:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/health`);
      const data = await response.json();
      
      setApiTest({
        success: true,
        status: response.status,
        data,
        url: `${apiUrl}/api/health`,
      });
      
      console.log('✅ API test successful:', data);
    } catch (error: any) {
      setApiTest({
        success: false,
        error: error.message,
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/health`,
      });
      
      console.error('❌ API test failed:', error);
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        🔧 Debug Info
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          🔧 Debug Information
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-sm mb-2">Environment Variables:</h4>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="text-xs mb-1">
              <span className="font-mono bg-gray-100 px-1 rounded">{key}:</span>
              <Badge variant={value ? 'default' : 'destructive'} className="ml-2">
                {value || 'NOT SET'}
              </Badge>
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">API Connection Test:</h4>
          <Button onClick={testApiConnection} size="sm" className="mb-2">
            🧪 Test API
          </Button>
          
          {apiTest && (
            <div className="text-xs">
              {apiTest.success ? (
                <div className="text-green-600">
                  ✅ Connected to: {apiTest.url}
                  <br />
                  Status: {apiTest.status}
                </div>
              ) : (
                <div className="text-red-600">
                  ❌ Failed: {apiTest.error}
                  <br />
                  URL: {apiTest.url}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p>🔍 Check browser console for detailed logs</p>
          <p>📱 Environment: {process.env.NODE_ENV}</p>
        </div>
      </CardContent>
    </Card>
  );
}
