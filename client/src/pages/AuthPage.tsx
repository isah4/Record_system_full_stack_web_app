import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { TrendingUp, BarChart3, DollarSign, Users } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: TrendingUp,
      title: 'Sales Tracking',
      description: 'Record and monitor your sales with detailed analytics'
    },
    {
      icon: BarChart3,
      title: 'Inventory Management',
      description: 'Keep track of stock levels and get low-stock alerts'
    },
    {
      icon: DollarSign,
      title: 'Expense Tracking',
      description: 'Monitor internal and external expenses'
    },
    {
      icon: Users,
      title: 'Debt Management',
      description: 'Track outstanding debts and payment schedules'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Mobile Header - Always visible */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-800 mb-1">
              Record Management System
            </h1>
            <p className="text-sm text-neutral-600">
              {isLogin ? 'Sign in to continue' : 'Create your account'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-4rem)]">
          
          {/* Left Side - Features (Hidden on mobile, visible on desktop) */}
          <div className="hidden lg:block">
            <div className="max-w-lg">
              {/* Logo/Brand */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-neutral-800 mb-2">
                  Record Management System
                </h1>
                <p className="text-xl text-neutral-600">
                  Streamline your small business operations
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-soft"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="mt-8 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-neutral-700 italic mb-4">
                  "This system has transformed how we manage our small business. Everything is now organized and accessible."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">JS</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-neutral-800">John Smith</p>
                    <p className="text-sm text-neutral-600">Small Business Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="flex items-center justify-center w-full">
            <div className="w-full max-w-sm sm:max-w-md">
              {/* Auth Forms */}
              <div className="animate-fade-in">
                {isLogin ? (
                  <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
                ) : (
                  <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
                )}
              </div>

              {/* Mobile Features Preview - Compact grid */}
              <div className="lg:hidden mt-6">
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 text-center"
                    >
                      <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-2">
                        <feature.icon className="w-3 h-3 text-white" />
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-800 leading-tight">
                        {feature.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 