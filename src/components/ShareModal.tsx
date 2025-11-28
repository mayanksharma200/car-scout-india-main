import { useState } from "react";
import { Share2, Facebook, Twitter, Linkedin, Mail, MessageCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareModalProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  children?: React.ReactNode;
  dialogTitle?: string;
}

const ShareModal = ({ title, description, url, image, children, dialogTitle = "Share" }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // Fix URL duplication: if url already starts with http, don't prepend origin
  const shareUrl = typeof window !== 'undefined' && !url.startsWith('http')
    ? window.location.origin + url
    : url;

  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${shareUrl}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === 'email') {
      window.location.href = shareLinks[platform];
    } else {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    }
    setOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
        setOpen(false);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden px-4 py-6 sm:p-6">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Preview Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                {image && (
                  <img
                    src={image}
                    alt={title}
                    className="w-16 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-1">{title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{shareUrl}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleShare('whatsapp')}
              className="justify-start"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
              WhatsApp
            </Button>

            <Button
              variant="outline"
              onClick={() => handleShare('facebook')}
              className="justify-start"
            >
              <Facebook className="w-4 h-4 mr-2 text-blue-600" />
              Facebook
            </Button>

            <Button
              variant="outline"
              onClick={() => handleShare('twitter')}
              className="justify-start"
            >
              <Twitter className="w-4 h-4 mr-2 text-blue-400" />
              Twitter
            </Button>

            <Button
              variant="outline"
              onClick={() => handleShare('linkedin')}
              className="justify-start"
            >
              <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
              LinkedIn
            </Button>

            <Button
              variant="outline"
              onClick={() => handleShare('email')}
              className="justify-start"
            >
              <Mail className="w-4 h-4 mr-2 text-gray-600" />
              Email
            </Button>

            {/* Native Share (Mobile) */}
            {navigator.share && (
              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="justify-start"
              >
                <Share2 className="w-4 h-4 mr-2" />
                More
              </Button>
            )}
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label htmlFor="share-url">Copy link</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1 min-w-0"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600">Link copied to clipboard!</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;