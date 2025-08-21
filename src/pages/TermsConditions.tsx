import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground">Last updated: January 2024</p>
          </div>

          <div className="prose prose-gray max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using AutoPulses's services, you accept and
                agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of the
                materials on AutoPulses's website for personal, non-commercial
                transitory viewing only.
              </p>
              <p className="mb-4">
                This license shall automatically terminate if you violate any of
                these restrictions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
              <p className="mb-4">
                The materials on AutoPulses's website are provided on an 'as is'
                basis. AutoPulses makes no warranties, expressed or implied, and
                hereby disclaims and negates all other warranties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
              <p className="mb-4">
                In no event shall AutoPulses or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on AutoPulses's website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
              <p className="mb-4">
                When you create an account with us, you must provide information
                that is accurate, complete, and current at all times.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You are responsible for safeguarding your account credentials
                </li>
                <li>You must notify us immediately of any unauthorized use</li>
                <li>
                  We reserve the right to suspend or terminate accounts that
                  violate these terms
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
              <p className="mb-4">You may not use our service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  For any unlawful purpose or to solicit others to perform
                  unlawful acts
                </li>
                <li>
                  To violate any international, federal, provincial, or state
                  regulations, rules, laws, or local ordinances
                </li>
                <li>
                  To transmit, or procure the sending of, any advertising or
                  promotional material without our prior written consent
                </li>
                <li>
                  To impersonate or attempt to impersonate the company, a
                  company employee, another user, or any other person or entity
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Contact Information
              </h2>
              <p className="mb-4">
                If you have any questions about these Terms and Conditions,
                please contact us at:
              </p>
              <p>Email: legal@AutoPulses.com</p>
              <p>Phone: +91 1800-123-4567</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
