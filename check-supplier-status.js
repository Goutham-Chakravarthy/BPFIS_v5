// Check verification status of supplier bhuvanbn01@gmail.com
import mongoose from 'mongoose';

async function checkSupplierStatus() {
  console.log('🔍 Checking verification status for bhuvanbn01@gmail.com...\n');
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://bhuvanbn01_db_user:JxtgUj7f3vVZm89c@cluster0.rkbd9dx.mongodb.net/BPFISv5_1?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoUri);
    
    // Define User schema inline
    const UserSchema = new mongoose.Schema({
      email: String,
      role: String,
      verificationStatus: String,
      verifiedAt: Date,
      rejectionReason: String,
      documentsUploaded: Boolean,
      companyName: String,
      createdAt: Date
    });
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Find supplier by email
    const supplier = await User.findOne({ 
      email: 'bhuvanbn01@gmail.com',
      role: 'supplier'
    }).select('verificationStatus verifiedAt rejectionReason documentsUploaded email companyName createdAt');
    
    if (!supplier) {
      console.log('❌ Supplier not found with email: bhuvanbn01@gmail.com');
      return;
    }
    
    console.log('✅ Supplier Found:');
    console.log('📧 Email:', supplier.email);
    console.log('🏢 Company Name:', supplier.companyName || 'Not set');
    console.log('📊 Verification Status:', supplier.verificationStatus || 'pending');
    console.log('📄 Documents Uploaded:', supplier.documentsUploaded || false);
    console.log('✅ Verified At:', supplier.verifiedAt || 'Not verified');
    console.log('❌ Rejection Reason:', supplier.rejectionReason || 'None');
    console.log('📅 Created At:', supplier.createdAt);
    console.log('🆔 User ID:', supplier._id);
    
    // Define Document schema inline
    const DocumentSchema = new mongoose.Schema({
      owner: mongoose.Schema.Types.ObjectId,
      filename: String,
      type: String,
      originalName: String,
      createdAt: Date
    });
    
    const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
    
    // Check if there are any documents
    const documents = await Document.find({ owner: supplier._id })
      .select('filename type originalName createdAt')
      .sort({ createdAt: -1 });
    
    if (documents.length > 0) {
      console.log('\n📋 Uploaded Documents:');
      documents.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.type}: ${doc.filename} (${doc.originalName})`);
      });
    } else {
      console.log('\n📋 No documents uploaded');
    }
    
    // Admin verification URLs
    console.log('\n🔐 Admin Actions:');
    console.log(`📝 Verify Supplier: http://localhost:3000/admin/suppliers/${supplier._id}`);
    console.log(`👤 Supplier Dashboard: http://localhost:3000/dashboard/supplier/profile/verification`);
    
    // Current status summary
    console.log('\n📊 Status Summary:');
    if (supplier.verificationStatus === 'verified') {
      console.log('🎉 Status: VERIFIED ✅ - Supplier is fully verified');
    } else if (supplier.verificationStatus === 'rejected') {
      console.log('❌ Status: REJECTED - Verification was rejected');
      console.log(`📝 Reason: ${supplier.rejectionReason}`);
    } else {
      console.log('⏳ Status: PENDING - Verification is pending');
    }
    
  } catch (error) {
    console.error('💥 Error checking supplier status:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the check
checkSupplierStatus();
