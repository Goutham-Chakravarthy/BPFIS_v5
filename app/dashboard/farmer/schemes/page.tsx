"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface SchemeField {
  label: string;
  key: string;
}

interface SchemeResult {
  name: string;
  link?: string;
  raw: Record<string, any>;
}

interface SearchResponse {
  eligible: SchemeResult[];
  count: number;
  searchResults?: {
    eligibleSchemes: SchemeResult[];
    count: number;
    searchedAt: Date;
  };
  savedProfile?: {
    _id: string;
    profileName: string;
    isDefault: boolean;
    updatedAt: Date;
  };
  profileSaveError?: string;
}

interface FarmerProfile {
  _id: string;
  userId: string;
  profileName: string;
  profileData: Record<string, string>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function GovernmentSchemesPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [fields, setFields] = useState<SchemeField[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<FarmerProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [saveProfile, setSaveProfile] = useState(false);

  // Helper function to build URLs with userId
  const buildUrl = (path: string) => {
    return userId ? `${path}?userId=${userId}` : path;
  };

  useEffect(() => {
    loadFields();
    if (userId) {
      loadProfiles();
    }
  }, [userId]);

  const loadFields = async () => {
    try {
      const res = await fetch("/api/schemes/headers");
      const data = await res.json();
      
      if (data.headers) {
        setFields(data.headers);
        const initial: Record<string, string> = {};
        data.headers.forEach((h: SchemeField) => {
          initial[h.key] = "";
        });
        setForm(initial);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load form fields");
    } finally {
      setLoadingFields(false);
    }
  };

  const loadProfiles = async () => {
    if (!userId) return;
    
    try {
      const res = await fetch(`/api/schemes/profile?userId=${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setProfiles(data.data);
      }
    } catch (err: any) {
      console.error('Error loading profiles:', err);
    }
  };

  const loadProfile = async (profileId: string) => {
    const profile = profiles.find(p => p._id === profileId);
    if (profile) {
      setForm(profile.profileData);
      setSelectedProfile(profileId);
      setResults(null);
    }
  };

  const handleChange = (key: string, v: string) => {
    setForm(prev => ({ ...prev, [key]: v }));
  };

  const submit = async (e?: React.FormEvent) => {
    e && e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Build payload for new API
    const payload = {
      farmerInput: form,
      saveProfile: saveProfile && profileName.trim() !== '',
      profileName: profileName.trim(),
      userId: userId
    };

    try {
      const res = await fetch("/api/schemes/search-with-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }
      
      setResults(data);
      
      // Handle profile save success/error
      if (data.profileSaveError) {
        setError(data.profileSaveError);
      } else if (data.savedProfile) {
        setSaveProfile(false);
        setProfileName('');
        setShowSaveDialog(false);
        await loadProfiles(); // Refresh profiles list
      }
    } catch (err: any) {
      setError(err.message || "Failed to search schemes");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(Object.fromEntries(Object.keys(form).map(k => [k, ""])));
    setResults(null);
    setError(null);
    setSelectedProfile('');
    setSaveProfile(false);
    setProfileName('');
  };

  const saveAsNewProfile = () => {
    if (!profileName.trim()) {
      setError('Please enter a profile name');
      return;
    }
    setSaveProfile(true);
    submit();
  };

  const deleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    
    try {
      const res = await fetch(`/api/schemes/profile?profileId=${profileId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await loadProfiles();
        if (selectedProfile === profileId) {
          setSelectedProfile('');
        }
      }
    } catch (err: any) {
      setError('Failed to delete profile');
    }
  };

  const setDefaultProfile = async (profileId: string) => {
    try {
      const res = await fetch('/api/schemes/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, isDefault: true })
      });
      
      if (res.ok) {
        await loadProfiles();
      }
    } catch (err: any) {
      setError('Failed to set default profile');
    }
  };

  if (loadingFields) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3b2c]"></div>
      </div>
    );
  }

  if (error && fields.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-[#1f3b2c] mb-4">Error Loading Schemes</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#1f3b2c] text-white px-6 py-3 rounded-lg hover:bg-[#2d4f3c]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1f3b2c] mb-2">Government Schemes</h1>
        <p className="text-gray-600">
          Find applicable government schemes based on your profile. Save your information for quick access in the future.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Profile Management Section */}
      {userId && profiles.length > 0 && (
        <div className="bg-white rounded-lg border border-[#e2d4b7] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1f3b2c] mb-4">Saved Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <div key={profile._id} className={`border rounded-lg p-4 ${
                selectedProfile === profile._id ? 'border-[#1f3b2c] bg-[#f0f7e6]' : 'border-[#e2d4b7]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-[#1f3b2c]">{profile.profileName}</h3>
                  {profile.isDefault && (
                    <span className="bg-[#1f3b2c] text-white text-xs px-2 py-1 rounded">Default</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadProfile(profile._id)}
                    className="flex-1 bg-[#1f3b2c] text-white px-3 py-1 rounded text-sm hover:bg-[#2d4f3c]"
                  >
                    Load
                  </button>
                  {!profile.isDefault && (
                    <button
                      onClick={() => setDefaultProfile(profile._id)}
                      className="px-3 py-1 border border-[#e2d4b7] text-[#1f3b2c] rounded text-sm hover:bg-[#f9fafb]"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => deleteProfile(profile._id)}
                    className="px-3 py-1 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg border border-[#e2d4b7] p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#1f3b2c]">Farmer Information</h2>
          {userId && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="bg-[#1f3b2c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2d4f3c]"
            >
              Save Profile
            </button>
          )}
        </div>
        
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map(f => {
              const isNameOrLink = /name/i.test(f.label) || /link|url|website/i.test(f.label);
              const numericHint = /age|income|land|size|hectare|amount|area|year|percentage|min|max|years|no_of|number/i.test(f.label);
              const isSelectField = /caste|gender|state|district|category|type/i.test(f.label);
              
              return (
                <div key={f.key} className="space-y-2">
                  <label className="block text-sm font-medium text-[#1f3b2c]">
                    {f.label}
                    {isNameOrLink && <span className="text-gray-600 ml-1">(auto-filled)</span>}
                  </label>
                  
                  {isSelectField ? (
                    <select
                      value={form[f.key] || ""}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      disabled={isNameOrLink}
                      className="w-full px-3 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 text-gray-700"
                    >
                      <option value="">Select option</option>
                      {/caste|category/i.test(f.label) && (
                        <>
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="EWS">EWS</option>
                        </>
                      )}
                      {/gender/i.test(f.label) && (
                        <>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                      {/state/i.test(f.label) && (
                        <>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="West Bengal">West Bengal</option>
                        </>
                      )}
                      {/type/i.test(f.label) && (
                        <>
                          <option value="Small">Small</option>
                          <option value="Marginal">Marginal</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      type={numericHint ? "number" : "text"}
                      placeholder={isNameOrLink ? "(auto-filled)" : (numericHint ? "Enter number" : "e.g. OBC, Rainfed, Paddy")}
                      value={form[f.key] || ""}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      disabled={isNameOrLink}
                      className="w-full px-3 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 text-gray-700"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1f3b2c] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2d4f3c] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Find Schemes"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="border border-[#e2d4b7] text-[#1f3b2c] px-6 py-3 rounded-lg font-medium hover:bg-[#f9fafb]"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
        <h2 className="text-xl font-semibold text-[#1f3b2c] mb-6">
          Eligible Schemes {results && `(${results.count} found)`}
        </h2>
        
        {!results && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-600 mb-4">Search</div>
            <p className="text-gray-600">Fill in your details above to find eligible government schemes</p>
          </div>
        )}
        
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3b2c] mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for eligible schemes...</p>
          </div>
        )}
        
        {results && results.count === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-600 mb-4">No Results</div>
            <p className="text-gray-600 mb-4">No schemes found matching your criteria</p>
            <p className="text-sm text-gray-600">Try adjusting your information or leaving some fields blank</p>
          </div>
        )}
        
        {results && results.eligible && results.eligible.length > 0 && (
          <div className="space-y-6">
            {results.eligible.map((scheme, i) => (
              <div key={i} className="border border-[#e2d4b7] rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#1f3b2c] flex-1">{scheme.name}</h3>
                  {scheme.link && (
                    <a
                      href={scheme.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1f3b2c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2d4f3c] transition-colors ml-4"
                    >
                      Apply Now →
                    </a>
                  )}
                </div>
                
                {!scheme.link && (
                  <div className="text-sm text-gray-600 mb-4">
                    Contact your local agricultural office for application details
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-[#1f3b2c] font-medium hover:text-[#2d4f3c]">
                    View Scheme Details
                  </summary>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(scheme.raw, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Profile Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#1f3b2c] mb-4">Save Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g., My Farm Profile, Kharif Season 2024"
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent text-gray-700"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveAsNewProfile}
                  className="flex-1 bg-[#1f3b2c] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2d4f3c]"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setProfileName('');
                  }}
                  className="flex-1 border border-[#e2d4b7] text-[#1f3b2c] px-4 py-2 rounded-lg font-medium hover:bg-[#f9fafb]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
