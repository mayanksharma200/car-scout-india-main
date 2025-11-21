import React from 'react';
import ProfileModal from './ProfileModal';
import { useUserAuth } from '@/contexts/UserAuthContext';

// Test component to verify ProfileModal works with Google OAuth users
const ProfileModalTest = () => {
  const { user } = useUserAuth();

  // Mock Google user data for testing
  const mockGoogleUser = {
    id: "test-google-user-id",
    email: "test@gmail.com",
    firstName: "Test",
    lastName: "User",
    provider: "google",
    given_name: "Test",
    family_name: "User",
    name: "Test User",
    user_metadata: {
      given_name: "Test",
      family_name: "User",
      full_name: "Test User",
      provider: "google"
    },
    emailVerified: true,
    role: "user",
    phone: "",
    city: ""
  };

  console.log("ProfileModalTest - Current user:", user);
  console.log("ProfileModalTest - Mock Google user:", mockGoogleUser);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ProfileModal Test</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Current User Data:</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Mock Google User Data:</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {JSON.stringify(mockGoogleUser, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">ProfileModal Component:</h3>
        <ProfileModal />
      </div>

      <div className="text-sm text-gray-600">
        <p>Test Instructions:</p>
        <ol className="list-decimal list-inside ml-4">
          <li>Sign in with Google OAuth</li>
          <li>Open the ProfileModal</li>
          <li>Check if user data is displayed correctly</li>
          <li>Try updating profile information</li>
          <li>Check browser console for any errors</li>
        </ol>
      </div>
    </div>
  );
};

export default ProfileModalTest;