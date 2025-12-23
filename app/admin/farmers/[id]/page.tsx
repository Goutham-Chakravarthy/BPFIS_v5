'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, CheckCircle, XCircle, AlertCircle, FileText, LandPlot, Users, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  basicInfo?: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    profilePicture?: string;
    isVerified: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  profileData?: {
    profileName?: string;
    scheme_name?: string;
    official_link?: string;
    land_size?: string;
    farmer_category?: string;
    location_state?: string;
    location_district?: string;
    location_taluk?: string;
    village_rtc_data?: string;
    crop_type?: string;
    season?: string;
    irrigation_type?: string;
    water_source_capacity?: string;
    organic_certification?: string;
    farmer_age?: string;
    gender?: string;
    income_catogory?: string;
    pm_kisan_registration?: string;
    equipment_ownership?: string;
    fpo_membership?: string;
    insurance_status_pmfby?: string;
    disaster_affected_region?: string;
    soil_type?: string;
    isActive?: boolean;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  schemeSearchResults?: Array<{
    eligibleSchemes: Array<{
      name: string;
      link?: string;
      raw: Record<string, any>;
    }>;
    count: number;
    searchedAt: string;
  }>;
  farmerProfile?: {
    verifiedName?: string;
    kannadaName?: string;
    aadhaarKannadaName?: string;
    rtcAddress?: string;
    nameVerificationStatus?: 'verified' | 'not_verified' | 'pending';
    age?: number;
    gender?: string;
    homeAddress?: string;
    idProof?: string;
    contactNumber?: string;
    dob?: string;
    landParcelIdentity?: string;
    ownershipVerified?: boolean;
    soilProperties?: string;
    irrigationPotential?: string;
    croppingHistory?: string;
    totalCultivableArea?: string;
    revenueObligations?: string;
    mutationTraceability?: string;
    documents?: {
      rtc?: {
        uploaded?: boolean;
        extractedText?: string;
        uploadedAt?: Date;
      };
      aadhaar?: {
        uploaded?: boolean;
        extractedText?: string;
        uploadedAt?: Date;
      };
    };
    readyToIntegrate?: boolean;
    readyToIntegrateDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };
  landDetails?: Array<{
    _id: string;
    sketchImage?: {
      filename: string;
      originalName: string;
      path: string;
      size: number;
      mimeType: string;
      uploadedAt: Date;
    };
    landData?: {
      centroidLatitude: number;
      centroidLongitude: number;
      sideLengths: number[];
      vertices: Array<{
        latitude: number;
        longitude: number;
        order: number;
      }>;
      landSizeInAcres?: number;
      geojson?: string;
    };
    rtcDetails?: {
      surveyNumber: string;
      extent: string;
      location: string;
      taluk?: string;
      hobli?: string;
      village?: string;
      soilType?: string;
      cropType?: string;
    };
    processingStatus?: 'pending' | 'completed' | 'failed';
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }>;
  landIntegrations?: {
    sent: Array<{
      _id: string;
      targetUser: any;
      status: 'pending' | 'accepted' | 'rejected' | 'completed';
      requestDate: Date;
      responseDate?: Date;
      integrationPeriod: {
        startDate: Date;
        endDate: Date;
      };
      landDetails: {
        requestingUser: {
          landId: string;
          sizeInAcres: number;
          contributionRatio: number;
          centroidLatitude: number;
          centroidLongitude: number;
        };
        targetUser: {
          landId: string;
          sizeInAcres: number;
          contributionRatio: number;
          centroidLatitude: number;
          centroidLongitude: number;
        };
        totalIntegratedSize: number;
        integrationCoordinates: {
          vertices: Array<{
            latitude: number;
            longitude: number;
            order: number;
          }>;
          centroidLatitude: number;
          centroidLongitude: number;
        };
      };
      financialAgreement: {
        totalInvestment?: number;
        requestingUserContribution: number;
        targetUserContribution: number;
        profitSharingRatio: {
          requestingUser: number;
          targetUser: number;
        };
      };
      agreementDocument?: string;
      signatures?: Array<{
        userId: string;
        userName: string;
        signatureHash: string;
        signedAt: Date;
        ipAddress: string;
        userAgent: string;
      }>;
      executionDate?: Date;
      blockchain?: {
        agreementId?: string;
        contractAddress?: string;
        deployedAt?: Date;
        transactionHash?: string;
        isImmutable?: boolean;
      };
      createdAt: Date;
      updatedAt: Date;
    }>;
    received: Array<{
      _id: string;
      requestingUser: any;
      status: 'pending' | 'accepted' | 'rejected' | 'completed';
      requestDate: Date;
      responseDate?: Date;
      integrationPeriod: {
        startDate: Date;
        endDate: Date;
      };
      landDetails: {
        requestingUser: {
          landId: string;
          sizeInAcres: number;
          contributionRatio: number;
          centroidLatitude: number;
          centroidLongitude: number;
        };
        targetUser: {
          landId: string;
          sizeInAcres: number;
          contributionRatio: number;
          centroidLatitude: number;
          centroidLongitude: number;
        };
        totalIntegratedSize: number;
        integrationCoordinates: {
          vertices: Array<{
            latitude: number;
            longitude: number;
            order: number;
          }>;
          centroidLatitude: number;
          centroidLongitude: number;
        };
      };
      financialAgreement: {
        totalInvestment?: number;
        requestingUserContribution: number;
        targetUserContribution: number;
        profitSharingRatio: {
          requestingUser: number;
          targetUser: number;
        };
      };
      agreementDocument?: string;
      signatures?: Array<{
        userId: string;
        userName: string;
        signatureHash: string;
        signedAt: Date;
        ipAddress: string;
        userAgent: string;
      }>;
      executionDate?: Date;
      blockchain?: {
        agreementId?: string;
        contractAddress?: string;
        deployedAt?: Date;
        transactionHash?: string;
        isImmutable?: boolean;
      };
      createdAt: Date;
      updatedAt: Date;
    }>;
  };
  statistics?: {
    totalProducts: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  orders?: Array<{
    _id: string;
    total: number;
    status: string;
    paymentStatus?: string;
    createdAt: string;
    updatedAt: string;
    items?: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      total: number;
    }>;
  }>;
}

