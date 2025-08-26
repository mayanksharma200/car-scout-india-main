const { supabase } = require('../config/database');

class Car {
  static async findFeatured(limit = 8) {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async findAll(filters = {}) {
    let query = supabase
      .from("cars")
      .select("*")
      .eq("status", "active");

    // Apply filters
    if (filters.brand) {
      query = query.ilike("brand", `%${filters.brand}%`);
    }
    if (filters.model) {
      query = query.ilike("model", `%${filters.model}%`);
    }
    if (filters.minPrice) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }
    if (filters.fuel_type) {
      query = query.eq("fuel_type", filters.fuel_type);
    }
    if (filters.transmission) {
      query = query.eq("transmission", filters.transmission);
    }

    // Sorting
    if (filters.sort_by) {
      const ascending = filters.sort_order === 'asc';
      query = query.order(filters.sort_by, { ascending });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Pagination
    const limit = Math.min(parseInt(filters.limit) || 20, 100);
    const offset = parseInt(filters.offset) || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async search(searchQuery, filters = {}) {
    let query = supabase
      .from("cars")
      .select("*")
      .eq("status", "active");

    // Text search
    if (searchQuery) {
      query = query.or(`brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
    }

    // Apply additional filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'limit' && key !== 'offset') {
        if (key === 'minPrice') {
          query = query.gte("price", filters[key]);
        } else if (key === 'maxPrice') {
          query = query.lte("price", filters[key]);
        } else {
          query = query.ilike(key, `%${filters[key]}%`);
        }
      }
    });

    const limit = Math.min(parseInt(filters.limit) || 20, 100);
    const offset = parseInt(filters.offset) || 0;
    
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async searchWeighted(searchQuery) {
    // Weighted search implementation
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("status", "active")
      .or(`brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
      .order("price", { ascending: true })
      .limit(50);

    if (error) throw error;
    return data || [];
  }
}

module.exports = Car;