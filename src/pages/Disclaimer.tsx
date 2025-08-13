import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Disclaimer = () => {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Disclaimer</h1>
            <p className="text-muted-foreground">Last updated: January 2024</p>
          </div>

          <div className="prose prose-gray max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Information Accuracy</h2>
              <p className="mb-4">
                The information on this website is provided on an "as-is" basis. To the fullest extent 
                permitted by law, AutoScope excludes all representations, warranties, obligations, and 
                liabilities arising out of or in connection with the information provided.
              </p>
              <p className="mb-4">
                While we strive to keep the information up to date and correct, we make no representations 
                or warranties of any kind, express or implied, about the completeness, accuracy, reliability, 
                suitability, or availability of the website or the information contained on the website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Vehicle Information</h2>
              <p className="mb-4">
                All vehicle specifications, features, prices, and availability information is provided by 
                manufacturers and dealers. AutoScope is not responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accuracy of vehicle specifications or pricing</li>
                <li>Changes in vehicle features or specifications by manufacturers</li>
                <li>Availability of specific models or variants</li>
                <li>Variations in actual vehicle appearance from images displayed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Third-Party Content</h2>
              <p className="mb-4">
                Our website may contain links to third-party websites or services that are not owned 
                or controlled by AutoScope. We have no control over, and assume no responsibility for 
                the content, privacy policies, or practices of any third-party websites or services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Financial Services</h2>
              <p className="mb-4">
                AutoScope facilitates connections with financial institutions for loans and insurance. 
                We are not responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loan approval or rejection decisions</li>
                <li>Interest rates or terms offered by lenders</li>
                <li>Insurance policy terms and conditions</li>
                <li>Claims processing or disputes with financial institutions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="mb-4">
                In no event will AutoScope, its directors, employees, partners, agents, suppliers, 
                or affiliates be liable for any indirect, incidental, special, consequential, or 
                punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Professional Advice</h2>
              <p className="mb-4">
                The information provided on this website is for general informational purposes only 
                and should not be considered as professional financial, legal, or automotive advice. 
                Always consult with qualified professionals before making important decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Trademark Notice</h2>
              <p className="mb-4">
                All trademarks, logos, and brand names mentioned on this website are the property 
                of their respective owners. AutoScope does not claim any ownership or affiliation 
                with these brands unless explicitly stated.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="mb-4">
                If you have any questions about this disclaimer, please contact us at:
              </p>
              <p>Email: legal@autoscope.com</p>
              <p>Phone: +91 1800-123-4567</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Disclaimer;