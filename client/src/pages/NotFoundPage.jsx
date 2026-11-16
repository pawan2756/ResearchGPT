import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 text-center"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className="max-w-md flex flex-col items-center">
        <div
          className="p-4 rounded-full mb-4"
          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)' }}
        >
          <FileQuestion className="w-12 h-12" />
        </div>
        <h1 className="text-[28px] font-bold mb-2">Page not found</h1>
        <p className="text-[15px] mb-6" style={{ color: 'var(--text-muted)' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/chat">
          <Button variant="primary" size="md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </Link>
      </div>
    </div>
  );
}
