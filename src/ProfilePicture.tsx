// src/components/ProfilePicture.tsx
import { useState, useEffect, ChangeEvent } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { uploadData, getUrl } from 'aws-amplify/storage';
import '@aws-amplify/ui-react/styles.css';

export default function ProfilePicture() {
  const { user, route } = useAuthenticator((context) => [
    context.user,
    context.route,
  ]);

  const userId = user?.userId; // Cognito Identity ID (preferred for storage paths)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load avatar when user is signed in
  useEffect(() => {
    if (route !== 'authenticated' || !userId) return;
    loadAvatar();
  }, [userId, route]);

  async function loadAvatar() {
    try {
      // Fixed filename "avatar" → easy to overwrite
      // You can also use "avatar.jpg" / save extension in user profile
      const result = await getUrl({
        path: `profile-pictures/${userId}/avatar`,
        // options: { expiresIn: 3600 } // default is usually fine (signed URL)
      });

      setAvatarUrl(result.url.toString());
    } catch (err) {
      console.log('No avatar or error loading:', err);
      setAvatarUrl(null);
    }
  }

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    setError(null);

    try {
      const key = `profile-pictures/${userId}/avatar`;

      // Optional: preserve extension
      // const ext = file.name.split('.').pop() || 'jpg';
      // const key = `profile-pictures/${userId}/avatar.${ext}`;

      await uploadData({
        path: key,
        data: file,
        options: {
          contentType: file.type, // 'image/jpeg', 'image/png'...
          // You can add metadata if needed
          // metadata: { uploadedBy: userId }
        },
      }).result;

      // Reload the fresh URL
      await loadAvatar();
      alert('Profile picture updated!');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (route !== 'authenticated') {
    return <div>Please sign in to manage your profile picture.</div>;
  }

  return (
     <div style={{ maxWidth: '380px', margin: '2rem auto', textAlign: 'center' }}>
       <h2>Your Profile Picture</h2>

      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile avatar"
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      ) : (
        <div
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: '#f0f0f0',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            color: '#777',
          }}
          
        >
         <p    > No picture yet</p> 
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ marginBottom: '1rem' }}
        />

        {uploading && <p style={{ color: '#007bff' }}>Uploading...</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        {/* Optional: refresh button if URL expires */}
        {/* <button
          onClick={loadAvatar}
          disabled={uploading}
          style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
        >
          Refresh
        </button> */}
      </div>
    </div>
  );
}