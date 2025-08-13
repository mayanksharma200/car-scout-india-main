import { Car, Plus, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CompareSection = () => {
  const popularComparisons = [
    {
      car1: { brand: "Maruti", model: "Swift", price: "₹6.49 L", rating: 4.2 },
      car2: { brand: "Hyundai", model: "i20", price: "₹7.04 L", rating: 4.4 },
      comparisons: "12.5k comparisons"
    },
    {
      car1: { brand: "Tata", model: "Nexon", price: "₹8.09 L", rating: 4.5 },
      car2: { brand: "Hyundai", model: "Venue", price: "₹7.94 L", rating: 4.3 },
      comparisons: "9.8k comparisons"
    },
    {
      car1: { brand: "Mahindra", model: "XUV700", price: "₹13.99 L", rating: 4.6 },
      car2: { brand: "Tata", model: "Harrier", price: "₹15.49 L", rating: 4.4 },
      comparisons: "7.2k comparisons"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Compare Cars Side by Side
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Make informed decisions with detailed car comparisons. Compare specifications, 
            features, prices, and more to find the perfect car for your needs.
          </p>
        </div>

        {/* Comparison Builder */}
        <Card className="mb-12 shadow-auto-md border-border">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Car className="w-6 h-6 text-primary" />
              Build Your Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 items-center">
              {/* Car 1 Selector */}
              <div className="text-center">
                <div className="w-full h-32 bg-muted/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center mb-4 hover:border-primary transition-colors cursor-pointer group">
                  <div className="text-center group-hover:text-primary transition-colors">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Select First Car</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Choose Car
                </Button>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary-foreground">VS</span>
                </div>
              </div>

              {/* Car 2 Selector */}
              <div className="text-center">
                <div className="w-full h-32 bg-muted/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center mb-4 hover:border-primary transition-colors cursor-pointer group">
                  <div className="text-center group-hover:text-primary transition-colors">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Select Second Car</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Choose Car
                </Button>
              </div>
            </div>

            <div className="text-center mt-6">
              <Button className="bg-gradient-accent hover:opacity-90 shadow-auto-md">
                Start Comparison
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Comparisons */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Popular Comparisons
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {popularComparisons.map((comparison, index) => (
              <Card key={index} className="group hover:shadow-auto-lg transition-all duration-300 hover:-translate-y-2 hover-scale cursor-pointer border-border animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {/* Car 1 */}
                    <div className="text-center flex-1">
                      <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {comparison.car1.brand} {comparison.car1.model}
                      </h4>
                      <p className="text-accent font-semibold">{comparison.car1.price}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span className="text-sm">{comparison.car1.rating}</span>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="mx-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">VS</span>
                      </div>
                    </div>

                    {/* Car 2 */}
                    <div className="text-center flex-1">
                      <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {comparison.car2.brand} {comparison.car2.model}
                      </h4>
                      <p className="text-accent font-semibold">{comparison.car2.price}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span className="text-sm">{comparison.car2.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">{comparison.comparisons}</p>
                    <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      View Comparison
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            View All Comparisons
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CompareSection;