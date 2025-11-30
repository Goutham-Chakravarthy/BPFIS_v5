import mongoose, { Schema, Document } from 'mongoose';

// Land Integration Request
export interface ILandIntegration extends Document {
  requestingUser: mongoose.Types.ObjectId;
  targetUser: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requestDate: Date;
  responseDate?: Date;
  integrationPeriod: {
    startDate: Date;
    endDate: Date;
  };
  landDetails: {
    requestingUser: {
      landId: mongoose.Types.ObjectId;
      sizeInAcres: number;
      contributionRatio: number; // percentage
      centroidLatitude: number;
      centroidLongitude: number;
    };
    targetUser: {
      landId: mongoose.Types.ObjectId;
      sizeInAcres: number;
      contributionRatio: number; // percentage
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
  agreementDocument?: string; // path to generated agreement PDF
  createdAt: Date;
  updatedAt: Date;
}

const LandIntegrationSchema = new Schema<ILandIntegration>({
  requestingUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'completed'], 
    default: 'pending' 
  },
  requestDate: { type: Date, default: Date.now },
  responseDate: { type: Date },
  integrationPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  landDetails: {
    requestingUser: {
      landId: { type: Schema.Types.ObjectId, ref: 'LandDetails', required: true },
      sizeInAcres: { type: Number, required: true },
      contributionRatio: { type: Number, required: true },
      centroidLatitude: { type: Number, required: true },
      centroidLongitude: { type: Number, required: true }
    },
    targetUser: {
      landId: { type: Schema.Types.ObjectId, ref: 'LandDetails', required: true },
      sizeInAcres: { type: Number, required: true },
      contributionRatio: { type: Number, required: true },
      centroidLatitude: { type: Number, required: true },
      centroidLongitude: { type: Number, required: true }
    },
    totalIntegratedSize: { type: Number, required: true },
    integrationCoordinates: {
      vertices: [{
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        order: { type: Number, required: true }
      }],
      centroidLatitude: { type: Number, required: true },
      centroidLongitude: { type: Number, required: true }
    }
  },
  financialAgreement: {
    totalInvestment: { type: Number },
    requestingUserContribution: { type: Number, required: true },
    targetUserContribution: { type: Number, required: true },
    profitSharingRatio: {
      requestingUser: { type: Number, required: true },
      targetUser: { type: Number, required: true }
    }
  },
  agreementDocument: { type: String }
}, {
  timestamps: true
});

// Index for efficient queries
LandIntegrationSchema.index({ requestingUser: 1, status: 1 });
LandIntegrationSchema.index({ targetUser: 1, status: 1 });
LandIntegrationSchema.index({ status: 1, requestDate: -1 });

export const LandIntegration = mongoose.models.LandIntegration || mongoose.model('LandIntegration', LandIntegrationSchema);
