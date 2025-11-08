import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
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
              Refund Policy
            </h1>
            <p className="text-muted-foreground">Last updated: January 2024</p>
          </div>

          <div className="prose prose-gray max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">General Policy</h2>
              <p className="mb-4">
                Carlist360 is primarily an information and comparison platform
                for automobiles. As we do not directly sell vehicles, this
                refund policy applies to any premium services or subscriptions
                offered on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Premium Services</h2>
              <p className="mb-4">
                If you have purchased any premium services from Carlist360, you
                may be eligible for a refund under the following conditions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Refund requests must be made within 7 days of purchase</li>
                <li>Services must not have been extensively used</li>
                <li>
                  Refunds will be processed to the original payment method
                </li>
                <li>Processing time: 5-7 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Non-Refundable Items
              </h2>
              <p className="mb-4">
                The following items are not eligible for refunds:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Free services and features</li>
                <li>Services used beyond the trial period</li>
                <li>Third-party services facilitated through our platform</li>
                <li>Downloadable content that has been accessed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                How to Request a Refund
              </h2>
              <p className="mb-4">To request a refund, please:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our customer support team</li>
                <li>Provide your order/transaction ID</li>
                <li>Specify the reason for the refund request</li>
                <li>Allow 2-3 business days for review</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Vehicle Purchases</h2>
              <p className="mb-4">
                Carlist360 does not directly facilitate vehicle sales. Any
                vehicle purchase transactions are between you and the respective
                dealer/seller. Refund policies for vehicle purchases are
                governed by the dealer's terms and conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Loan and Insurance Services
              </h2>
              <p className="mb-4">
                For loan applications and insurance policies initiated through
                our platform, refund policies are governed by the respective
                financial institutions. Carlist360 facilitates these services
                but does not control their refund terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="mb-4">
                For refund requests or questions about this policy, please
                contact us:
              </p>
              <p>Email: refunds@Carlist360.com</p>
              <p>Phone: +91 1800-123-4567</p>
              <p>Hours: Monday-Friday, 9:00 AM - 6:00 PM IST</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
