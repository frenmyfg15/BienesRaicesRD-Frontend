// components/GoogleSignInButton.tsx
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleSignInButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: () => void;
  text?: string;
  className?: string;
  disabled?: boolean; // <--- ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÁ PRESENTE!
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  className,
  disabled = false, // <--- Y esta línea también, para dar un valor por defecto
}) => {
  // Asegúrate de que esta variable de entorno esté configurada en tu .env.local
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    onSuccess(credentialResponse);
  };

  const handleError = () => {
    if (onError) {
      onError();
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={`google-sign-in-button-container ${className || ''}`}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={text}
          size="large"
          theme="outline"
          shape="rectangular"
          width="200px"
          disabled={disabled} // <--- Aplicamos la prop disabled aquí al componente de la librería
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleSignInButton;
