
/**
 * Utility functions for handling car images across the application.
 * This unifies the logic for extracting images from various data formats (legacy, new, color-variant, etc.)
 */

/**
 * Generates a list of images for a car, optionally filtered by color.
 * Handles multiple data structures:
 * 1. color_variant_images (Newest format: { ColorName: { images: { angle: url } } })
 * 2. images object with color keys (Intermediate format: { ColorName: [url1, url2] })
 * 3. images object with angle keys (Legacy format: { front_3_4: url, ... })
 * 4. images array (Oldest format: [url1, url2])
 */
export const generateCarImages = (
    car: any,
    paintId: string = "1",
    paintDescription: string = "white",
    actualApiPaintId?: string,
    actualApiDescription?: string,
    colorName?: string,
    colorVariantImages?: Record<string, any>
): string[] => {
    if (!car) return ["/placeholder.svg"];

    // 1. Check for color_variant_images first (Highest Priority)
    // This is passed either as an argument or found on the car object
    const variants = colorVariantImages || car.color_variant_images;

    if (variants && colorName) {
        // Try to find exact match or case-insensitive match
        const exactKey = Object.keys(variants).find(
            k => k.toLowerCase().trim() === colorName.toLowerCase().trim()
        );

        if (exactKey && variants[exactKey]?.images) {
            const imagesObj = variants[exactKey].images;
            const angleOrder = [
                'front_3_4', 'front_view', 'left_side', 'right_side',
                'rear_view', 'interior_dash', 'interior_cabin', 'interior_steering'
            ];

            const imageUrls = angleOrder
                .map(angle => imagesObj[angle])
                .filter(url => url && url.length > 0);

            if (imageUrls.length > 0) {
                // console.log(`✅ Found ${imageUrls.length} images for color ${colorName} in color_variant_images`);
                return imageUrls;
            }
        }
    }

    // 2. Fallback to legacy images field
    if (car.images) {
        // If images is an object (could be angle keys OR color keys)
        if (typeof car.images === 'object' && !Array.isArray(car.images)) {

            // Case A: It's a map of Color Name -> Image Array (The format user provided)
            // Check if values are arrays by checking the first key
            const firstKey = Object.keys(car.images)[0];
            if (firstKey && Array.isArray(car.images[firstKey])) {
                // Try to find images for the requested color
                if (colorName) {
                    // Try exact match or trimmed match
                    const exactKey = Object.keys(car.images).find(
                        k => k.toLowerCase().trim() === colorName.toLowerCase().trim()
                    );
                    if (exactKey && car.images[exactKey]?.length > 0) {
                        return car.images[exactKey];
                    }
                }

                // If no specific color requested or not found, try 'default'
                if (car.images.default && Array.isArray(car.images.default) && car.images.default.length > 0 && car.images.default.some((url: string) => url)) {
                    return car.images.default;
                }

                // Otherwise return the first available color's images
                for (const key of Object.keys(car.images)) {
                    if (Array.isArray(car.images[key]) && car.images[key].length > 0 && car.images[key].some((url: string) => url)) {
                        return car.images[key];
                    }
                }
            }

            // Case B: It's a flat object with angle keys (Legacy format)
            const angleOrder = [
                'front_3_4', 'front_view', 'left_side', 'right_side',
                'rear_view', 'interior_dash', 'interior_cabin', 'interior_steering'
            ];

            // Check if any of the angle keys exist directly on car.images
            const hasAngleKeys = angleOrder.some(angle => angle in car.images);

            if (hasAngleKeys) {
                const imageUrls = angleOrder
                    .filter(angle => car.images[angle])
                    .map(angle => car.images[angle]);

                if (imageUrls.length > 0) {
                    return imageUrls;
                }
            }
        }

        // Case C: If images is a simple array (Oldest format)
        if (Array.isArray(car.images) && car.images.length > 0) {
            // Filter out empty strings or placeholders if needed, though usually we just return the array
            const validImages = car.images.filter((url: any) => typeof url === 'string' && url.length > 0);
            if (validImages.length > 0) {
                return validImages;
            }
        }
    }

    // Fallback to placeholder if no images
    return ["/placeholder.svg"];
};

/**
 * Gets the single best "main" image for a car, suitable for cards and listings.
 * Uses generateCarImages internally to ensure consistency.
 */
export const getCarMainImage = (car: any): string => {
    if (!car) return "/placeholder.svg";

    // Try to get images for the car's specified color, or default
    // We pass undefined for paintId/description as they are only used for API generation which we aren't doing here
    // We pass car.color as the requested color name
    const images = generateCarImages(
        car,
        undefined,
        undefined,
        undefined,
        undefined,
        car.color || (car.colors ? car.colors.split(';')[0].trim() : undefined)
    );

    if (images && images.length > 0) {
        return images[0];
    }

    return "/placeholder.svg";
};
