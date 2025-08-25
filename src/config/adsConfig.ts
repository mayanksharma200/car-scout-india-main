export interface AdSlot {
  id: string;
  name: string;
  path: string;
  size: [number, number];
  mobileSize?: [number, number];
  placement: string;
  code: string;
}

export const AD_SLOTS: AdSlot[] = [
  {
    id: 'carsp_home_nav_728x90',
    name: 'Homepage Below Navigation',
    path: '/',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'below_hero',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_home_nav_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_home_explore1_728x90',
    name: 'Explore Cars by Brand #1',
    path: '/',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'between_brands_1',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_home_explore1_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_home_explore2_728x90',
    name: 'Explore Cars by Brand #2',
    path: '/',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'between_brands_2',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_home_explore2_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_home_footer_728x90',
    name: 'Homepage Above Footer',
    path: '/',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'above_footer',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_home_footer_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_search_nav_728x90',
    name: 'Search Results Below Navigation',
    path: '/cars',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'below_navigation',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_search_nav_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_search_sidebar_300x250',
    name: 'Search Left Sidebar',
    path: '/cars',
    size: [300, 250],
    mobileSize: [300, 250],
    placement: 'left_sidebar',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_search_sidebar_300x250', [300, 250], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_search_listing_728x90',
    name: 'Search Results Listing',
    path: '/cars',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'below_results',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_search_listing_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_search_footer_728x90',
    name: 'Search Above Footer',
    path: '/cars',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'above_footer',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_search_footer_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_compare_nav_728x90',
    name: 'Compare Below Navigation',
    path: '/compare',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'below_navigation',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_compare_nav_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_compare_footer_728x90',
    name: 'Compare Above Footer',
    path: '/compare',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'above_footer',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_compare_footer_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_emi_nav_728x90',
    name: 'EMI Page Below Navigation',
    path: '/emi-calculator',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'below_navigation',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_emi_nav_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_emi_footer_728x90',
    name: 'EMI Page Above Footer',
    path: '/emi-calculator',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'above_footer',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_emi_footer_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_details_nav_728x90',
    name: 'Car Details Below Navigation',
    path: '/cars/:slug',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'below_navigation',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_details_nav_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_details_tiles_300x250',
    name: 'Car Details Between Tiles',
    path: '/cars/:slug',
    size: [300, 250],
    mobileSize: [300, 250],
    placement: 'between_tiles',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_details_tiles_300x250', [300, 250], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  },
  {
    id: 'carsp_details_footer_728x90',
    name: 'Car Details Above Footer',
    path: '/cars/:slug',
    size: [728, 90],
    mobileSize: [320, 50],
    placement: 'above_footer',
    code: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<div id="gpt-passback">
  <script>
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/23175073069/carsp_details_footer_728x90', [728, 90], 'gpt-passback').addService(googletag.pubads());
    googletag.enableServices();
    googletag.display('gpt-passback');
    });
  </script>
</div>`
  }
];

export const getAdSlotsByPath = (path: string): AdSlot[] => {
  return AD_SLOTS.filter(slot => {
    if (slot.path === path) return true;
    if (slot.path.includes(':slug') && path.startsWith('/cars/') && path !== '/cars') return true;
    return false;
  });
};

export const getAdSlotByPlacement = (path: string, placement: string): AdSlot | undefined => {
  const slots = getAdSlotsByPath(path);
  return slots.find(slot => slot.placement === placement);
};