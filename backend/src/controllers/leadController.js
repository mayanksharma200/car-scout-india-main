const Lead = require('../models/Lead');

class LeadController {
  // Create new lead
  static async createLead(req, res) {
    try {
      const {
        name,
        email,
        phone,
        interested_car_id,
        budget_min,
        budget_max,
        city,
        timeline,
        message
      } = req.body;

      // Validate required fields
      if (!name || !email || !phone) {
        return res.status(400).json({
          success: false,
          error: "Name, email, and phone are required",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
        });
      }

      // Validate phone format (basic validation)
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          error: "Invalid phone format",
        });
      }

      // Create lead data
      const leadData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        interested_car_id,
        budget_min: budget_min ? parseInt(budget_min) : null,
        budget_max: budget_max ? parseInt(budget_max) : null,
        city: city?.trim(),
        timeline: timeline?.trim(),
        message: message?.trim(),
        source: 'website',
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent'),
        user_id: req.user?.id || null, // If user is logged in
      };

      // Create the lead
      const newLead = await Lead.create(leadData);

      // Log the lead creation
      console.log(`New lead created: ${newLead.id} from ${email}`);

      // Send response (don't include sensitive data)
      res.status(201).json({
        success: true,
        data: {
          id: newLead.id,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          status: newLead.status,
          created_at: newLead.created_at
        },
        message: "Lead submitted successfully. We'll contact you soon!",
      });

      // TODO: Send notification email to admin/sales team
      // TODO: Send confirmation email to customer
      
    } catch (error) {
      console.error("Create lead error:", error);
      
      // Handle specific errors
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({
          success: false,
          error: "A lead with this email already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to submit lead",
      });
    }
  }

  // Get all leads (admin only)
  static async getAllLeads(req, res) {
    try {
      const filters = {
        status: req.query.status,
        city: req.query.city,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const leads = await Lead.findAll(filters);

      res.json({
        success: true,
        data: leads,
        count: leads.length,
        filters: filters
      });
    } catch (error) {
      console.error("Get leads error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve leads",
      });
    }
  }

  // Get single lead by ID (admin only)
  static async getLeadById(req, res) {
    try {
      const { id } = req.params;
      const lead = await Lead.findById(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: "Lead not found",
        });
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error("Get lead error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve lead",
      });
    }
  }

  // Update lead status (admin only)
  static async updateLeadStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status. Valid statuses: " + validStatuses.join(', '),
        });
      }

      const updatedLead = await Lead.updateStatus(id, status);

      res.json({
        success: true,
        data: updatedLead,
        message: "Lead status updated successfully",
      });
    } catch (error) {
      console.error("Update lead status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update lead status",
      });
    }
  }
}

module.exports = LeadController;