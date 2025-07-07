'use client';

import { MapBackgroundGenerator } from '@/components/game/MapBackgroundGenerator';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MapGeneratorPage() {
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
      
      <MapBackgroundGenerator />
      
      <div className="mt-8 p-4 bg-amber-900/20 border border-amber-900/50 rounded-lg">
        <h3 className="font-semibold text-amber-400 mb-2">Configuration Required</h3>
        <p className="text-sm text-amber-300">
          Map and background generation uses the same OpenAI API key as character generation.
          Make sure you have set up your environment variables:
        </p>
        <pre className="mt-2 p-2 bg-black/50 rounded text-xs font-mono">
{`OPENAI_API_KEY=your_openai_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token`}
        </pre>
      </div>
    </div>
  );
}