#!/bin/bash

# Update S3 CORS configuration for ventes-car-portal bucket
# This script adds your production domain to the CORS allowed origins

BUCKET_NAME="ventes-car-portal"

# Create CORS configuration file
cat > cors-config.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:8080",
        "https://car-scout-india-main.vercel.app",
        "https://*.vercel.app"
      ],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

echo "Updating CORS configuration for bucket: $BUCKET_NAME"

# Apply CORS configuration
aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-config.json

if [ $? -eq 0 ]; then
    echo "✅ CORS configuration updated successfully!"
    echo "Your production domain should now be able to load images from S3"
else
    echo "❌ Failed to update CORS configuration"
    echo "Please check your AWS credentials and bucket name"
fi

# Clean up
rm cors-config.json

echo ""
echo "To verify the CORS configuration, run:"
echo "aws s3api get-bucket-cors --bucket $BUCKET_NAME"
