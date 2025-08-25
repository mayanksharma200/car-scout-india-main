import {
  ArrowLeft,
  FileText,
  Scale,
  AlertTriangle,
  Shield,
  Users,
  Car,
  CreditCard,
  Globe,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/register");
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
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
              <Scale className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Terms & Conditions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
              Please read these terms and conditions carefully before using our
              services. By accessing AutoPulses, you agree to be bound by these
              terms.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          {/* Acceptance of Terms */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Acceptance of Terms
              </h2>
            </div>

            <p className="text-muted-foreground">
              By accessing and using the AutoPulses platform ("Service"), you
              accept and agree to be bound by these Terms & Conditions
              ("Terms"). If you do not agree to these Terms, please do not use
              our Service.
            </p>

            <p className="text-muted-foreground">
              These Terms apply to all visitors, users, and others who access or
              use the Service, including but not limited to:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Individual consumers searching for vehicles</li>
              <li>• Registered users with accounts</li>
              <li>• Dealers and automotive professionals</li>
              <li>• Third-party service providers</li>
            </ul>
          </section>

          {/* Use of Service */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Car className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Use of Service
              </h2>
            </div>

            <h3 className="text-lg font-medium text-foreground">
              Permitted Use
            </h3>
            <p className="text-muted-foreground mb-4">
              You may use our Service to:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li>• Browse and search for vehicle listings</li>
              <li>• Compare different vehicles and their specifications</li>
              <li>• Calculate EMI and loan options</li>
              <li>• Read and write vehicle reviews</li>
              <li>• Apply for vehicle loans through our partners</li>
              <li>• Contact dealers for inquiries</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground">
              Prohibited Activities
            </h3>
            <p className="text-muted-foreground mb-4">You agree NOT to:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Use the Service for any illegal or unauthorized purpose</li>
              <li>• Violate any laws in your jurisdiction</li>
              <li>• Transmit any viruses, malware, or harmful code</li>
              <li>• Attempt to gain unauthorized access to our systems</li>
              <li>• Scrape or harvest data without permission</li>
              <li>• Post false or misleading information</li>
              <li>• Harass, abuse, or harm other users</li>
              <li>• Impersonate any person or entity</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                User Accounts
              </h2>
            </div>

            <h3 className="text-lg font-medium text-foreground">
              Account Registration
            </h3>
            <p className="text-muted-foreground mb-4">
              When you create an account with us, you must provide information
              that is accurate, complete, and current at all times. You are
              responsible for safeguarding the password and for maintaining the
              confidentiality of your account.
            </p>

            <h3 className="text-lg font-medium text-foreground">
              Account Responsibilities
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                • You are responsible for all activities that occur under your
                account
              </li>
              <li>
                • You must immediately notify us of any unauthorized use of your
                account
              </li>
              <li>• You must not share your account credentials with others</li>
              <li>• You must keep your contact information updated</li>
            </ul>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <p className="text-accent font-medium m-0">
                  Account Termination:
                </p>
              </div>
              <p className="text-muted-foreground mt-2 m-0">
                We reserve the right to terminate or suspend your account
                immediately, without prior notice, for conduct that we believe
                violates these Terms or is harmful to other users or our
                business.
              </p>
            </div>
          </section>

          {/* Content and Intellectual Property */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Intellectual Property
              </h2>
            </div>

            <h3 className="text-lg font-medium text-foreground">Our Content</h3>
            <p className="text-muted-foreground mb-4">
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of AutoPulses India Pvt
              Ltd and its licensors. The Service is protected by copyright,
              trademark, and other laws.
            </p>

            <h3 className="text-lg font-medium text-foreground">
              User-Generated Content
            </h3>
            <p className="text-muted-foreground mb-4">
              Our Service may allow you to post, link, store, share and
              otherwise make available certain information, text, graphics, or
              other material ("Content"). You are responsible for the Content
              that you post to the Service.
            </p>

            <p className="text-muted-foreground">
              By posting Content to the Service, you grant us the right and
              license to use, modify, publicly perform, publicly display,
              reproduce, and distribute such Content on and through the Service.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Third-Party Services
              </h2>
            </div>

            <h3 className="text-lg font-medium text-foreground">
              Dealer Partnerships
            </h3>
            <p className="text-muted-foreground mb-4">
              We work with authorized dealers and financial institutions to
              facilitate vehicle purchases and loans. While we strive to work
              with reputable partners, we are not responsible for their services
              or actions.
            </p>

            <h3 className="text-lg font-medium text-foreground">
              Financial Services
            </h3>
            <p className="text-muted-foreground mb-4">
              We may connect you with third-party financial institutions for
              loans and insurance. Any financial agreements are between you and
              the financial institution. We do not guarantee loan approval or
              specific terms.
            </p>

            <h3 className="text-lg font-medium text-foreground">
              External Links
            </h3>
            <p className="text-muted-foreground">
              Our Service may contain links to third-party websites or services.
              We do not own or control these third parties and are not
              responsible for their content, privacy policies, or practices.
            </p>
          </section>

          {/* Pricing and Payments */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Pricing and Vehicle Information
              </h2>
            </div>

            <h3 className="text-lg font-medium text-foreground">
              Price Accuracy
            </h3>
            <p className="text-muted-foreground mb-4">
              Vehicle prices, specifications, and availability displayed on our
              platform are provided by dealers and manufacturers. While we
              strive for accuracy, prices and information may change without
              notice.
            </p>

            <h3 className="text-lg font-medium text-foreground">
              No Purchase Guarantee
            </h3>
            <p className="text-muted-foreground">
              Displaying a vehicle on our platform does not guarantee its
              availability for purchase. Final pricing, availability, and
              purchase terms are determined by the dealer or seller.
            </p>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <p className="text-primary font-medium m-0">Important:</p>
              </div>
              <p className="text-muted-foreground mt-2 m-0">
                Always verify pricing, specifications, and availability directly
                with the dealer before making any purchase decisions.
              </p>
            </div>
          </section>

          {/* Disclaimers and Limitation of Liability */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Disclaimers and Limitations
              </h2>
            </div>

            <h3 className="text-lg font-medium text-foreground">
              Service Availability
            </h3>
            <p className="text-muted-foreground mb-4">
              We provide our Service on an "as is" and "as available" basis. We
              do not guarantee that the Service will be uninterrupted, secure,
              or error-free.
            </p>

            <h3 className="text-lg font-medium text-foreground">
              Limitation of Liability
            </h3>
            <p className="text-muted-foreground mb-4">
              To the fullest extent permitted by applicable law, AutoPulses
              India Pvt Ltd shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other
              intangible losses.
            </p>

            <h3 className="text-lg font-medium text-foreground">
              Indemnification
            </h3>
            <p className="text-muted-foreground">
              You agree to defend, indemnify, and hold harmless AutoPulses India
              Pvt Ltd and its licensors, employees, contractors, agents,
              officers and directors, from and against any and all claims,
              damages, obligations, losses, liabilities, costs or debt, and
              expenses (including but not limited to attorney's fees).
            </p>
          </section>

          {/* Termination */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Termination
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">
              We may terminate or suspend your account and bar access to the
              Service immediately, without prior notice or liability, under our
              sole discretion, for any reason whatsoever and without limitation,
              including but not limited to a breach of the Terms.
            </p>

            <p className="text-muted-foreground mb-4">
              If you wish to terminate your account, you may simply discontinue
              using the Service or contact us to delete your account.
            </p>

            <p className="text-muted-foreground">
              Upon termination, your right to use the Service will cease
              immediately. If you wish to terminate your account, you may simply
              discontinue using the Service.
            </p>
          </section>

          {/* Governing Law */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Governing Law
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">
              These Terms shall be interpreted and governed by the laws of
              India, without regard to its conflict of law provisions.
            </p>

            <p className="text-muted-foreground mb-4">
              Our failure to enforce any right or provision of these Terms will
              not be considered a waiver of those rights.
            </p>

            <p className="text-muted-foreground">
              If any provision of these Terms is held to be invalid or
              unenforceable by a court, the remaining provisions of these Terms
              will remain in effect.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Changes to Terms
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days notice prior to any new terms taking
              effect.
            </p>

            <p className="text-muted-foreground">
              What constitutes a material change will be determined at our sole
              discretion. By continuing to access or use our Service after any
              revisions become effective, you agree to be bound by the revised
              terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground m-0">
                Contact Information
              </h2>
            </div>

            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms & Conditions, please
              contact us:
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <FileText className="w-4 h-4 text-primary" />
                <span>legal@autopulses.in</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <FileText className="w-4 h-4 text-primary" />
                <span>+91 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <FileText className="w-4 h-4 text-primary" />
                <span>AutoPulses India Pvt Ltd</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <FileText className="w-4 h-4 text-primary" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => handleLinkClick("/privacy")}
              className="text-primary hover:underline"
            >
              Privacy Policy
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

export default Terms;
