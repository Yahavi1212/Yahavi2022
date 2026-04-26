import { useEffect } from 'react';

const AccountPage = () => {
  useEffect(() => {
    window.location.replace('https://shop.hackknow.com/my-account');
  }, []);

  return (
    <div className="min-h-screen bg-hack-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-hack-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60">Redirecting to your account...</p>
      </div>
    </div>
  );
};

export default AccountPage;
