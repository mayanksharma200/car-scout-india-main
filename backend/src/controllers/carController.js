const Car = require('../models/Car');

class CarController {
  // Get featured cars
  static async getFeaturedCars(req, res) {
    try {
      const cars = await Car.findFeatured(8);
      
      res.json({
        success: true,
        data: cars,
      });
    } catch (error) {
      console.error("Error fetching featured cars:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch featured cars",
      });
    }
  }

  // Get all cars with filters
  static async getAllCars(req, res) {
    try {
      const filters = {
        status: req.query.status,
        brand: req.query.brand,
        model: req.query.model,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice) : undefined,
        city: req.query.city,
        fuel_type: req.query.fuel_type,
        transmission: req.query.transmission,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order,
        limit: req.query.limit,
        offset: req.query.offset
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const cars = await Car.findAll(filters);
      
      res.json({
        success: true,
        data: cars,
        count: cars.length,
        filters: filters
      });
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch cars",
      });
    }
  }

  // Get single car by ID
  static async getCarById(req, res) {
    try {
      const { id } = req.params;
      const car = await Car.findById(id);

      if (!car) {
        return res.status(404).json({
          success: false,
          error: "Car not found",
        });
      }

      res.json({
        success: true,
        data: car,
      });
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch car",
      });
    }
  }

  // Search cars
  static async searchCars(req, res) {
    try {
      const {
        q,
        brand,
        model,
        city,
        fuel_type,
        transmission,
        minPrice,
        maxPrice,
        limit,
        offset
      } = req.query;

      if (!q && !brand && !model && !city) {
        return res.status(400).json({
          success: false,
          error: "Search query or filter parameters are required",
        });
      }

      const filters = {
        brand,
        model,
        city,
        fuel_type,
        transmission,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        limit,
        offset
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const cars = await Car.search(q, filters);

      res.json({
        success: true,
        data: cars,
        count: cars.length,
        query: q,
        filters: filters
      });
    } catch (error) {
      console.error("Error searching cars:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search cars",
      });
    }
  }

  // Advanced search cars
  static async searchAdvancedCars(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: "Search query is required",
        });
      }

      const cars = await Car.search(q, { limit: 50 });

      res.json({
        success: true,
        data: cars,
        count: cars.length,
        query: q
      });
    } catch (error) {
      console.error("Error in advanced search:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search cars",
      });
    }
  }

  // Weighted search cars
  static async searchWeightedCars(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: "Search query is required",
        });
      }

      const cars = await Car.searchWeighted(q);

      res.json({
        success: true,
        data: cars,
        count: cars.length,
        query: q
      });
    } catch (error) {
      console.error("Error in weighted search:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search cars",
      });
    }
  }
}

module.exports = CarController;