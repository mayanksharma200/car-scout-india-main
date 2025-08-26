const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  static async create(userData) {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const { data, error } = await supabase
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id, updateData) {
    // Hash password if being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateRefreshToken(id, refreshToken, expiresAt) {
    const { error } = await supabase
      .from("users")
      .update({ 
        refresh_token: refreshToken,
        refresh_token_expires_at: expiresAt
      })
      .eq("id", id);

    if (error) throw error;
  }

  static async clearRefreshToken(id) {
    const { error } = await supabase
      .from("users")
      .update({ 
        refresh_token: null,
        refresh_token_expires_at: null
      })
      .eq("id", id);

    if (error) throw error;
  }

  static async findByRefreshToken(refreshToken) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("refresh_token", refreshToken)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
}

module.exports = User;