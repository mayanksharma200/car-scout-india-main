import React from 'react';
import { useLocation } from 'react-router-dom';
import { AD_SLOTS, getAdSlotsByPath } from '@/config/adsConfig';

const AdDebugger: React.FC = () => {
  const location = useLocation();
  
  const currentPath = location.pathname;
  const mappedPath = currentPath.startsWith('/cars/') && currentPath !== '/cars' ? '/cars/:slug' : currentPath;
  const availableSlots = getAdSlotsByPath(mappedPath);

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg max-w-sm text-xs z-50">
      <div className="font-bold text-green-600 mb-2">🔍 Ad Debug Panel</div>
      
      <div className="space-y-2">
        <div>
          <strong>Current URL:</strong> {currentPath}
        </div>
        <div>
          <strong>Mapped Path:</strong> {mappedPath}
        </div>
        <div>
          <strong>Total Ad Slots:</strong> {AD_SLOTS.length}
        </div>
        <div>
          <strong>Available for this page:</strong> {availableSlots.length}
        </div>
        
        {availableSlots.length > 0 && (
          <div className="mt-3">
            <strong>Ad Placements:</strong>
            <ul className="mt-1 space-y-1">
              {availableSlots.map(slot => (
                <li key={slot.id} className="text-xs bg-blue-50 p-1 rounded">
                  • {slot.placement} ({slot.name})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {availableSlots.length === 0 && (
          <div className="text-red-600 mt-2">
            ❌ No ads configured for this page
          </div>
        )}
      </div>
    </div>
  );
};

export default AdDebugger;