import { useState } from "react";
import { useParams } from "react-router-dom";
import { Star, ThumbsUp, ThumbsDown, Camera, Shield, CheckCircle, Filter, User, Calendar } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const ReviewsPage = () => {
  const { id } = useParams();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    review: "",
    pros: "",
    cons: "",
    ownershipDuration: "",
    drivingStyle: "",
    photos: [] as File[]
  });

  // Mock car data
  const car = {
    brand: "Maruti Suzuki",
    model: "Swift",
    variant: "ZXI+ AMT",
    image: "/placeholder.svg"
  };

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      userName: "Rajesh Kumar",
      userImage: "/placeholder.svg",
      rating: 5,
      title: "Excellent car for city driving",
      review: "I've been using this Swift for 8 months now and it's been fantastic. The fuel efficiency is amazing - I'm getting around 22-23 kmpl in city conditions. The AMT transmission is smooth and perfect for Bangalore traffic.",
      pros: ["Great fuel efficiency", "Smooth AMT", "Compact size", "Good build quality"],
      cons: ["Limited rear space", "Road noise at high speeds"],
      ownershipDuration: "8 months",
      drivingStyle: "City & Highway",
      verifiedPurchase: true,
      helpfulVotes: 45,
      unhelpfulVotes: 3,
      date: "2024-12-15",
      photos: ["/placeholder.svg", "/placeholder.svg"],
      dealerResponse: null
    },
    {
      id: 2,
      userName: "Priya Sharma",
      userImage: "/placeholder.svg",
      rating: 4,
      title: "Good value for money",
      review: "Overall satisfied with the purchase. The car is reliable and maintenance costs are low. However, I wish the interior was more premium for the price point.",
      pros: ["Reliable", "Low maintenance", "Good resale value"],
      cons: ["Basic interior", "Average music system"],
      ownershipDuration: "1.5 years",
      drivingStyle: "Mostly City",
      verifiedPurchase: true,
      helpfulVotes: 32,
      unhelpfulVotes: 5,
      date: "2024-11-28",
      photos: [],
      dealerResponse: {
        dealerName: "Prime Motors Mumbai",
        response: "Thank you for your feedback! We're glad you're satisfied with the reliability and maintenance costs. We've noted your suggestions about the interior and will share them with our product team.",
        date: "2024-12-01"
      }
    },
    {
      id: 3,
      userName: "Amit Patel",
      userImage: "/placeholder.svg",
      rating: 3,
      title: "Average experience",
      review: "The car is okay but not exceptional. Fuel efficiency is good but the pickup could be better. Build quality feels a bit plasticky.",
      pros: ["Decent fuel efficiency", "Easy to park"],
      cons: ["Poor pickup", "Plasticky feel", "Wind noise"],
      ownershipDuration: "6 months",
      drivingStyle: "Mixed",
      verifiedPurchase: false,
      helpfulVotes: 18,
      unhelpfulVotes: 12,
      date: "2024-10-20",
      photos: [],
      dealerResponse: null
    }
  ];

  const reviewStats = {
    averageRating: 4.2,
    totalReviews: 847,
    ratingDistribution: {
      5: 45,
      4: 30,
      3: 15,
      2: 7,
      1: 3
    }
  };

  const handleRatingClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewReview(prev => ({
        ...prev,
        photos: [...prev.photos, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const handleVote = (reviewId: number, type: 'helpful' | 'unhelpful') => {
    // Handle voting logic here
    console.log(`Voted ${type} for review ${reviewId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredReviews = reviews.filter(review => 
    filterRating === "all" || review.rating.toString() === filterRating
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Car Header */}
        <div className="flex items-center gap-4 mb-8">
          <img 
            src={car.image} 
            alt={`${car.brand} ${car.model}`}
            className="w-20 h-16 object-cover rounded-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {car.brand} {car.model} Reviews
            </h1>
            <p className="text-muted-foreground">{car.variant}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Review Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-foreground mb-2">
                    {reviewStats.averageRating}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.floor(reviewStats.averageRating)
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    Based on {reviewStats.totalReviews} reviews
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="w-4 text-sm">{rating}</span>
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <Progress 
                        value={reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]} 
                        className="flex-1"
                      />
                      <span className="w-8 text-sm text-muted-foreground">
                        {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Write Review Button */}
            <Button 
              className="w-full bg-gradient-primary hover:opacity-90"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              Write a Review
            </Button>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Write Your Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rating */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Overall Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-8 h-8 cursor-pointer transition-colors ${
                            star <= newReview.rating
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground hover:text-accent'
                          }`}
                          onClick={() => handleRatingClick(star)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <Label htmlFor="title">Review Title</Label>
                    <Input
                      id="title"
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Summarize your experience"
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <Label htmlFor="review">Your Review</Label>
                    <Textarea
                      id="review"
                      value={newReview.review}
                      onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                      placeholder="Share your detailed experience with this car"
                      rows={4}
                    />
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pros">What you liked</Label>
                      <Textarea
                        id="pros"
                        value={newReview.pros}
                        onChange={(e) => setNewReview(prev => ({ ...prev, pros: e.target.value }))}
                        placeholder="List the positives"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cons">What could be better</Label>
                      <Textarea
                        id="cons"
                        value={newReview.cons}
                        onChange={(e) => setNewReview(prev => ({ ...prev, cons: e.target.value }))}
                        placeholder="List areas for improvement"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ownership">Ownership Duration</Label>
                      <Select onValueChange={(value) => setNewReview(prev => ({ ...prev, ownershipDuration: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-3 months">1-3 months</SelectItem>
                          <SelectItem value="3-6 months">3-6 months</SelectItem>
                          <SelectItem value="6-12 months">6-12 months</SelectItem>
                          <SelectItem value="1-2 years">1-2 years</SelectItem>
                          <SelectItem value="2+ years">2+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="driving">Driving Style</Label>
                      <Select onValueChange={(value) => setNewReview(prev => ({ ...prev, drivingStyle: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mostly City">Mostly City</SelectItem>
                          <SelectItem value="City & Highway">City & Highway</SelectItem>
                          <SelectItem value="Mostly Highway">Mostly Highway</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <Label>Add Photos (Optional)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Camera className="w-4 h-4 mr-2" />
                            Upload Photos
                          </span>
                        </Button>
                      </label>
                    </div>
                    {newReview.photos.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {newReview.photos.length} photo(s) selected
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3">
                    <Button className="bg-gradient-accent hover:opacity-90">
                      Submit Review
                    </Button>
                    <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={review.userImage} 
                          alt={review.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{review.userName}</h4>
                            {review.verifiedPurchase && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(review.date)}</span>
                            <span>•</span>
                            <span>{review.ownershipDuration} ownership</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-accent text-accent'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Content */}
                    <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
                    <p className="text-muted-foreground mb-4">{review.review}</p>

                    {/* Pros & Cons */}
                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {review.pros.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-600 mb-2">Pros</h5>
                            <ul className="space-y-1">
                              {review.pros.map((pro, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {review.cons.length > 0 && (
                          <div>
                            <h5 className="font-medium text-orange-600 mb-2">Cons</h5>
                            <ul className="space-y-1">
                              {review.cons.map((con, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <div className="w-3 h-3 border border-orange-500 rounded-full mt-0.5 flex-shrink-0"></div>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Photos */}
                    {review.photos.length > 0 && (
                      <div className="mb-4">
                        <div className="flex gap-2 overflow-x-auto">
                          {review.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              className="w-20 h-16 object-cover rounded flex-shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dealer Response */}
                    {review.dealerResponse && (
                      <div className="bg-muted/30 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Dealer Response</Badge>
                          <span className="text-sm text-muted-foreground">
                            {review.dealerResponse.dealerName}
                          </span>
                        </div>
                        <p className="text-sm">{review.dealerResponse.response}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(review.dealerResponse.date)}
                        </p>
                      </div>
                    )}

                    {/* Helpful Votes */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(review.id, 'helpful')}
                          className="text-muted-foreground hover:text-green-600"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful ({review.helpfulVotes})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(review.id, 'unhelpful')}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          Not Helpful ({review.unhelpfulVotes})
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {review.drivingStyle} • {review.ownershipDuration}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Load More Reviews
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;