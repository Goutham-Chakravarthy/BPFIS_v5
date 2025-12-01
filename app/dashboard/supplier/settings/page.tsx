"use client";

import { useState } from 'react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    lowStockAlerts: true,
    reviewNotifications: true,
    marketingEmails: false,
    
    // Business Settings
    autoConfirmOrders: false,
    defaultShippingMethod: 'standard',
    returnPolicy: '30-days',
    taxInclusive: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '24h',
    
    // Display Settings
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en'
  });

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSelect = (setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/seller/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-seller-id': 'temp-seller-id' // TODO: Get from auth
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Settings saved successfully!');
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1f3b2c]">Account Settings</h1>
        <p className="text-sm text-[#6b7280] mt-1">Manage your account preferences and business settings</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#e2d4b7] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1f3b2c] mb-6">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#e2d4b7]">
                <div>
                  <p className="font-medium text-[#1f3b2c]">Email Notifications</p>
                  <p className="text-sm text-[#6b7280]">Receive important updates via email</p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#e2d4b7]">
                <div>
                  <p className="font-medium text-[#1f3b2c]">SMS Notifications</p>
                  <p className="text-sm text-[#6b7280]">Get instant alerts on your phone</p>
                </div>
                <button
                  onClick={() => handleToggle('smsNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.smsNotifications ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#e2d4b7]">
                <div>
                  <p className="font-medium text-[#1f3b2c]">Order Notifications</p>
                  <p className="text-sm text-[#6b7280]">Alerts for new orders and status changes</p>
                </div>
                <button
                  onClick={() => handleToggle('orderNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.orderNotifications ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.orderNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#e2d4b7]">
                <div>
                  <p className="font-medium text-[#1f3b2c]">Low Stock Alerts</p>
                  <p className="text-sm text-[#6b7280]">Get notified when inventory is running low</p>
                </div>
                <button
                  onClick={() => handleToggle('lowStockAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.lowStockAlerts ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.lowStockAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#e2d4b7]">
                <div>
                  <p className="font-medium text-[#1f3b2c]">Review Notifications</p>
                  <p className="text-sm text-[#6b7280]">Alerts for new customer reviews</p>
                </div>
                <button
                  onClick={() => handleToggle('reviewNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reviewNotifications ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reviewNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[#1f3b2c]">Marketing Emails</p>
                  <p className="text-sm text-[#6b7280]">Receive promotional offers and updates</p>
                </div>
                <button
                  onClick={() => handleToggle('marketingEmails')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.marketingEmails ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#e2d4b7] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1f3b2c] mb-6">Business Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                  Default Shipping Method
                </label>
                <select
                  value={settings.defaultShippingMethod}
                  onChange={(e) => handleSelect('defaultShippingMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent text-gray-700"
                >
                  <option value="standard">Standard Shipping</option>
                  <option value="express">Express Shipping</option>
                  <option value="pickup">Store Pickup</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                  Return Policy
                </label>
                <select
                  value={settings.returnPolicy}
                  onChange={(e) => handleSelect('returnPolicy', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent text-gray-700"
                >
                  <option value="7-days">7 Days</option>
                  <option value="15-days">15 Days</option>
                  <option value="30-days">30 Days</option>
                  <option value="no-returns">No Returns</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSelect('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent text-gray-700"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSelect('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent text-gray-700"
                >
                  <option value="Asia/Kolkata">India Standard Time</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-[#e2d4b7]">
                <div>
                  <p className="font-medium text-[#1f3b2c]">Auto-confirm Orders</p>
                  <p className="text-sm text-[#6b7280]">Automatically accept new orders</p>
                </div>
                <button
                  onClick={() => handleToggle('autoConfirmOrders')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoConfirmOrders ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoConfirmOrders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[#1f3b2c]">Tax Inclusive Prices</p>
                  <p className="text-sm text-[#6b7280]">Show prices including tax</p>
                </div>
                <button
                  onClick={() => handleToggle('taxInclusive')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.taxInclusive ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.taxInclusive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border border-[#e2d4b7] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#1f3b2c] mb-6">Security Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#e2d4b7]">
              <div>
                <p className="font-medium text-[#1f3b2c]">Two-Factor Authentication</p>
                <p className="text-sm text-[#6b7280]">Add an extra layer of security</p>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorAuth ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Session Timeout
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleSelect('sessionTimeout', e.target.value)}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent text-gray-700"
              >
                <option value="1h">1 Hour</option>
                <option value="8h">8 Hours</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full px-4 py-2 border border-[#e2d4b7] rounded-md text-sm font-medium text-[#1f3b2c] hover:bg-[#f9fafb]">
              Change Password
            </button>
            <button className="w-full px-4 py-2 border border-[#e2d4b7] rounded-md text-sm font-medium text-[#1f3b2c] hover:bg-[#f9fafb]">
              Download My Data
            </button>
            <button className="w-full px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-[#1f3b2c] px-6 py-2 text-sm font-medium text-white hover:bg-[#2d4f3c] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
