import {
  Car,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import AutoPulsesLogo from "@/assets/AutoPulses-logo.png";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={AutoPulsesLogo}
                alt="AutoPulses"
                className="w-20 h-20 object-contain"
              />
              <h3 className="text-xl font-bold text-foreground">AutoPulses</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              India's premier car marketplace. Find your perfect car with
              detailed specifications, expert reviews, and comprehensive
              comparisons.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/cars"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  New Cars
                </Link>
              </li>
              <li>
                <Link
                  to="/compare"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Compare Cars
                </Link>
              </li>
              <li>
                <Link
                  to="/emi-calculator"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  EMI Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Car News
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/loan-application"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Car Loan
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Car Insurance
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Car Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Sell Your Car
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Car Valuation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  +91 1800-123-4567
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  support@AutoPulses.com
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <span className="text-muted-foreground text-sm">
                  123 Business Park,
                  <br />
                  Mumbai, Maharashtra 400001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            {/* Legal Links */}
            <div className="flex flex-wrap gap-6">
              <Link
                to="/privacy-policy"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-conditions"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/disclaimer"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Disclaimer
              </Link>
              <Link
                to="/refund-policy"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Refund Policy
              </Link>
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Contact Us
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-muted-foreground text-sm">
              © 2024 AutoPulses. All rights reserved.
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-muted-foreground text-xs leading-relaxed text-center">
              <strong>Disclaimer:</strong> All trademarks, logos, and brand
              names are the property of their respective owners. This site is
              for informational purposes only and does not claim any affiliation
              or ownership rights over any car brands or models displayed. The
              information provided is for general guidance and may not reflect
              the most current specifications or pricing. Please verify all
              details with authorized dealers before making any purchasing
              decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
