class HealthController {
  // Health check endpoint
  static async healthCheck(req, res) {
    try {
      const IS_PRODUCTION = process.env.NODE_ENV === 'production';
      const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "2.0.0-organized",
        auth: "JWT-based",
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        features: {
          rateLimiting: IS_PRODUCTION,
          secureHeaders: IS_PRODUCTION,
          httpOnlyCookies: IS_PRODUCTION,
          localStorage: IS_DEVELOPMENT,
          organizedStructure: true,
        },
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      });
    }
  }
}

module.exports = HealthController;