import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, User, ArrowRight, TrendingUp, Share2 } from "lucide-react";
import Header from "@/components/Header";
import ShareModal from "@/components/ShareModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";


const News = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hard refresh when navigating from article publish success
  useEffect(() => {
    // Check if we came from publish success modal
    if (location.state?.fromPublish) {
      // Force a hard refresh to fetch latest articles
      window.location.reload();

      // Clear the state after refresh so it doesn't keep refreshing
      // This will execute after the reload completes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);
  const newsArticles = [
    {
      id: 1,
      title: "Maruti Suzuki Launches New Swift with Advanced Safety Features",
      excerpt: "The new generation Swift comes with 6 airbags as standard, enhanced ESP, and improved fuel efficiency of 25 kmpl.",
      image: "/placeholder.svg",
      category: "Launch",
      author: "Automotive Team",
      date: "2025-01-15",
      readTime: "3 min read",
      featured: true
    },
    {
      id: 2,
      title: "Electric Vehicle Sales Surge 300% in India During 2024",
      excerpt: "India's EV market shows unprecedented growth with new government incentives and improved charging infrastructure.",
      image: "/placeholder.svg",
      category: "Market News",
      author: "Industry Analyst",
      date: "2025-01-14",
      readTime: "5 min read",
      featured: false
    },
    {
      id: 3,
      title: "Tata Motors Unveils Nexon EV Max with 500km Range",
      excerpt: "The new Nexon EV Max promises industry-leading range and fast charging capabilities for Indian customers.",
      image: "/placeholder.svg",
      category: "Electric",
      author: "EV Specialist",
      date: "2025-01-13",
      readTime: "4 min read",
      featured: false
    },
    {
      id: 4,
      title: "Hyundai Creta Facelift: First Look and Expected Features",
      excerpt: "Spy shots reveal significant design changes and new technology features in the upcoming Creta facelift.",
      image: "/placeholder.svg",
      category: "Spy Shots",
      author: "Auto Reporter",
      date: "2025-01-12",
      readTime: "3 min read",
      featured: false
    },
    {
      id: 5,
      title: "BS7 Emission Norms: What It Means for Car Buyers",
      excerpt: "New emission standards expected to increase vehicle prices but improve air quality across Indian cities.",
      image: "/placeholder.svg",
      category: "Policy",
      author: "Policy Expert",
      date: "2025-01-11",
      readTime: "6 min read",
      featured: false
    },
    {
      id: 6,
      title: "Mahindra XUV400 EV: Comprehensive Review and Road Test",
      excerpt: "Our detailed review of Mahindra's compact electric SUV covering performance, features, and value proposition.",
      image: "/placeholder.svg",
      category: "Review",
      author: "Road Test Team",
      date: "2025-01-10",
      readTime: "8 min read",
      featured: false
    }
  ];

  const categories = ["All", "Launch", "Market News", "Electric", "Spy Shots", "Policy", "Review"];
  const trendingTopics = ["Electric Vehicles", "Maruti Swift", "Tata Nexon", "Hyundai Creta", "BS7 Norms"];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredArticle = newsArticles.find(article => article.featured);
  const regularArticles = newsArticles.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Automotive News & Updates
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest car launches, industry news, reviews, and market insights from India's automotive sector.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Article */}
            {featuredArticle && (
              <Card className="mb-8 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-video md:aspect-auto">
                    <img 
                      src={featuredArticle.image} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                      <Badge variant="outline">{featuredArticle.category}</Badge>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3 line-clamp-2">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{featuredArticle.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(featuredArticle.date)}</span>
                        </div>
                        <span>{featuredArticle.readTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShareModal
                          title={featuredArticle.title}
                          description={featuredArticle.excerpt}
                          url={`/news/${featuredArticle.id}`}
                          image={featuredArticle.image}
                        >
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </ShareModal>
                        <Button variant="ghost" className="group">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Regular Articles */}
            <div className="grid md:grid-cols-2 gap-6">
              {regularArticles.map((article) => (
                <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShareModal
                          title={article.title}
                          description={article.excerpt}
                          url={`/news/${article.id}`}
                          image={article.image}
                        >
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </ShareModal>
                        <span className="text-xs text-muted-foreground">{article.readTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Load More Articles
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <span className="font-medium">{topic}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card>
              <CardHeader>
                <CardTitle>Stay Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest automotive news and updates delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button className="w-full bg-gradient-accent hover:opacity-90">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Popular This Week */}
            <Card>
              <CardHeader>
                <CardTitle>Popular This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsArticles.slice(0, 3).map((article, index) => (
                    <div key={article.id} className="flex gap-3 cursor-pointer group">
                      <div className="flex-shrink-0 w-16 h-12 bg-muted rounded overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(article.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default News;