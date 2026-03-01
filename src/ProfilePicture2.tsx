// src/components/ProfileAvatar.tsx
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { uploadData, getUrl } from 'aws-amplify/storage';
//import { CameraAlt as CameraIcon } from '@mui/icons-material'; // ← optional: Material Icons (or use any icon lib)
import '@aws-amplify/ui-react/styles.css';

const AVATAR_PATH = (userId: string) => `profile-pictures/${userId}/avatar`;

export default function ProfilePicture2() {
  const { user, route } = useAuthenticator((ctx) => [ctx.user, ctx.route]);

  const userId = user?.userId; // Cognito Identity ID

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current avatar
  useEffect(() => {
    if (route !== 'authenticated' || !userId) return;
    loadAvatar();
  }, [userId, route]);

  async function loadAvatar() {
    if (!userId) return;

    try {
      const { url } = await getUrl({
        path: AVATAR_PATH(userId),
      });
      setAvatarUrl(url.toString());
    } catch (err) {
      console.log('No avatar found or error:', err);
      setAvatarUrl(null);
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    setError(null);

    try {
      const key = AVATAR_PATH(userId);

      await uploadData({
        path: key,
        data: file,
        options: {
          contentType: file.type,
        },
      }).result;

      // Immediately reload fresh signed URL
      await loadAvatar();
      alert('Profile picture updated!');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError('Failed to upload. Please try again.');
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (route !== 'authenticated') {
    return <div>Please sign in to set your profile picture.</div>;
  }

  return (
    <div style={{ position: 'relative', width: 'fit-content', margin: '2rem auto' }}>
      {/* Hidden real file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={uploading}
      />

      {/* Clickable avatar area */}
      <div
        onClick={triggerFileSelect}
        style={{
          cursor: uploading ? 'wait' : 'pointer',
          position: 'relative',
          borderRadius: '50%',
          overflow: 'hidden',
          width: '180px',
          height: '180px',
          border: '4px solid #e0e0e0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => !uploading && (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => !uploading && (e.currentTarget.style.opacity = '1')}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Your profile picture"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: '#888',
            }}
          >
            ?
          </div>
        )}

        {/* Overlay icon (shows on hover) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
          className="overlay"
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
        >
          {/* <CameraIcon style={{ fontSize: '3rem', color: 'white' }} /> */}
        </div>
      </div>

      {uploading && (
        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#007bff' }}>
          Uploading...
        </p>
      )}
      {error && (
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'crimson' }}>
          {error}
        </p>
      )}
    </div>
  );
}