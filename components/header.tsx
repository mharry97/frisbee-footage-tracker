'use client'
import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  title: string;
  buttonText?: string;
  redirectUrl?: string;
  onBack?: () => void;
};

const Header: React.FC<HeaderProps> = ({ title, buttonText, redirectUrl, onBack }) => {
  const router = useRouter();
  const handleClick = onBack ? onBack : () => router.push(redirectUrl || '/');

  return (
    <div className="pt-4 bg-neutral-950">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 px-2 py-1 rounded hover:bg-neutral-900 transition-colors text-sm"
      >
        <FiArrowLeft />
        {buttonText || "return"}
      </button>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 300 }} className="mt-2 mb-8">
        {title}
      </h1>
    </div>
  );
};

export default Header;
