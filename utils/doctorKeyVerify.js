// utils/doctorKeyVerify.js - Doctor key verification utility
const DoctorVerification = require('../models/DoctorVerification');

// Verify doctor unique key
const verifyDoctorKey = async (uniqueKey) => {
  try {
    const validKey = await DoctorVerification.findOne({ uniqueKey, isUsed: false });
    if (validKey) {
      return {
        isValid: true,
        details: {
          specialization: validKey.specialization,
          registrationNumber: validKey.registrationNumber
        }
      };
    }
    return { isValid: false };
  } catch (error) {
    console.error("Error verifying doctor key:", error);
    return { isValid: false, error: "Verification service unavailable" };
  }
};

module.exports = verifyDoctorKey;