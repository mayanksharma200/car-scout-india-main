import React, { useEffect, useState } from "react";

const AdUnitDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any[]>([]);

  useEffect(() => {
    const runDiagnostics = () => {
      if (!window.googletag) {
        console.log("GoogleTag not loaded yet");
        return;
      }

      window.googletag.cmd.push(() => {
        const slots = window.googletag.pubads().getSlots();

        const diagnosticData = slots.map((slot: any) => {
          const elementId = slot.getSlotElementId();
          const element = document.getElementById(elementId);

          return {
            id: elementId,
            adUnitPath: slot.getAdUnitPath(),
            sizes: slot.getSizes(),
            element: element,
            isEmpty: slot.isEmpty ? slot.isEmpty() : "unknown",
            elementHeight: element ? element.offsetHeight : 0,
            elementDisplay: element
              ? window.getComputedStyle(element).display
              : "none",
            innerHTML: element ? element.innerHTML : "no element",
            hasIframe: element
              ? element.querySelector("iframe") !== null
              : false,
          };
        });

        setDiagnostics(diagnosticData);
        console.log("📊 Ad Unit Diagnostics:", diagnosticData);
      });
    };

    // Run diagnostics multiple times to catch async loading
    const intervals = [1000, 3000, 5000].map((delay) =>
      setTimeout(runDiagnostics, delay)
    );

    return () => intervals.forEach(clearTimeout);
  }, []);

  const testAdUnit = async (adUnitPath: string) => {
    console.log(`🧪 Testing ad unit: ${adUnitPath}`);

    // Create a temporary test slot
    const testId = `test-${Date.now()}`;
    const testDiv = document.createElement("div");
    testDiv.id = testId;
    testDiv.style.width = "728px";
    testDiv.style.height = "90px";
    testDiv.style.border = "2px solid red";
    document.body.appendChild(testDiv);

    if (window.googletag) {
      window.googletag.cmd.push(() => {
        const testSlot = window.googletag.defineSlot(
          adUnitPath,
          [728, 90],
          testId
        );
        if (testSlot) {
          testSlot.addService(window.googletag.pubads());
          window.googletag.display(testId);
          console.log(`✅ Test slot created for ${adUnitPath}`);

          // Check result after 3 seconds
          setTimeout(() => {
            const testElement = document.getElementById(testId);
            if (testElement) {
              console.log(`📊 Test result for ${adUnitPath}:`, {
                height: testElement.offsetHeight,
                display: window.getComputedStyle(testElement).display,
                hasContent: testElement.innerHTML.length > 0,
              });
            }
            // Clean up
            testDiv.remove();
          }, 3000);
        } else {
          console.log(`❌ Failed to create test slot for ${adUnitPath}`);
          testDiv.remove();
        }
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-lg max-h-96 overflow-auto z-50">
      <h3 className="font-bold text-sm mb-2">Ad Unit Diagnostics</h3>

      <div className="space-y-4 text-xs">
        {diagnostics.map((diag, index) => (
          <div key={index} className="border-b pb-2">
            <div>
              <strong>ID:</strong> {diag.id}
            </div>
            <div>
              <strong>Path:</strong> {diag.adUnitPath}
            </div>
            <div>
              <strong>Empty:</strong> {diag.isEmpty?.toString()}
            </div>
            <div>
              <strong>Height:</strong> {diag.elementHeight}px
            </div>
            <div>
              <strong>Display:</strong> {diag.elementDisplay}
            </div>
            <div>
              <strong>Has iFrame:</strong> {diag.hasIframe ? "Yes" : "No"}
            </div>
            <button
              onClick={() => testAdUnit(diag.adUnitPath)}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
            >
              Test This Unit
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="font-bold">Quick Tests:</h4>
        <button
          onClick={() => testAdUnit("/23175073069/carsp_home_nav_728x90")}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs mr-2"
        >
          Test Nav
        </button>
        <button
          onClick={() => testAdUnit("/23175073069/carsp_home_explore1_728x90")}
          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs mr-2"
        >
          Test Explore1
        </button>
        <button
          onClick={() => testAdUnit("/23175073069/carsp_home_explore2_728x90")}
          className="bg-orange-500 text-white px-2 py-1 rounded text-xs mr-2"
        >
          Test Explore2
        </button>
        <button
          onClick={() => testAdUnit("/23175073069/carsp_home_footer_728x90")}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Footer
        </button>
      </div>
    </div>
  );
};

export default AdUnitDiagnostic;
