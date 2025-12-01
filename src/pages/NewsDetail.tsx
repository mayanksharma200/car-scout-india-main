import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, User, ArrowLeft, Share2, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShareModal from "@/components/ShareModal";
import { toast } from "@/components/ui/use-toast";
import { newsAPI } from "@/services/api";

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
    const lastFetchedSlug = useRef<string | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) return;

            // Prevent double fetching
            if (lastFetchedSlug.current === slug) {
                return;
            }
            lastFetchedSlug.current = slug;

            try {
                setLoading(true);
                const response = await newsAPI.getBySlug(slug);

                if (response.success && response.data) {
                    setArticle(response.data);
                } else {
                    toast({
                        title: "Error",
                        description: "Article not found",
                        variant: "destructive",
                    });
                    navigate("/news");
                }
            } catch (error: any) {
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
    }, [slug, navigate]);

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

                        <div className="flex items-center justify-between border-b pb-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-muted-foreground">
                                    <User className="w-4 h-4 mr-2" />
                                    {article.author}
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {formatDate(article.created_at)}
                                </div>
                            </div>
                            <ShareModal
                                title={article.title}
                                url={window.location.href}
                                description={article.excerpt}
                                dialogTitle="Share this article"
                            >
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </Button>
                            </ShareModal>
                        </div>

                        <div className="relative h-[400px] w-full mb-10 rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={article.image_url || "/placeholder.svg"}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none dark:prose-invert">
                            {(() => {
                                try {
                                    // Try to parse content as JSON for structured data
                                    const structuredContent = JSON.parse(article.content);

                                    if (structuredContent.sections || structuredContent.keyHighlights) {
                                        return (
                                            <div className="space-y-8">
                                                {/* Introduction */}
                                                {structuredContent.introduction && (
                                                    <div className="text-xl leading-relaxed text-muted-foreground">
                                                        {structuredContent.introduction}
                                                    </div>
                                                )}

                                                {/* Key Highlights */}
                                                {structuredContent.keyHighlights && structuredContent.keyHighlights.length > 0 && (
                                                    <div className="bg-muted/30 p-6 rounded-xl border border-border">
                                                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                                                            {/* <span className="bg-primary/10 text-primary p-1 rounded mr-2">✨</span> */}
                                                            Summary Highlights
                                                        </h3>
                                                        <ul className="space-y-2">
                                                            {structuredContent.keyHighlights.map((highlight: string, idx: number) => (
                                                                <li key={idx} className="flex items-start">
                                                                    <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                                    <span>{highlight}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Sections */}
                                                {structuredContent.sections && structuredContent.sections.map((section: any, idx: number) => (
                                                    <div key={idx} className="space-y-4">
                                                        {section.heading && (
                                                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                                                                {section.heading}
                                                            </h2>
                                                        )}
                                                        {section.body && (
                                                            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                                {section.body}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                } catch (e) {
                                    // If parsing fails, treat as plain text (legacy content)
                                }

                                // Fallback for plain text content
                                return (
                                    <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                        {article.content}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </article>
            </div>

            <Footer />
        </div>
    );
};

export default NewsDetail;
