import { useState, useEffect } from "react";
import { useContent } from "@/hooks/useSupabaseData";
import { useAdminAuthenticatedApi } from "@/hooks/useAdminAuthenticatedApi";
import { Plus, Minus, RefreshCw, Download, Upload, Eye, Edit, Trash2, Calendar, Globe, Image, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

const ContentManagement = () => {
  const { toast } = useToast();
  const { content: allContent, addContent: addContentToDb, loading, refetch } = useContent();
  const api = useAdminAuthenticatedApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [contentFilter, setContentFilter] = useState("all");
  const [isApiSyncOpen, setIsApiSyncOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiProvider, setApiProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [adminNews, setAdminNews] = useState<any[]>([]);

  // New state for structured content builder
  const [contentSections, setContentSections] = useState([{ id: Date.now().toString(), heading: '', body: '' }]);
  const [keyHighlights, setKeyHighlights] = useState(['']);

  // Image Upload State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Trending Topics State
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [isTrendingTopicsOpen, setIsTrendingTopicsOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", articleSlug: "" });

  useEffect(() => {
    const fetchAdminNews = async () => {
      try {
        const response = await api.news.getAllAdmin();
        if (response.success) {
          // Transform API response to match Content interface
          const transformedNews = response.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: 'news',
            status: item.status,
            lastModified: new Date(item.created_at).toLocaleDateString(),
            views: item.views || 0,
            slug: item.slug,
            content: item.content,
            excerpt: item.excerpt,
            image_url: item.image_url,
            author: item.author,
            category: item.category
          }));
          setAdminNews(transformedNews);
        }
      } catch (error) {
        console.error("Failed to fetch admin news:", error);
      }
    };

    const fetchTrendingTopics = async () => {
      try {
        const response = await api.trendingTopics.getAll();
        if (response.success) {
          setTrendingTopics(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch trending topics:", error);
      }
    };

    fetchAdminNews();
    fetchTrendingTopics();
  }, [api, refetch]);

  // Add Content Dialog States
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [newContent, setNewContent] = useState({
    title: "",
    type: "news",
    status: "draft",
    description: "",
    price: "",
    brand: "",
    model: "",
    category: "",
    author: "",
    slug: "",
    content: "",
    excerpt: "",
    image_url: ""
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center">
          <div>Loading content...</div>
        </div>
      </AdminLayout>
    );
  }
  const carContent = allContent.filter(item => item.type === 'car');
  // Use adminNews instead of allContent for news to ensure we see drafts (bypassing RLS)
  const newsContent = adminNews.length > 0 ? adminNews : allContent.filter(item => item.type === 'news');
  const pageContent = allContent.filter(item => item.type === 'page');

  // Merge adminNews with other content for the main list
  const displayContent = [
    ...carContent,
    ...newsContent,
    ...pageContent
  ];

  const filteredContent = displayContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = contentFilter === "all" || item.type === contentFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "default",
      draft: "secondary",
      scheduled: "outline"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
  };

  const handleApiSync = async () => {
    if (!apiProvider || !apiKey) {
      toast({
        title: "Error",
        description: "Please select an API provider and enter your API key",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Success",
        description: `Successfully synced car data from ${apiProvider}. 15 cars updated, 3 new cars added.`,
      });

      setIsApiSyncOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync data from API",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Image Upload Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  // Add Content functionality
  const handleAddContent = async () => {
    if (!newContent.title) {
      toast({
        title: "Error",
        description: "Please enter a title for the content",
        variant: "destructive",
      });
      return;
    }

    // Don't allow adding car content through CMS (should be done through Car Management)
    if (newContent.type === 'car') {
      toast({
        title: "Error",
        description: "Car listings should be managed through the Car Management system for proper integration.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Adding new content:", newContent);

      let finalImageUrl = newContent.image_url;

      // Handle Image Upload
      if (selectedImageFile) {
        try {
          const response = await api.media.upload(selectedImageFile);
          if (response.success) {
            finalImageUrl = response.url;
          } else {
            throw new Error(response.error || 'Image upload failed');
          }
        } catch (error) {
          console.error("Image upload error:", error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Create content data
      let finalContent = newContent.content;

      // If we have structured sections or highlights, construct the JSON content
      if (newContent.type === 'news' && (contentSections.length > 0 || keyHighlights.length > 0)) {
        const structuredContent = {
          introduction: newContent.content,
          sections: contentSections.filter(s => s.heading || s.body),
          keyHighlights: keyHighlights.filter(k => k)
        };
        finalContent = JSON.stringify(structuredContent);
      }

      const contentData = {
        title: newContent.title,
        type: newContent.type as 'car' | 'news' | 'page',
        status: newContent.status as 'published' | 'draft' | 'scheduled' | 'review',
        author: newContent.author,
        category: newContent.category,
        slug: newContent.slug,
        content: finalContent,
        excerpt: newContent.excerpt,
        image_url: finalImageUrl,
        views: 0
      };

      let addedContent;

      if (newContent.type === 'news') {
        // Use backend API for news to bypass RLS
        const response = await api.news.create(contentData);
        if (response.success) {
          addedContent = response.data;
          // Refresh content list
          refetch();
        } else {
          throw new Error(response.error || "Failed to create news article");
        }
      } else {
        // Fallback to direct DB for other types (if any)
        addedContent = await addContentToDb(contentData);
      }

      toast({
        title: "Success",
        description: `${newContent.type === 'news' ? 'News Article' : 'Content'} "${newContent.title}" has been created successfully.`,
      });

      // Reset form
      setNewContent({
        title: "",
        type: "car",
        status: "draft",
        description: "",
        price: "",
        brand: "",
        model: "",
        category: "",
        author: "",
        slug: "",
        content: "",
        excerpt: "",
        image_url: ""
      });
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setContentSections([{ id: Date.now().toString(), heading: '', body: '' }]);
      setKeyHighlights(['']);

      setIsAddContentOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive",
      });
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.title) {
      toast({
        title: "Error",
        description: "Please enter a topic title",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTopics = [...trendingTopics, { id: Date.now().toString(), ...newTopic }];
      const response = await api.trendingTopics.update(updatedTopics);

      if (response.success) {
        setTrendingTopics(updatedTopics);
        setNewTopic({ title: "", articleSlug: "" });
        toast({
          title: "Success",
          description: "Trending topic added successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add trending topic",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTopic = async (id: string) => {
    try {
      const updatedTopics = trendingTopics.filter(t => t.id !== id);
      const response = await api.trendingTopics.update(updatedTopics);

      if (response.success) {
        setTrendingTopics(updatedTopics);
        toast({
          title: "Success",
          description: "Trending topic removed successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove trending topic",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
            <p className="text-muted-foreground">Manage cars, news, pages and sync data from external APIs</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isApiSyncOpen} onOpenChange={setIsApiSyncOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  API Sync
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Sync Car Data from API</DialogTitle>
                  <DialogDescription>
                    Pull latest car data including pricing and images from 3rd party APIs
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiProvider">API Provider</Label>
                    <Select value={apiProvider} onValueChange={setApiProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select API provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cars24">Cars24 API</SelectItem>
                        <SelectItem value="carwale">CarWale API</SelectItem>
                        <SelectItem value="cardekho">CarDekho API</SelectItem>
                        <SelectItem value="zigwheels">ZigWheels API</SelectItem>
                        <SelectItem value="custom">Custom API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="autoSync" />
                    <Label htmlFor="autoSync">Enable automatic daily sync</Label>
                  </div>
                  <Button
                    onClick={handleApiSync}
                    disabled={isSyncing}
                    className="w-full"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Start Sync
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Trending Topics Dialog */}
            <Dialog open={isTrendingTopicsOpen} onOpenChange={setIsTrendingTopicsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending Topics
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Manage Trending Topics</DialogTitle>
                  <DialogDescription>
                    Add topics that will appear in the "Trending Topics" section.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add New Topic</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Topic Title"
                        value={newTopic.title}
                        onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="mt-2">
                      <Select
                        value={newTopic.articleSlug}
                        onValueChange={(value) => setNewTopic(prev => ({ ...prev, articleSlug: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Link to Article (Optional)" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          <SelectItem value="none">No Link</SelectItem>
                          {adminNews.map(article => (
                            <SelectItem key={article.id} value={article.slug}>
                              {article.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddTopic} className="w-full mt-2">
                      <Plus className="w-4 h-4 mr-2" /> Add Topic
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Current Topics</Label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {trendingTopics.map(topic => (
                        <div key={topic.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div>
                            <p className="font-medium">{topic.title}</p>
                            {topic.articleSlug && topic.articleSlug !== 'none' && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                Links to: {adminNews.find(a => a.slug === topic.articleSlug)?.title || topic.articleSlug}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTopic(topic.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {trendingTopics.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No trending topics added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Content Dialog */}
            <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Content</DialogTitle>
                  <DialogDescription>
                    Create new cars, news articles, or pages for your portal
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contentType">Content Type</Label>
                      <Select
                        value={newContent.type}
                        onValueChange={(value) => setNewContent(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-[5100]">
                          <SelectItem value="car">Car Listing</SelectItem>
                          <SelectItem value="news">News Article</SelectItem>
                          <SelectItem value="page">Static Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newContent.status}
                        onValueChange={(value) => setNewContent(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-[5100]">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newContent.title}
                      onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={
                        newContent.type === 'car' ? 'e.g., BMW X5 2024' :
                          newContent.type === 'news' ? 'e.g., Electric Vehicle Market Trends' :
                            'e.g., About Us'
                      }
                    />
                  </div>

                  {newContent.type === 'car' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={newContent.brand}
                          onChange={(e) => setNewContent(prev => ({ ...prev, brand: e.target.value }))}
                          placeholder="e.g., BMW"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          value={newContent.price}
                          onChange={(e) => setNewContent(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="e.g., ₹75,00,000"
                        />
                      </div>
                    </div>
                  )}

                  {newContent.type === 'news' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="author">Author</Label>
                          <Input
                            id="author"
                            value={newContent.author}
                            onChange={(e) => setNewContent(prev => ({ ...prev, author: e.target.value }))}
                            placeholder="e.g., Auto Expert"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={newContent.category}
                            onChange={(e) => setNewContent(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="e.g., Industry News"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Featured Image</Label>
                        <div className="space-y-4 border rounded-md p-4">
                          {/* File Input */}
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="image-upload">Upload Image</Label>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                            />
                          </div>

                          {/* Preview */}
                          {imagePreviewUrl && (
                            <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                              <img
                                src={imagePreviewUrl}
                                alt="Preview"
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}

                          {/* URL Input (Fallback/Manual) */}
                          <div className="space-y-1">
                            <Label htmlFor="image_url" className="text-xs text-muted-foreground">Or enter Image URL manually</Label>
                            <Input
                              id="image_url"
                              value={newContent.image_url}
                              onChange={(e) => setNewContent(prev => ({ ...prev, image_url: e.target.value }))}
                              placeholder="e.g., https://example.com/image.jpg"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                          id="excerpt"
                          value={newContent.excerpt}
                          onChange={(e) => setNewContent(prev => ({ ...prev, excerpt: e.target.value }))}
                          placeholder="Short summary of the article..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Introduction / Main Content</Label>
                        <Textarea
                          id="content"
                          value={newContent.content}
                          onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Enter the main content or introduction..."
                          className="min-h-[150px]"
                        />
                      </div>

                      {/* Structured Content Builder */}
                      <div className="space-y-4 border rounded-md p-4">
                        <h3 className="font-semibold">Article Sections</h3>
                        {contentSections.map((section, index) => (
                          <div key={section.id} className="space-y-2 p-3 bg-muted/30 rounded-md relative group">
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newSections = contentSections.filter(s => s.id !== section.id);
                                  setContentSections(newSections);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Section Heading"
                              value={section.heading}
                              onChange={(e) => {
                                const newSections = [...contentSections];
                                newSections[index].heading = e.target.value;
                                setContentSections(newSections);
                              }}
                              className="font-medium"
                            />
                            <Textarea
                              placeholder="Section Body"
                              value={section.body}
                              onChange={(e) => {
                                const newSections = [...contentSections];
                                newSections[index].body = e.target.value;
                                setContentSections(newSections);
                              }}
                              className="min-h-[100px]"
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setContentSections([...contentSections, { id: Date.now().toString(), heading: '', body: '' }])}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Section
                        </Button>
                      </div>

                      <div className="space-y-4 border rounded-md p-4">
                        <h3 className="font-semibold">Key Highlights (Bullet Points)</h3>
                        {keyHighlights.map((highlight, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Highlight ${index + 1}`}
                              value={highlight}
                              onChange={(e) => {
                                const newHighlights = [...keyHighlights];
                                newHighlights[index] = e.target.value;
                                setKeyHighlights(newHighlights);
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newHighlights = keyHighlights.filter((_, i) => i !== index);
                                setKeyHighlights(newHighlights);
                              }}
                              disabled={keyHighlights.length === 1 && index === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setKeyHighlights([...keyHighlights, ''])}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Highlight
                        </Button>
                      </div>
                    </>
                  )}

                  {newContent.type !== 'news' && (
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={newContent.content}
                        onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter content..."
                        className="min-h-[200px]"
                      />
                    </div>
                  )}

                  {newContent.type === 'page' && (
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={newContent.slug}
                        onChange={(e) => setNewContent(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="e.g., /about-us"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newContent.description}
                      onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter content description..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsAddContentOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddContent} className="flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Create {newContent.type.charAt(0).toUpperCase() + newContent.type.slice(1)}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allContent.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Cars</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carContent.filter(c => c.status === 'published').length}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">News Articles</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newsContent.length}</div>
              <p className="text-xs text-muted-foreground">+1 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Synced</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Last sync: 2 hours ago</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Management Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="car">Cars</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="page">Pages</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={contentFilter} onValueChange={setContentFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="car">Cars</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Content</CardTitle>
                <CardDescription>
                  Manage all your content from one place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.type === 'car' && 'source' in item && item.source === 'api' && (
                              <Badge variant="outline" className="text-xs">API</Badge>
                            )}
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{new Date(item.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>{item.views}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="car" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Car Listings</CardTitle>
                <CardDescription>
                  Manage car inventory and sync with external APIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car Model</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carContent.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">{car.title}</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>0 images</TableCell>
                        <TableCell>{getStatusBadge(car.status)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            manual
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>News Articles</CardTitle>
                <CardDescription>
                  Manage news content and blog posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsContent.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>{article.category}</TableCell>
                        <TableCell>{getStatusBadge(article.status)}</TableCell>
                        <TableCell>{article.views}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="page" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Static Pages</CardTitle>
                <CardDescription>
                  Manage website pages and static content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page Title</TableHead>
                      <TableHead>URL Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageContent.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.title}</TableCell>
                        <TableCell className="font-mono text-sm">{page.slug}</TableCell>
                        <TableCell>{getStatusBadge(page.status)}</TableCell>
                        <TableCell>{page.views}</TableCell>
                        <TableCell>{new Date(page.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ContentManagement;