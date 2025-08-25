import React from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { useAds } from "@/hooks/useAds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdTestPage: React.FC = () => {
  const { availableSlots, currentPath } = useAds();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            Advertisement System Test
          </h1>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            This page demonstrates the advertisement system implementation
            across different pages with responsive design.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Page Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Current Path:</strong> {location.pathname}
                  </p>
                  <p>
                    <strong>Mapped Path:</strong> {currentPath}
                  </p>
                  <p>
                    <strong>Available Ad Slots:</strong> {availableSlots.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Advertisement Placements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate mr-2">{slot.placement}</span>
                      <div className="flex gap-1 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {slot.size[0]}x{slot.size[1]}
                        </Badge>
                        {slot.mobileSize && (
                          <Badge variant="secondary" className="text-xs">
                            Mobile: {slot.mobileSize[0]}x{slot.mobileSize[1]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {availableSlots.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No ads configured for this page
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test different page layouts */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Homepage Layout Test
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 md:p-6 rounded-lg text-center">
                <h3 className="text-base md:text-lg font-medium">
                  Hero Section
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Main banner content goes here
                </p>
              </div>

              <AdBanner placement="below_hero" />

              <div className="bg-green-50 p-4 md:p-6 rounded-lg text-center">
                <h3 className="text-base md:text-lg font-medium">Brand Grid</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Car brands would be displayed here
                </p>
              </div>

              <AdBanner placement="between_brands_1" />

              <div className="bg-yellow-50 p-4 md:p-6 rounded-lg text-center">
                <h3 className="text-base md:text-lg font-medium">
                  Featured Cars
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Featured car listings
                </p>
              </div>

              <AdBanner placement="between_brands_2" />

              <div className="bg-purple-50 p-4 md:p-6 rounded-lg text-center">
                <h3 className="text-base md:text-lg font-medium">
                  Compare Section & EMI Calculator
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Interactive tools
                </p>
              </div>

              <AdBanner placement="above_footer" />
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Search Results Layout Test
            </h2>
            <div className="block md:flex gap-6">
              {/* Mobile: Stack vertically, Desktop: Side by side */}
              <div className="w-full md:w-80 mb-6 md:mb-0">
                <div className="bg-red-50 p-4 rounded-lg text-center mb-4">
                  <h3 className="text-base md:text-lg font-medium">
                    Filter Sidebar
                  </h3>
                </div>
                <AdBanner placement="left_sidebar" />
              </div>

              <div className="flex-1">
                <AdBanner placement="below_navigation" />
                <div className="bg-orange-50 p-4 md:p-6 rounded-lg text-center mb-4">
                  <h3 className="text-base md:text-lg font-medium">
                    Search Results
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Car listings would appear here
                  </p>
                </div>
                <AdBanner placement="below_results" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Car Details Layout Test
            </h2>
            <div className="space-y-6">
              <AdBanner placement="below_navigation" />

              <div className="bg-indigo-50 p-4 md:p-6 rounded-lg text-center">
                <h3 className="text-base md:text-lg font-medium">
                  Car Images & Basic Info
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-pink-50 p-4 md:p-6 rounded-lg text-center">
                  <h3 className="text-base md:text-lg font-medium">
                    Get Best Price
                  </h3>
                </div>
                <AdBanner placement="between_tiles" />
                <div className="bg-teal-50 p-4 md:p-6 rounded-lg text-center">
                  <h3 className="text-base md:text-lg font-medium">
                    EMI Calculator
                  </h3>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Responsiveness Info */}
          <section className="bg-gray-50 p-4 md:p-6 rounded-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Mobile Responsiveness Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Desktop Ads (≥768px)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Standard banner: 728×90px</li>
                  <li>• Sidebar ads: 300×250px</li>
                  <li>• Full width display</li>
                  <li>• Side-by-side layouts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mobile Ads (&lt;768px)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Mobile banner: 320×50px</li>
                  <li>• Sidebar ads hidden or stacked</li>
                  <li>• Centered with padding</li>
                  <li>• Responsive sizing</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdTestPage;
