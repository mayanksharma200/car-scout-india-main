# Advertisement Setup Documentation

## Overview
This document explains the comprehensive advertisement system implemented in your Car Scout India application. The system is designed to display Google AdSense/DFP ads at strategic locations across different pages of your website.

## Architecture

### 1. Configuration System (`src/config/adsConfig.ts`)
- **Purpose**: Centralized configuration for all ad slots
- **Features**: 
  - Defines ad slots with their placements, sizes, and Google AdSense code
  - Maps ads to specific pages and positions
  - Easy to modify and extend

### 2. Core Components

#### AdSlot Component (`src/components/AdSlot.tsx`)
- Renders individual ad slots with Google AdSense code
- Handles script injection and ad container creation
- Provides fallback placeholder when ads don't load

#### AdBanner Component (`src/components/AdBanner.tsx`)
- Wrapper component that uses placement-based ad selection
- Automatically shows the correct ad for the current page and position

### 3. Hooks (`src/hooks/useAds.ts`)
- `useAds()`: Provides ad-related utilities for components
- Automatically detects current page and available ad slots
- Handles dynamic route mapping (e.g., `/cars/:slug` routes)

## Advertisement Placements

### Homepage (`/`)
1. **Below Hero Section** (728x90) - `c_nav_728x90`
2. **Between Brand Grids #1** (728x90) - `carsp_home_explore1_728x90`
3. **Between Brand Grids #2** (728x90) - `carsp_home_explore2_728x90`
4. **Above Footer** (728x90) - `carsp_home_footer_728x90`

### Car Search Results (`/cars`)
1. **Below Navigation** (728x90) - `carsp_search_nav_728x90`
2. **Left Sidebar** (300x250) - `carsp_search_sidebar_300x250`
3. **Below Results** (728x90) - `carsp_search_listing_728x90`
4. **Above Footer** (728x90) - `carsp_search_footer_728x90`

### Compare Page (`/compare`)
1. **Below Navigation** (728x90) - `carsp_compare_nav_728x90`
2. **Above Footer** (728x90) - `carsp_compare_footer_728x90`

### EMI Calculator (`/emi-calculator`)
1. **Below Navigation** (728x90) - `carsp_emi_nav_728x90`
2. **Above Footer** (728x90) - `carsp_emi_footer_728x90`

### Car Details (`/cars/:slug`)
1. **Below Navigation** (728x90) - `carsp_details_nav_728x90`
2. **Between Tiles** (300x250) - `carsp_details_tiles_300x250`
3. **Above Footer** (728x90) - `carsp_details_footer_728x90`

## Implementation Details

### How Ads Are Integrated

1. **Import the AdBanner component** in your page:
```tsx
import AdBanner from "@/components/AdBanner";
```

2. **Place ads using placement names**:
```tsx
<AdBanner placement="below_hero" />
<AdBanner placement="above_footer" />
```

### Pages Updated
- ✅ Homepage (`src/pages/Index.tsx`)
- ✅ Car Listing (`src/pages/CarListing.tsx`)
- ✅ Compare Page (`src/pages/Compare.tsx`)
- ✅ EMI Calculator (`src/pages/EMICalculatorPage.tsx`)
- ✅ Car Details (`src/pages/CarDetail.tsx`)

## Testing

### Test Page
A dedicated test page has been created at `/ad-test` that demonstrates:
- Current page detection
- Available ad slots for each page
- Visual layout of ad placements
- Different page layout scenarios

### How to Test
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/ad-test`
3. View different pages to see ads in action:
   - Homepage: `http://localhost:3000/`
   - Car Listing: `http://localhost:3000/cars`
   - Compare: `http://localhost:3000/compare`
   - EMI Calculator: `http://localhost:3000/emi-calculator`
   - Car Details: `http://localhost:3000/cars/any-car-slug`

## Google AdSense Integration

### Ad Code Structure
Each ad slot contains Google Publisher Tag (GPT) code that:
1. Loads the Google AdSense script asynchronously
2. Defines the ad slot with your publisher ID (`/23175073069/`)
3. Sets up the ad container with unique IDs
4. Displays the ad

### Publisher Configuration
- **Publisher ID**: `/23175073069/`
- **Ad Network**: Google DoubleClick for Publishers (DFP)
- **Ad Sizes**: 728x90 (leaderboard) and 300x250 (medium rectangle)

## Maintenance and Updates

### Adding New Ad Slots
1. Open `src/config/adsConfig.ts`
2. Add new ad slot object to the `AD_SLOTS` array:
```typescript
{
  id: 'new_ad_slot_id',
  name: 'Descriptive Name',
  path: '/page-path',
  size: [width, height],
  placement: 'placement_name',
  code: `<!-- Your Google AdSense code -->`
}
```
3. Use the new placement in your components: `<AdBanner placement="placement_name" />`

### Modifying Existing Ads
- Update the ad configuration in `src/config/adsConfig.ts`
- Ad codes, sizes, and placements can be modified without changing components

### Removing Ads
- Remove or comment out ad slots in `src/config/adsConfig.ts`
- Remove corresponding `<AdBanner>` components from pages

## Best Practices

### Performance
- Ads load asynchronously to avoid blocking page rendering
- Unique container IDs prevent conflicts
- Fallback placeholders ensure layout stability

### User Experience
- Strategic placement to avoid disrupting content flow
- Responsive design considerations
- Loading indicators for better user feedback

### SEO
- Ads don't affect core content indexing
- Proper semantic HTML structure maintained
- Page speed optimizations preserved

## Troubleshooting

### Common Issues
1. **Ads not showing**: Check Google AdSense account approval and ad slot configuration
2. **Layout issues**: Verify ad sizes match your design requirements
3. **Console errors**: Ensure ad codes are properly formatted

### Debug Mode
The ad components include console logging for debugging:
- Check browser console for ad loading status
- Verify ad container creation and script execution

## Revenue Optimization

### Ad Placement Strategy
Current placements are optimized for:
- **Visibility**: Above-the-fold and high-engagement areas
- **User Experience**: Non-intrusive positioning
- **Performance**: Strategic spacing throughout content

### Recommended Monitoring
- Google AdSense performance metrics
- User engagement analytics
- Page load speed impact
- Click-through rates by placement

## Future Enhancements

### Potential Features
- A/B testing for ad placements
- Dynamic ad sizing based on device
- Ad blocker detection
- Custom ad formats
- Real-time performance monitoring
- Header bidding integration

This advertisement system provides a robust foundation for monetizing your Car Scout India application while maintaining excellent user experience and performance.