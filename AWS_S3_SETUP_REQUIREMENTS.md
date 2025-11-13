# AWS S3 Configuration Requirements for Car Image Storage

## Overview
We need to configure AWS S3 bucket to store car images generated via Ideogram API. Images will be served via CDN URLs for optimal performance.

---

## Required AWS Resources

### 1. S3 Bucket Setup

**Action Items:**
- [ ] Create a new S3 bucket with the following specifications:
  - **Bucket Name:** `car-scout-india-images` (or similar, must be globally unique)
  - **Region:** `ap-south-1` (Mumbai) - recommended for India-based application
  - **Block Public Access:** Configure based on access strategy (see options below)
  - **Versioning:** Enable (recommended for backup)
  - **Encryption:** Enable S3-managed encryption (SSE-S3)

**Folder Structure (suggested):**
```
car-scout-india-images/
├── cars/
│   ├── generated/        # AI-generated images from Ideogram
│   ├── uploads/          # User uploaded images (if any)
│   └── thumbnails/       # Optimized thumbnails
```

---

### 2. Bucket Access Policy

**Choose ONE of the following approaches:**

#### **Option A: Public Read Access (Recommended for CDN)**
Configure bucket policy to allow public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::car-scout-india-images/*"
    }
  ]
}
```

#### **Option B: Private Bucket with Signed URLs**
Keep bucket private and generate pre-signed URLs from backend (more secure but complex).

---

### 3. CORS Configuration

Add CORS policy to allow uploads from our application:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://car-scout-india-main.vercel.app",
      "http://localhost:3001",
      "http://localhost:8080"
    ],
    "ExposeHeaders": ["ETag"],
  }
]
```

---

### 4. IAM User Configuration (IMPORTANT - FIX FOR ACL ERROR)

**Current Issue:**
The existing IAM user `carportal` doesn't have `s3:PutObjectAcl` permission, causing upload failures.

**Solution - Choose ONE:**

#### **Option A: Add Bucket Policy (Recommended - No IAM changes needed)**

Add this policy to your S3 bucket `ventes-car-portal`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ventes-car-portal/*"
    }
  ]
}
```

This makes all objects in the bucket publicly readable without needing ACLs.

#### **Option B: Update IAM User Policy**

Update the policy for IAM user `arn:aws:iam::750435597114:user/carportal`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::ventes-car-portal",
        "arn:aws:s3:::ventes-car-portal/*"
      ]
    }
  ]
}
```

**Note:** The code has been updated to NOT use ACLs (Option A), so you just need to ensure the bucket has a public read policy.

---

### 5. CloudFront CDN Configuration (Recommended)

**Action Items:**
- [ ] Create a CloudFront distribution with:
  - **Origin Domain:** `car-scout-india-images.s3.ap-south-1.amazonaws.com`
  - **Origin Access:** Origin Access Control (OAC) - recommended
  - **Viewer Protocol Policy:** Redirect HTTP to HTTPS
  - **Allowed HTTP Methods:** GET, HEAD, OPTIONS
  - **Cache Policy:** CachingOptimized (or custom with TTL)
  - **Compress Objects Automatically:** Yes
  - **Price Class:** Use Only Asia, Europe, North America (or based on user geography)

- [ ] Update S3 bucket policy to allow CloudFront access (if using OAC)

**CloudFront Cache Behavior (Optional):**
- Set cache TTL: Min=0, Max=31536000, Default=86400 (1 day)
- Enable Gzip/Brotli compression

---

## Credentials to Provide

Please provide the following credentials via **secure channel** (encrypted email/secrets manager):

```env
# AWS Access Credentials
AWS_ACCESS_KEY_ID=AKIA.....................
AWS_SECRET_ACCESS_KEY=.......................

# S3 Configuration
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=car-scout-india-images

# CDN Configuration (after CloudFront setup)
AWS_CLOUDFRONT_URL=https://d1234abcd.cloudfront.net
# OR
AWS_CLOUDFRONT_DISTRIBUTION_ID=E1234ABCD5678
```

---

## Expected URLs Format

After setup, images will be accessible via:

**S3 Direct URL:**
```
https://car-scout-india-images.s3.ap-south-1.amazonaws.com/cars/generated/car-image-12345.jpg
```

**CloudFront CDN URL (Recommended):**
```
https://d1234abcd.cloudfront.net/cars/generated/car-image-12345.jpg
```




