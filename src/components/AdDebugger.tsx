import React, { useEffect, useRef, useState } from "react";

const AdDebugger: React.FC = () => {
  const [adSlots, setAdSlots] = useState<any[]>([]);
  const [googletag, setGoogletag] = useState<any>(null);

  useEffect(() => {
    const checkGoogleTag = () => {
      if (window.googletag) {
        setGoogletag(window.googletag);

        // Get all defined slots
        window.googletag.cmd.push(() => {
          const slots = window.googletag.pubads().getSlots();
          const slotInfo = slots.map((slot: any) => ({
            id: slot.getSlotElementId(),
            adUnitPath: slot.getAdUnitPath(),
            sizes: slot.getSizes(),
            isEmpty: slot.isEmpty && slot.isEmpty(),
            targeting: slot.getTargeting ? slot.getTargeting() : {},
            element: document.getElementById(slot.getSlotElementId()),
          }));
          setAdSlots(slotInfo);
        });
      }
    };

    checkGoogleTag();
    const interval = setInterval(checkGoogleTag, 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshAds = () => {
    if (window.googletag) {
      window.googletag.cmd.push(() => {
        window.googletag.pubads().refresh();
        console.log("🔄 Refreshed all ad slots");
      });
    }
  };

  const testSlot = (slotId: string) => {
    const element = document.getElementById(slotId);
    if (element) {
      console.log(`📊 Testing slot: ${slotId}`);
      console.log("Element:", element);
      console.log("Element styles:", window.getComputedStyle(element));
      console.log("Element innerHTML:", element.innerHTML);
      console.log("Element clientHeight:", element.clientHeight);
      console.log("Element offsetHeight:", element.offsetHeight);

      // Highlight the element temporarily
      const originalBorder = element.style.border;
      element.style.border = "3px solid red";
      element.style.minHeight = "100px";
      setTimeout(() => {
        element.style.border = originalBorder;
      }, 3000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto z-50">
      <h3 className="font-bold text-sm mb-2">Ad Debug Panel</h3>

      <div className="mb-2">
        <button
          onClick={refreshAds}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2"
        >
          Refresh Ads
        </button>
        <span className="text-xs">GoogleTag: {googletag ? "✅" : "❌"}</span>
      </div>

      <div className="text-xs">
        <strong>Ad Slots ({adSlots.length}):</strong>
        {adSlots.length === 0 ? (
          <p className="text-gray-500">No ad slots found</p>
        ) : (
          adSlots.map((slot, index) => (
            <div key={index} className="border-t pt-2 mt-2">
              <div>
                <strong>ID:</strong> {slot.id}
              </div>
              <div>
                <strong>Path:</strong> {slot.adUnitPath}
              </div>
              <div>
                <strong>Size:</strong> {JSON.stringify(slot.sizes)}
              </div>
              <div>
                <strong>Empty:</strong> {slot.isEmpty ? "Yes" : "No"}
              </div>
              <div>
                <strong>Element Found:</strong> {slot.element ? "Yes" : "No"}
              </div>
              {slot.element && (
                <div>
                  <strong>Height:</strong> {slot.element.offsetHeight}px
                </div>
              )}
              <button
                onClick={() => testSlot(slot.id)}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs mt-1"
              >
                Test Slot
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdDebugger;
