import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/register");
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
  };
  return (
    // <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
{/* Header */}
<div className="mb-12">
  {/* Back Button - Left aligned */}
  <div className="mb-8">
    <button 
      onClick={handleBackClick}
      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to AutoPulses
    </button>
  </div>

  {/* Main Header Content - Centered */}
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
      <Shield className="w-10 h-10 text-primary" />
    </div>
    
    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
      Privacy Policy
    </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          {/* Information We Collect */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Information We Collect
              </h2>
            </div>

            <h3 className="flex items-center gap-2 text-lg font-medium text-foreground">
              <Users className="w-5 h-5 text-primary" />
              Personal Information
            </h3>
            <p className="text-muted-foreground">
              When you create an account or use our services, we may collect:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>Name, email address, and phone number</li>
              <li>Login credentials and profile information</li>
              <li>Communication preferences and settings</li>
              <li>Location data (with your permission)</li>
            </ul>

            <h3 className="flex items-center gap-2 text-lg font-medium text-foreground mt-6">
              <Eye className="w-5 h-5 text-primary" />
              Usage Information
            </h3>
            <p className="text-muted-foreground">
              We automatically collect information about how you interact with
              our platform:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                Pages visited, features used, and time spent on our platform
              </li>
              <li>Search queries and filter preferences</li>
              <li>Device information and browser type</li>
              <li>IP address and general location information</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                How We Use Your Information
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                • Provide and improve our car listing and comparison services
              </li>
              <li>• Personalize your experience and recommendations</li>
              <li>• Process loan applications and connect you with dealers</li>
              <li>
                • Send important updates and promotional offers (with your
                consent)
              </li>
              <li>• Analyze usage patterns to enhance our platform</li>
              <li>• Ensure security and prevent fraud</li>
              <li>• Comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Information Sharing
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">
              We may share your information with:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                • <strong>Authorized dealers and financial partners</strong>{" "}
                when you request information or apply for loans
              </li>
              <li>
                • <strong>Service providers</strong> who help us operate our
                platform (hosting, analytics, customer support)
              </li>
              <li>
                • <strong>Legal authorities</strong> when required by law or to
                protect our rights
              </li>
              <li>
                • <strong>Business partners</strong> for joint marketing efforts
                (with your explicit consent)
              </li>
            </ul>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <p className="text-accent font-medium m-0">Important:</p>
              </div>
              <p className="text-muted-foreground mt-2 m-0">
                We never sell your personal information to third parties for
                their marketing purposes.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Data Security
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your
              information:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li>• SSL encryption for all data transmission</li>
              <li>• Secure servers and regular security audits</li>
              <li>
                • Limited access to personal information by authorized personnel
                only
              </li>
              <li>• Regular data backups and disaster recovery procedures</li>
              <li>
                • Two-factor authentication options for enhanced account
                security
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Your Privacy Rights
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="space-y-3 text-muted-foreground">
              <li>• Access, update, or delete your personal information</li>
              <li>• Opt-out of promotional communications</li>
              <li>• Request a copy of your data</li>
              <li>• Restrict or object to certain processing activities</li>
              <li>
                • Data portability (receive your data in a structured format)
              </li>
            </ul>

            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at{" "}
              <a
                href="mailto:privacy@autopulses.in"
                className="text-primary hover:underline"
              >
                privacy@autopulses.in
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Cookies and Tracking
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Remember your preferences and settings</li>
              <li>• Analyze website traffic and user behavior</li>
              <li>• Provide personalized content and advertisements</li>
              <li>• Ensure website security and functionality</li>
            </ul>

            <p className="text-muted-foreground mt-4">
              You can control cookie settings through your browser preferences.
              However, disabling certain cookies may affect website
              functionality.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Contact Us
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us:
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>privacy@autopulses.in</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>+91 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>
                  AutoPulses India Pvt Ltd, Mumbai, Maharashtra, India
                </span>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Policy Updates
              </h2>
            </div>

            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or applicable laws. We will notify you of
              any material changes by posting the updated policy on our website
              and updating the "Last updated" date. Your continued use of our
              services after such changes constitutes acceptance of the updated
              policy.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => handleLinkClick("/terms")}
              className="text-primary hover:underline"
            >
              Terms & Conditions
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={() => handleLinkClick("/refund-policy")}
              className="text-primary hover:underline"
            >
              Refund Policy
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={() => handleLinkClick("/disclaimer")}
              className="text-primary hover:underline"
            >
              Disclaimer
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={() => handleLinkClick("/contact")}
              className="text-primary hover:underline"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
