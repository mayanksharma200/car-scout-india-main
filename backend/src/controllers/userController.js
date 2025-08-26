const User = require('../models/User');
const Profile = require('../models/Profile');

class UserController {
  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;

      // Get user profile data
      let profile = await Profile.findByUserId(userId);

      // If no profile exists, create one
      if (!profile) {
        profile = await Profile.create({
          id: userId,
          role: "user",
          first_name: req.user.firstName,
          last_name: req.user.lastName,
          phone: req.user.phone,
          city: req.user.city,
          is_active: true,
          email_verified: req.user.emailVerified,
        });
      }

      // Merge user data with profile data
      const completeUserData = {
        ...req.user,
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role || "user",
        phone: profile.phone,
        city: profile.city,
        isActive: profile.is_active,
        emailVerified: profile.email_verified,
        profileImage: profile.profile_image,
        dateOfBirth: profile.date_of_birth,
        gender: profile.gender,
        address: profile.address,
        pincode: profile.pincode,
        preferences: profile.preferences,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };

      res.json({
        success: true,
        data: {
          user: completeUserData,
        },
        message: "Profile retrieved successfully",
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve profile",
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Validate and sanitize update data
      const allowedFields = [
        'first_name',
        'last_name',
        'phone',
        'city',
        'profile_image',
        'date_of_birth',
        'gender',
        'address',
        'pincode',
        'preferences'
      ];

      const sanitizedData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          sanitizedData[key] = updateData[key];
        }
      });

      // Add updated timestamp
      sanitizedData.updated_at = new Date().toISOString();

      // Update profile
      const updatedProfile = await Profile.createOrUpdate(userId, sanitizedData);

      // Merge with user data for response
      const completeUserData = {
        ...req.user,
        id: updatedProfile.id,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
        role: updatedProfile.role || "user",
        phone: updatedProfile.phone,
        city: updatedProfile.city,
        isActive: updatedProfile.is_active,
        emailVerified: updatedProfile.email_verified,
        profileImage: updatedProfile.profile_image,
        dateOfBirth: updatedProfile.date_of_birth,
        gender: updatedProfile.gender,
        address: updatedProfile.address,
        pincode: updatedProfile.pincode,
        preferences: updatedProfile.preferences,
        createdAt: updatedProfile.created_at,
        updatedAt: updatedProfile.updated_at,
      };

      res.json({
        success: true,
        data: {
          user: completeUserData,
        },
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  }
}

module.exports = UserController;