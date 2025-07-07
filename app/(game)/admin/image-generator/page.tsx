'use client';

import { CharacterImageGenerator } from '@/components/game/CharacterImageGenerator';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImageGeneratorPage() {
  const router = useRouter();
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <CharacterImageGenerator />
      
      <div className="mt-8 p-4 bg-amber-900/20 border border-amber-900/50 rounded-lg">
        <h3 className="font-semibold text-amber-400 mb-2">Configuration Required</h3>
        <p className="text-sm text-amber-300">
          To enable image generation, please add the following to your .env.local:
        </p>
        <pre className="mt-2 p-2 bg-black/50 rounded text-xs font-mono">
{`OPENAI_API_KEY=your_openai_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token`}
        </pre>
        <p className="text-sm text-amber-300 mt-2">
          Get your Vercel Blob token from: 
          <a href="https://vercel.com/dashboard/stores" className="underline ml-1" target="_blank" rel="noopener noreferrer">
            Vercel Dashboard → Storage
          </a>
        </p>
      </div>
    </div>
  );
}