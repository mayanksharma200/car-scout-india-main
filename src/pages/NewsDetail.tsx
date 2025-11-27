import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, User, ArrowLeft, Share2, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShareModal from "@/components/ShareModal";
import { toast } from "@/components/ui/use-toast";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";

interface NewsArticle {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    image_url: string;
    category: string;
    author: string;
    created_at: string;
    slug: string;
    views: number;
}

const NewsDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const api = useAuthenticatedApi();

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) return;

            try {
                setLoading(true);
                const data = await api.news.getBySlug(slug);

                if (data) {
                    setArticle(data);
                } else {
                    toast({
                        title: "Error",
                        description: "Article not found",
                        variant: "destructive",
                    });
                    navigate("/news");
                }
            } catch (error) {
                console.error("Error fetching article:", error);
                toast({
                    title: "Error",
                    description: "Failed to load article",
                    variant: "destructive",
                });
                navigate("/news");
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug, navigate, api]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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

    if (!article) return null;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-6 hover:bg-transparent pl-0"
                    onClick={() => navigate("/news")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to News
                </Button>

                <article className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Badge className="mb-4">{article.category}</Badge>
                        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-b border-border pb-8">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium text-foreground">{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(article.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{Math.ceil((article.content?.length || 0) / 1000)} min read</span>
                            </div>
                            <div className="ml-auto">
                                <ShareModal
                                    title={article.title}
                                    url={window.location.href}
                                    image={article.image_url}
                                    description={article.excerpt}
                                >
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </Button>
                                </ShareModal>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
                        <img
                            src={article.image_url || "/placeholder.svg"}
                            alt={article.title}
                            className="w-full h-auto object-cover max-h-[600px]"
                        />
                    </div>

                    <div className="prose prose-lg max-w-none dark:prose-invert">
                        <p className="text-xl text-muted-foreground leading-relaxed mb-8 font-medium">
                            {article.excerpt}
                        </p>
                        <div className="whitespace-pre-wrap leading-relaxed">
                            {article.content}
                        </div>
                    </div>
                </article>
            </div>

            <Footer />
        </div>
    );
};

export default NewsDetail;
