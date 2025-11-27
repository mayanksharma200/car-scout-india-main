import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, User, ArrowRight, TrendingUp, Share2 } from "lucide-react";
import Header from "@/components/Header";
import ShareModal from "@/components/ShareModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { useContent } from "@/hooks/useSupabaseData";


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
  const { content: newsArticles, loading } = useContent();

  const categories = ["All", "Launch", "Market News", "Electric", "Spy Shots", "Policy", "Review"];
  const trendingTopics = ["Electric Vehicles", "Maruti Swift", "Tata Nexon", "Hyundai Creta", "BS7 Norms"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredArticle = newsArticles.find(article => article.is_featured);
  const regularArticles = newsArticles.filter(article => !article.is_featured);

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
                  <div className="relative h-64 md:h-full">
                    <img
                      src={featuredArticle.image_url || "/placeholder.svg"}
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
                          <span>{formatDate(featuredArticle.created_at)}</span>
                          <span className="mx-2">•</span>
                          <span>{Math.ceil((featuredArticle.content?.length || 0) / 1000)} min read</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShareModal
                          title={featuredArticle.title}
                          url={`${window.location.origin}/news/${featuredArticle.slug}`}
                          image={featuredArticle.image_url || "/placeholder.svg"}
                          description={featuredArticle.excerpt}
                        >
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </ShareModal>
                        <Button variant="ghost" className="group" onClick={() => navigate(`/news/${featuredArticle.slug}`)}>
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
                <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => navigate(`/news/${article.slug}`)}>
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image_url || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
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
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(article.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div onClick={(e) => e.stopPropagation()}>
                          <ShareModal
                            title={article.title}
                            description={article.excerpt}
                            url={`${window.location.origin}/news/${article.slug}`}
                            image={article.image_url || "/placeholder.svg"}
                          >
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </ShareModal>
                        </div>
                        <span className="text-xs text-muted-foreground">{Math.ceil((article.content?.length || 0) / 1000)} min read</span>
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
                    <div key={article.id} className="flex gap-3 cursor-pointer group" onClick={() => navigate(`/news/${article.slug}`)}>
                      <img
                        src={article.image_url || "/placeholder.svg"}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">{article.category}</Badge>
                        <h4 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <span>{Math.ceil((article.content?.length || 0) / 1000)} min read</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default News;