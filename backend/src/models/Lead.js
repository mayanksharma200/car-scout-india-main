const { supabase } = require('../config/database');

class Lead {
  static async create(leadData) {
    const { data, error } = await supabase
      .from("leads")
      .insert({
        ...leadData,
        created_at: new Date().toISOString(),
        status: 'new'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async findAll(filters = {}) {
    let query = supabase
      .from("leads")
      .select("*");

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateStatus(id, status) {
    const { data, error } = await supabase
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = Lead;