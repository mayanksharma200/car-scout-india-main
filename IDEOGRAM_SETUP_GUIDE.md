# Ideogram AI Image Generator - Setup Guide

## ✅ What's Already Done

- ✅ Ideogram API integrated
- ✅ AWS S3 credentials configured in `.env`
- ✅ Backend endpoints created
- ✅ Frontend UI component ready
- ✅ Code updated to work WITHOUT CloudFront (direct S3 URLs)

---

## 🔧 What You Need to Do

### Step 1: Fix S3 Bucket Permissions (REQUIRED)

The current IAM user can upload files but can't set them as public. You need to add a **Bucket Policy** to make uploaded images publicly accessible.

**Go to AWS Console:**

1. Navigate to **S3** → **ventes-car-portal** bucket
2. Go to **Permissions** tab
3. Scroll down to **Bucket policy**
4. Click **Edit**
5. Paste this policy:

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

6. Click **Save changes**

**⚠️ Important:** You may also need to:
- Go to **Block Public Access** settings
- Uncheck "Block all public access" OR at minimum uncheck "Block public access to buckets and objects granted through new public bucket or access point policies"
- Save changes

---

### Step 2: Run Database Migration

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Add ideogram_images column to cars table
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS ideogram_images JSONB DEFAULT NULL;

-- Add a comment to the column
COMMENT ON COLUMN cars.ideogram_images IS 'Stores Ideogram AI generated images data';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_cars_ideogram_images ON cars USING GIN (ideogram_images);
```

---

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

The backend should start on `http://localhost:3001`

---

## 🎨 How to Use the Feature

### 1. Access Admin Dashboard

Navigate to: `http://localhost:8080/admin`

### 2. Scroll to "Ideogram AI Car Image Generator"

You'll see the new purple-themed section at the top of the dashboard.

### 3. Select a Car

- Use the search box to find a car
- Click on a car to select it (checkbox will be checked)
- You can select multiple cars

### 4. Configure Generation Options (Optional)

- **Images per car**: 4 or 8 angles
- **Aspect Ratio**: 16:9 (recommended for cars)
- **Quality**: TURBO (good balance of speed and quality)
- **Style**: REALISTIC

### 5. Generate Images

Click **"Generate for X Cars"** button

**What happens:**
- Ideogram API generates 8 professional car images
- Generation takes ~10-15 seconds per car
- Status shows "Pending Review" when done

### 6. Review Generated Images

Click the **"Review Images"** button on any pending car

**In the modal:**
- All 8 images are displayed in a grid
- All images are pre-selected by default
- Click any image to deselect it
- Use "Select All" or "Clear All" buttons

### 7. Upload to S3

Click **"Upload X Images to S3"**

**What happens:**
- Selected images are downloaded from Ideogram
- Uploaded to S3 bucket: `ventes-car-portal/cars/{carId}/ideogram_*.jpg`
- S3 URLs are saved to the car's `images` array
- Car is immediately updated in the database

### 8. Verify on Frontend

Go to the car detail page - you should see the new images!

---

## 📁 Where Images Are Stored

### Ideogram URLs (Temporary - 24 hours)
```
https://ideogram.ai/api/images/ephemeral/xxxxx.png?exp=...
```

### S3 URLs (Permanent)
```
https://ventes-car-portal.s3.ap-south-1.amazonaws.com/cars/{carId}/ideogram_front_3_4_1763039910079_24538e11.jpg
```

### Database Structure

**`cars.images` array:**
```json
[
  "https://ventes-car-portal.s3.ap-south-1.amazonaws.com/cars/.../ideogram_front_3_4_xxx.jpg",
  "https://ventes-car-portal.s3.ap-south-1.amazonaws.com/cars/.../ideogram_rear_3_4_xxx.jpg",
  ...
]
```

**`cars.ideogram_images` JSONB:**
```json
{
  "source": "ideogram",
  "primary": "https://s3-url...",
  "angles": [
    {
      "angle": "front_3_4",
      "url": "https://s3-url...",
      "resolution": "1280x720",
      "is_safe": true,
      "original_url": "https://ideogram-url..."
    }
  ],
  "total_images": 8,
  "valid": true,
  "last_updated": "2025-01-13T..."
}
```

---

## 🐛 Troubleshooting

### Error: "s3:PutObjectAcl not authorized"
**Solution:** Follow Step 1 to add the bucket policy.

### Error: "Ideogram API is not configured"
**Check:** `backend/.env` has `IDEOGRAM_API_KEY`

### Error: "AWS S3 is not configured"
**Check:** `backend/.env` has all AWS credentials

### Images not showing on frontend
**Check:**
1. S3 bucket policy is set (Step 1)
2. Images are in `cars.images` array
3. URLs are accessible in browser

### Generation is slow
**Normal:** Each car takes 10-15 seconds with TURBO mode
**Faster:** Use FLASH mode (lower quality)

---

## 🎯 Generated Image Angles

1. **front_3_4** - Front 3/4 view (hero shot)
2. **rear_3_4** - Rear 3/4 view
3. **side_profile** - Full side profile
4. **front_straight** - Front straight view
5. **rear_straight** - Rear straight view
6. **interior_dash** - Dashboard close-up
7. **interior_cabin** - Interior cabin wide shot
8. **detail_shot** - Wheel/headlight detail

---

## 📝 Notes

- **Ideogram images expire in 24 hours** - Must upload to S3 within this time
- **Rate limits:** Wait 3 seconds between cars (built-in)
- **Cost:** ~$0.08 per car (8 images at TURBO quality)
- **Storage:** ~2-3 MB per car (8 images)
- **S3 costs:** Very minimal (~$0.023/GB/month)

---

## ✨ Features Summary

✅ Search and select specific cars
✅ Batch generation for multiple cars
✅ Preview all generated images before upload
✅ Select which images to keep
✅ Automatic S3 upload with unique filenames
✅ Automatic database update
✅ Status tracking (Pending Review → Approved)
✅ Error handling and retry logic
✅ Progress indicators and toast notifications

---

## 🚀 Ready to Test!

Once you complete Step 1 (bucket policy), you're ready to generate professional car images! 🎉
