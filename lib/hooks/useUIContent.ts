import { useState, useEffect } from 'react';
import { loadContentBySlug } from '@/lib/cms/content-loader';
import { UIContentMetadata } from '@/lib/cms/content-schemas';

interface UIContentData {
  loading: UIContentMetadata | null;
  login: UIContentMetadata | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook to load and manage UI content from CMS
 */
export function useUIContent(): UIContentData {
  const [content, setContent] = useState<UIContentData>({
    loading: null,
    login: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const loadUIContent = async () => {
      try {
        setContent(prev => ({ ...prev, isLoading: true, error: null }));

        // Load loading screens content
        const loadingContent = await loadContentBySlug('ui', 'loading-screens');
        
        // Load login screens content
        const loginContent = await loadContentBySlug('ui', 'login-screens');

        setContent({
          loading: loadingContent.metadata as UIContentMetadata,
          login: loginContent.metadata as UIContentMetadata,
          error: null,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to load UI content:', error);
        setContent(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false,
        }));
      }
    };

    loadUIContent();
  }, []);

  return content;
}

/**
 * Hook to get loading screen messages based on variant
 */
export function useLoadingMessages(variant: 'boot' | 'mission' | 'sync' | 'corporate' = 'boot') {
  const { loading, isLoading } = useUIContent();

  if (isLoading || !loading) {
    return getDefaultLoadingMessages(variant);
  }

  // Extract messages from CMS content based on variant
  try {
    const content = loading as any; // Type assertion for dynamic content access
    
    switch (variant) {
      case 'mission':
        return content.messages?.mission || getDefaultLoadingMessages('mission');
      case 'sync':
        return content.messages?.sync || getDefaultLoadingMessages('sync');
      case 'corporate':
        return content.messages?.corporate || getDefaultLoadingMessages('corporate');
      case 'boot':
      default:
        return content.messages?.boot || getDefaultLoadingMessages('boot');
    }
  } catch (error) {
    console.warn('Failed to parse loading messages from CMS, using defaults:', error);
    return getDefaultLoadingMessages(variant);
  }
}

/**
 * Hook to get login screen content
 */
export function useLoginContent() {
  const { login, isLoading, error } = useUIContent();

  if (isLoading || !login) {
    return {
      branding: getDefaultBranding(),
      messages: getDefaultLoginMessages(),
      isLoading,
      error,
    };
  }

  try {
    const content = login as any; // Type assertion for dynamic content access
    
    return {
      branding: {
        company_name: content.branding?.company_name || 'WHIX',
        logo_text: content.branding?.logo_text || '₩HIX',
        slogan: content.branding?.slogan || 'Your efficiency is our profitability',
        ...content.branding
      },
      messages: {
        welcome: content.messages?.welcome || getDefaultLoginMessages().welcome,
        form: content.messages?.form || getDefaultLoginMessages().form,
        auth: content.messages?.auth || getDefaultLoginMessages().auth,
        success: content.messages?.success || getDefaultLoginMessages().success,
        errors: content.messages?.errors || getDefaultLoginMessages().errors,
        ...content.messages
      },
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.warn('Failed to parse login content from CMS, using defaults:', error);
    return {
      branding: getDefaultBranding(),
      messages: getDefaultLoginMessages(),
      isLoading: false,
      error: 'Failed to load custom content',
    };
  }
}

// Default fallback data
function getDefaultLoadingMessages(variant: string): string[] {
  switch (variant) {
    case 'mission':
      return [
        "Analyzing delivery routes...",
        "Checking traffic patterns...",
        "Calculating optimal paths...",
        "Loading district data...",
        "Preparing mission briefing...",
      ];
    case 'sync':
      return [
        "Connecting to WHIX servers...",
        "Downloading latest updates...",
        "Synchronizing partner data...",
        "Updating mission logs...",
        "Refreshing city grid...",
      ];
    case 'corporate':
      return [
        "Verifying employment status...",
        "Checking performance metrics...",
        "Calculating tip deductions...",
        "Processing corporate fees...",
        "Updating efficiency ratings...",
      ];
    default:
      return ["Loading..."];
  }
}

function getDefaultBranding() {
  return {
    company_name: 'WHIX',
    logo_text: '₩HIX',
    slogan: 'Your efficiency is our profitability',
    colors: {
      primary: 'amber-500',
      secondary: 'gray-400',
      accent: 'cyan-400',
    }
  };
}

function getDefaultLoginMessages() {
  return {
    welcome: {
      title: 'WORKFORCE HYPEROPTIMIZATION INTERFACE X',
      subtitle: 'Your efficiency is our profitability',
    },
    form: {
      title: 'EMPLOYEE LOGIN',
      email_label: 'Employee Email',
      password_label: 'Corporate Password',
      login_button: 'Login to WHIX',
      demo_button: 'Demo Access (Skip Login)',
    },
    auth: {
      title: 'AUTHENTICATING',
      messages: [
        "Verifying employee credentials...",
        "Checking access permissions...",
        "Validating security clearance...",
        "Establishing secure session...",
        "Welcome to WHIX Systems."
      ]
    },
    success: {
      title: 'ACCESS GRANTED',
      subtitle: 'Welcome to WHIX Courier Hub',
    },
    errors: {
      invalid_credentials: 'Invalid employee credentials. Contact HR.',
      server_error: 'Corporate servers unavailable. Try again later.',
    }
  };
}