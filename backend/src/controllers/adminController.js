const { supabase } = require('../config/database');

class AdminController {
  // Get admin statistics
  static async getStats(req, res) {
    try {
      // Get car statistics
      const { data: carStats, error: carError } = await supabase
        .from("cars")
        .select("status")
        .eq("status", "active");

      if (carError) throw carError;

      // Get lead statistics
      const { data: leadStats, error: leadError } = await supabase
        .from("leads")
        .select("status, created_at");

      if (leadError && leadError.code !== "PGRST116") throw leadError;

      // Get user statistics
      const { data: userStats, error: userError } = await supabase
        .from("profiles")
        .select("role, created_at, is_active");

      if (userError && userError.code !== "PGRST116") throw userError;

      // Calculate statistics
      const stats = {
        cars: {
          total: carStats ? carStats.length : 0,
          active: carStats ? carStats.filter(car => car.status === 'active').length : 0,
        },
        leads: {
          total: leadStats ? leadStats.length : 0,
          new: leadStats ? leadStats.filter(lead => lead.status === 'new').length : 0,
          contacted: leadStats ? leadStats.filter(lead => lead.status === 'contacted').length : 0,
          qualified: leadStats ? leadStats.filter(lead => lead.status === 'qualified').length : 0,
          converted: leadStats ? leadStats.filter(lead => lead.status === 'converted').length : 0,
          thisMonth: leadStats ? leadStats.filter(lead => {
            const leadDate = new Date(lead.created_at);
            const now = new Date();
            return leadDate.getMonth() === now.getMonth() && 
                   leadDate.getFullYear() === now.getFullYear();
          }).length : 0,
        },
        users: {
          total: userStats ? userStats.length : 0,
          active: userStats ? userStats.filter(user => user.is_active).length : 0,
          admins: userStats ? userStats.filter(user => user.role === 'admin').length : 0,
          thisMonth: userStats ? userStats.filter(user => {
            const userDate = new Date(user.created_at);
            const now = new Date();
            return userDate.getMonth() === now.getMonth() && 
                   userDate.getFullYear() === now.getFullYear();
          }).length : 0,
        },
        overview: {
          timestamp: new Date().toISOString(),
          period: 'all_time'
        }
      };

      res.json({
        success: true,
        data: stats,
        message: "Admin statistics retrieved successfully",
      });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve admin statistics",
      });
    }
  }

  // Get recent activity (admin only)
  static async getRecentActivity(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);

      // Get recent leads
      const { data: recentLeads, error: leadsError } = await supabase
        .from("leads")
        .select("id, name, email, status, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (leadsError) throw leadsError;

      // Get recent user registrations
      const { data: recentUsers, error: usersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (usersError && usersError.code !== "PGRST116") throw usersError;

      res.json({
        success: true,
        data: {
          recentLeads: recentLeads || [],
          recentUsers: recentUsers || [],
        },
        message: "Recent activity retrieved successfully",
      });
    } catch (error) {
      console.error("Get recent activity error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve recent activity",
      });
    }
  }

  // Get system health (admin only)
  static async getSystemHealth(req, res) {
    try {
      const health = {
        database: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
      };

      // Test database connection
      const { error: dbError } = await supabase
        .from("cars")
        .select("id")
        .limit(1);

      if (dbError) {
        health.database = 'unhealthy';
        health.databaseError = dbError.message;
      }

      res.json({
        success: true,
        data: health,
        message: "System health retrieved successfully",
      });
    } catch (error) {
      console.error("Get system health error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve system health",
      });
    }
  }
}

module.exports = AdminController;