// Reusable UI Components
const StatusBadge = ({ status, variant = 'default' }: { status: string; variant?: 'success' | 'warning' | 'error' | 'info' | 'default' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {status}
    </span>
  );
};

const InfoCard = ({ title, children, icon: Icon, className = '' }: { title: string; children: React.ReactNode; icon?: any; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="h-5 w-5 text-gray-500" />}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
    </div>
    <div className="px-6 py-4">
      {children}
    </div>
  </div>
);

const DataField = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: any }) => (
  <div className="flex items-start space-x-3 py-2">
    {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
    <div className="min-w-0 flex-1">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  </div>
);

const DataGrid = ({ children, columns = 2 }: { children: React.ReactNode; columns?: number }) => (
  <div className={`grid gap-4 ${columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
    {children}
  </div>
);

const getAgreementUrl = (integration: any): string => {
  // If we have a blockchain document CID, use IPFS gateway
  if (integration.blockchain?.documentCid) {
    const filename = integration.agreementDocument?.split('/').pop() || 'agreement.pdf';
    return `https://ipfs.io/ipfs/${integration.blockchain.documentCid}/${filename}`;
  }
  // Fallback to local path (if available)
  return integration.agreementDocument || '#';
};

const IntegrationCard = ({ integration, type }: { integration: any; type: 'sent' | 'received' }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'accepted': return 'info';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const user = type === 'sent' ? integration.targetUser : integration.requestingUser;
  const userRole = type === 'sent' ? 'Partner' : 'Requester';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {userRole}: {user?.name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
          </div>
        </div>
        <StatusBadge status={integration.status} variant={getStatusVariant(integration.status)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DataField
          label="Request Date"
          value={new Date(integration.requestDate).toLocaleDateString()}
          icon={Calendar}
        />
        {integration.responseDate && (
          <DataField
            label="Response Date"
            value={new Date(integration.responseDate).toLocaleDateString()}
            icon={Calendar}
          />
        )}
        <DataField
          label="Integration Period"
          value={`${new Date(integration.integrationPeriod.startDate).toLocaleDateString()} - ${new Date(integration.integrationPeriod.endDate).toLocaleDateString()}`}
        />
        <DataField
          label="Total Size"
          value={`${integration.landDetails.totalIntegratedSize} acres`}
          icon={LandPlot}
        />
      </div>

      {integration.financialAgreement && (
        <div className="pt-4 border-t border-gray-200">
          <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Financial Agreement
          </h5>
          <DataGrid columns={2}>
            <DataField
              label="Total Investment"
              value={`₹${integration.financialAgreement.totalInvestment || 'N/A'}`}
            />
            <DataField
              label={`${type === 'sent' ? 'Your' : 'Requester'} Contribution`}
              value={`₹${type === 'sent' ? integration.financialAgreement.requestingUserContribution : integration.financialAgreement.requestingUserContribution}`}
            />
            <DataField
              label={`${type === 'sent' ? 'Partner' : 'Your'} Contribution`}
              value={`₹${type === 'sent' ? integration.financialAgreement.targetUserContribution : integration.financialAgreement.targetUserContribution}`}
            />
            <DataField
              label="Profit Sharing"
              value={`${type === 'sent' ? 'You' : 'Requester'}: ${integration.financialAgreement.profitSharingRatio.requestingUser}%, ${type === 'sent' ? 'Partner' : 'You'}: ${integration.financialAgreement.profitSharingRatio.targetUser}%`}
            />
          </DataGrid>
        </div>
      )}

      {/* Temporarily disabled view agreement button
      {integration.agreementDocument && (
        <div className="flex space-x-2">
          <a
            href={getAgreementUrl(integration)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {integration.blockchain?.documentCid ? 'View on IPFS' : 'View Agreement'}
          </a>
        </div>
      )}
      */}
    </div>
  );
};

interface AgreementPreview {
  url: string;
  title: string;
  integration: any;
}

export default function FarmerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/farmers/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch farmer details');
        }

        const data = await response.json();
        setFarmer(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        console.error('Error fetching farmer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-8 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <div className="mt-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h3 className="mt-2 text-lg font-medium text-gray-900">Farmer not found</h3>
            <p className="mt-1 text-sm text-gray-500">The requested farmer could not be found.</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/admin/farmers')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Farmers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/farmers')}
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </button>
        </div>

        {/* Farmer Overview Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{farmer.name}</h1>
                  <p className="text-gray-600">{farmer.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge
                  status={farmer.isVerified ? 'Verified' : 'Pending Verification'}
                  variant={farmer.isVerified ? 'success' : 'warning'}
                />
                <div className="text-right">
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(farmer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {farmer.phone || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {farmer.address || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{farmer.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <InfoCard title="Basic Information" icon={User} className="mb-6">
          <DataGrid columns={2}>
            <DataField label="Full Name" value={farmer.basicInfo?.fullName || farmer.name} icon={User} />
            <DataField label="Email Address" value={farmer.basicInfo?.email || farmer.email} icon={Mail} />
            <DataField label="Phone Number" value={farmer.basicInfo?.phone || farmer.phone || 'Not provided'} icon={Phone} />
            <DataField label="Address" value={farmer.basicInfo?.address || farmer.address || 'Not provided'} icon={MapPin} />
            <DataField
              label="Verification Status"
              value={<StatusBadge
                status={(farmer.basicInfo?.isVerified ?? farmer.isVerified) ? 'Verified' : 'Not Verified'}
                variant={(farmer.basicInfo?.isVerified ?? farmer.isVerified) ? 'success' : 'warning'}
              />}
            />
            <DataField
              label="Email Verified"
              value={<StatusBadge
                status={farmer.basicInfo?.emailVerified ? 'Verified' : 'Not Verified'}
                variant={farmer.basicInfo?.emailVerified ? 'success' : 'warning'}
              />}
            />
            <DataField
              label="Phone Verified"
              value={<StatusBadge
                status={farmer.basicInfo?.phoneVerified ? 'Verified' : 'Not Verified'}
                variant={farmer.basicInfo?.phoneVerified ? 'success' : 'warning'}
              />}
            />
            <DataField
              label="Member Since"
              value={new Date(farmer.basicInfo?.createdAt || farmer.createdAt).toLocaleDateString()}
              icon={Calendar}
            />
          </DataGrid>
        </InfoCard>

        {/* Scheme Profile Information */}
        {farmer.profileData && (
          <InfoCard title="Scheme Profile Details" icon={FileText} className="mb-6">
            {/* Personal Details */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Personal Details
              </h5>
              <DataGrid columns={3}>
                <DataField label="Profile Name" value={farmer.profileData.profileName || 'N/A'} />
                <DataField label="Farmer Age" value={farmer.profileData.farmer_age || 'N/A'} />
                <DataField label="Gender" value={farmer.profileData.gender || 'N/A'} />
                <DataField label="Farmer Category" value={farmer.profileData.farmer_category || 'N/A'} />
                <DataField label="Income Category" value={farmer.profileData.income_catogory || 'N/A'} />
              </DataGrid>
            </div>

            {/* Location Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Location Information
              </h5>
              <DataGrid columns={3}>
                <DataField label="State" value={farmer.profileData.location_state || 'N/A'} />
                <DataField label="District" value={farmer.profileData.location_district || 'N/A'} />
                <DataField label="Village/RTC" value={farmer.profileData.village_rtc_data || 'N/A'} />
              </DataGrid>
            </div>

            {/* Farm Details */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <LandPlot className="h-4 w-4 mr-2" />
                Farm Details
              </h5>
              <DataGrid columns={3}>
                <DataField label="Land Size" value={farmer.profileData.land_size || 'N/A'} />
                <DataField label="Crop Type" value={farmer.profileData.crop_type || 'N/A'} />
                <DataField label="Season" value={farmer.profileData.season || 'N/A'} />
                <DataField label="Irrigation Type" value={farmer.profileData.irrigation_type || 'N/A'} />
                <DataField label="Water Source Capacity" value={farmer.profileData.water_source_capacity || 'N/A'} />
                <DataField label="Soil Type" value={farmer.profileData.soil_type || 'N/A'} />
              </DataGrid>
            </div>

            {/* Certifications & Memberships */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Certifications & Memberships
              </h5>
              <DataGrid columns={2}>
                <DataField label="Organic Certification" value={farmer.profileData.organic_certification || 'N/A'} />
                <DataField label="PM Kisan Registration" value={farmer.profileData.pm_kisan_registration || 'N/A'} />
                <DataField label="Equipment Ownership" value={farmer.profileData.equipment_ownership || 'N/A'} />
                <DataField label="FPO Membership" value={farmer.profileData.fpo_membership || 'N/A'} />
                <DataField label="Insurance Status" value={farmer.profileData.insurance_status_pmfby || 'N/A'} />
                <DataField label="Disaster Affected Region" value={farmer.profileData.disaster_affected_region || 'N/A'} />
              </DataGrid>
            </div>

            {/* Official Documentation */}
            {farmer.profileData.official_link && (
              <div className="pt-4 border-t border-gray-200">
                <DataField
                  label="Official Link"
                  value={
                    <a href={farmer.profileData.official_link} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                      View Official Document
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  }
                  icon={ExternalLink}
                />
              </div>
            )}
          </InfoCard>
        )}

        {/* Scheme Search Results */}
        {farmer.schemeSearchResults && farmer.schemeSearchResults.length > 0 && (
          <InfoCard title="Scheme Search Results" icon={FileText} className="mb-6">
            <div className="space-y-4">
              {farmer.schemeSearchResults.map((result, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(result.searchedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <StatusBadge
                      status={`${result.count} schemes found`}
                      variant="info"
                    />
                  </div>
                  <div className="space-y-2">
                    {result.eligibleSchemes.map((scheme, schemeIndex) => (
                      <div key={schemeIndex} className="flex items-center justify-between p-3 bg-white rounded border-l-4 border-green-500">
                        <span className="text-sm font-medium text-gray-900">{scheme.name}</span>
                        {scheme.link && (
                          <a
                            href={scheme.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Details
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>
        )}

        {/* Farmer Profile Section */}
        {farmer?.farmerProfile && (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Farmer Profile Details</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Complete farmer profile information with verification details
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                {/* Personal Information */}
                <div className="py-4 sm:py-5 px-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Verified Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.verifiedName || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Kannada Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.kannadaName || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Aadhaar Kannada Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.aadhaarKannadaName || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Age</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.age || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Gender</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.gender || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.dob || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.contactNumber || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Home Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.homeAddress || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Name Verification Status</dt>
                      <dd className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          farmer.farmerProfile.nameVerificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : farmer.farmerProfile.nameVerificationStatus === 'not_verified'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {farmer.farmerProfile.nameVerificationStatus || 'N/A'}
                        </span>
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Land Information */}
                <div className="py-4 sm:py-5 px-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Land Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Land Parcel Identity</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.landParcelIdentity || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Ownership Verified</dt>
                      <dd className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          farmer.farmerProfile.ownershipVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {farmer.farmerProfile.ownershipVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Total Cultivable Area</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.totalCultivableArea || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Soil Properties</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.soilProperties || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Irrigation Potential</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.irrigationPotential || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Cropping History</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.croppingHistory || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Revenue Obligations</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.revenueObligations || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Mutation Traceability</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.farmerProfile.mutationTraceability || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Ready to Integrate</dt>
                      <dd className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          farmer.farmerProfile.readyToIntegrate
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {farmer.farmerProfile.readyToIntegrate ? 'Ready' : 'Not Ready'}
                        </span>
                      </dd>
                    </div>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Documents */}
        {farmer.farmerProfile?.documents && (
          <InfoCard title="Documents" icon={FileText} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RTC Document */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-gray-900">RTC Document</h5>
                  <StatusBadge
                    status={farmer.farmerProfile.documents.rtc?.uploaded ? 'Uploaded' : 'Not Uploaded'}
                    variant={farmer.farmerProfile.documents.rtc?.uploaded ? 'success' : 'error'}
                  />
                </div>
                <div className="space-y-2">
                  {farmer.farmerProfile.documents.rtc?.uploadedAt && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Uploaded: {new Date(farmer.farmerProfile.documents.rtc.uploadedAt).toLocaleDateString()}
                    </div>
                  )}
                  {farmer.farmerProfile.documents.rtc?.extractedText && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Extracted text available
                    </div>
                  )}
                </div>
              </div>

              {/* Aadhaar Document */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-gray-900">Aadhaar Document</h5>
                  <StatusBadge
                    status={farmer.farmerProfile.documents.aadhaar?.uploaded ? 'Uploaded' : 'Not Uploaded'}
                    variant={farmer.farmerProfile.documents.aadhaar?.uploaded ? 'success' : 'error'}
                  />
                </div>
                <div className="space-y-2">
                  {farmer.farmerProfile.documents.aadhaar?.uploadedAt && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Uploaded: {new Date(farmer.farmerProfile.documents.aadhaar.uploadedAt).toLocaleDateString()}
                    </div>
                  )}
                  {farmer.farmerProfile.documents.aadhaar?.extractedText && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Extracted text available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </InfoCard>
        )}

        {/* Land Details */}
        {farmer?.landDetails && farmer.landDetails.length > 0 && (
          <InfoCard title="Land Details" icon={LandPlot} className="mb-6">
            <div className="space-y-6">
              {farmer.landDetails.map((land, index) => (
                <div key={land._id} className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Land Parcel {index + 1}</h4>
                    <StatusBadge
                      status={land.processingStatus || 'pending'}
                      variant={
                        land.processingStatus === 'completed' ? 'success' :
                        land.processingStatus === 'failed' ? 'error' : 'warning'
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* RTC Details */}
                    {land.rtcDetails && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          RTC Details
                        </h5>
                        <DataGrid columns={2}>
                          <DataField label="Survey Number" value={land.rtcDetails.surveyNumber} />
                          <DataField label="Extent" value={`${land.rtcDetails.extent} acres`} />
                          <DataField label="Location" value={land.rtcDetails.location} />
                          <DataField label="Taluk" value={land.rtcDetails.taluk || 'N/A'} />
                          <DataField label="Hobli" value={land.rtcDetails.hobli || 'N/A'} />
                          <DataField label="Village" value={land.rtcDetails.village || 'N/A'} />
                          <DataField label="Soil Type" value={land.rtcDetails.soilType || 'N/A'} />
                          <DataField label="Crop Type" value={land.rtcDetails.cropType || 'N/A'} />
                        </DataGrid>
                      </div>
                    )}

                    {/* Geographical Data */}
                    {land.landData && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Geographical Data
                        </h5>
                        <DataGrid columns={2}>
                          <DataField label="Latitude" value={land.landData.centroidLatitude.toString()} />
                          <DataField label="Longitude" value={land.landData.centroidLongitude.toString()} />
                          <DataField label="Land Size" value={`${land.landData.landSizeInAcres || 'N/A'} acres`} />
                          {land.processedAt && (
                            <DataField
                              label="Processed At"
                              value={new Date(land.processedAt).toLocaleDateString()}
                              icon={Calendar}
                            />
                          )}
                        </DataGrid>
                      </div>
                    )}
                  </div>

                  {/* Sketch Image */}
                  {land.sketchImage && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Land Sketch: {land.sketchImage.originalName}</span>
                          <span className="ml-2 text-gray-500">
                            ({(land.sketchImage.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        {land.sketchImage.uploadedAt && (
                          <div className="text-sm text-gray-500">
                            Uploaded: {new Date(land.sketchImage.uploadedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </InfoCard>
        )}

        {/* Land Integrations */}
        {farmer?.landIntegrations && (
          <InfoCard title="Land Integrations" icon={Users} className="mb-6">
            <div className="space-y-8">
              {/* Integrations Sent */}
              {farmer?.landIntegrations?.sent && farmer.landIntegrations.sent.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <ArrowLeft className="h-5 w-5 text-gray-500 mr-2 rotate-180" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Sent Requests ({farmer.landIntegrations.sent.length})
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {farmer.landIntegrations.sent.map((integration) => (
                      <IntegrationCard 
                        key={integration._id} 
                        integration={integration} 
                        type="sent" 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Integrations Received */}
              {farmer.landIntegrations.received && farmer.landIntegrations.received.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <ArrowLeft className="h-5 w-5 text-gray-500 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Received Requests ({farmer.landIntegrations.received.length})
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {farmer.landIntegrations.received.map((integration) => (
                      <IntegrationCard 
                        key={integration._id} 
                        integration={integration} 
                        type="received" 
                      />
                    ))}
                  </div>
                </div>
              )}

              {(!farmer.landIntegrations.sent || farmer.landIntegrations.sent.length === 0) &&
               (!farmer.landIntegrations.received || farmer.landIntegrations.received.length === 0) && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No land integration requests found.</p>
                </div>
              )}
            </div>
          </InfoCard>
        )}

      </div>

    </div>
  );
}
