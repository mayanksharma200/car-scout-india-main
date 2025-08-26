const { supabase } = require('../config/database');

class Profile {
  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  static async create(profileData) {
    const { data, error } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(userId, updateData) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createOrUpdate(userId, profileData) {
    // First try to get existing profile
    const existingProfile = await this.findByUserId(userId);
    
    if (existingProfile) {
      return await this.update(userId, profileData);
    } else {
      return await this.create({ ...profileData, id: userId });
    }
  }
}

module.exports = Profile;