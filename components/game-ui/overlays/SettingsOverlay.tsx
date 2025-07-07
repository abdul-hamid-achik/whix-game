'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Volume2, Monitor, Gamepad2, Bell, Shield, Info } from 'lucide-react';
import { NeuraButton, NeuraPanel } from '@/components/neura';
import { useUIStore } from '@/lib/stores/uiStore';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'audio' | 'video' | 'controls' | 'notifications' | 'privacy' | 'about';

export function SettingsOverlay({ isOpen, onClose }: SettingsOverlayProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio');
  const { settings, updateSettings } = useUIStore();

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'video', label: 'Video', icon: Monitor },
    { id: 'controls', label: 'Controls', icon: Gamepad2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'about', label: 'About', icon: Info }
  ];

  const handleSettingChange = (setting: string, value: any) => {
    updateSettings({ [setting]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[95] flex items-center justify-center"
          >
            <NeuraPanel variant="primary" className="w-full max-w-4xl max-h-full overflow-hidden">
              <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-64 bg-gray-900/50 border-r border-purple-500/30 p-4">
                  <h2 className="text-xl font-bold text-purple-400 mb-6">SETTINGS</h2>
                  
                  <nav className="space-y-2">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                          ${activeTab === tab.id 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                          }
                        `}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-cyan-400">
                      {tabs.find(t => t.id === activeTab)?.label.toUpperCase()}
                    </h3>
                    <NeuraButton
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </NeuraButton>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {activeTab === 'audio' && <AudioSettings settings={settings} onChange={handleSettingChange} />}
                    {activeTab === 'video' && <VideoSettings settings={settings} onChange={handleSettingChange} />}
                    {activeTab === 'controls' && <ControlsSettings settings={settings} onChange={handleSettingChange} />}
                    {activeTab === 'notifications' && <NotificationSettings settings={settings} onChange={handleSettingChange} />}
                    {activeTab === 'privacy' && <PrivacySettings settings={settings} onChange={handleSettingChange} />}
                    {activeTab === 'about' && <AboutSection />}
                  </div>
                </div>
              </div>
            </NeuraPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Audio Settings Tab
function AudioSettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <SettingSlider
        label="Master Volume"
        value={settings.masterVolume || 100}
        onChange={(value) => onChange('masterVolume', value)}
      />
      <SettingSlider
        label="Music Volume"
        value={settings.musicVolume || 80}
        onChange={(value) => onChange('musicVolume', value)}
      />
      <SettingSlider
        label="SFX Volume"
        value={settings.sfxVolume || 100}
        onChange={(value) => onChange('sfxVolume', value)}
      />
      <SettingSlider
        label="Voice Volume"
        value={settings.voiceVolume || 100}
        onChange={(value) => onChange('voiceVolume', value)}
      />
      <SettingToggle
        label="Enable Spatial Audio"
        value={settings.spatialAudio || false}
        onChange={(value) => onChange('spatialAudio', value)}
      />
    </div>
  );
}

// Video Settings Tab
function VideoSettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <SettingSelect
        label="Display Mode"
        value={settings.displayMode || 'windowed'}
        options={[
          { value: 'windowed', label: 'Windowed' },
          { value: 'fullscreen', label: 'Fullscreen' },
          { value: 'borderless', label: 'Borderless Window' }
        ]}
        onChange={(value) => onChange('displayMode', value)}
      />
      <SettingSelect
        label="Resolution"
        value={settings.resolution || '1920x1080'}
        options={[
          { value: '1280x720', label: '1280x720' },
          { value: '1920x1080', label: '1920x1080' },
          { value: '2560x1440', label: '2560x1440' },
          { value: '3840x2160', label: '3840x2160' }
        ]}
        onChange={(value) => onChange('resolution', value)}
      />
      <SettingToggle
        label="Enable VSync"
        value={settings.vsync || true}
        onChange={(value) => onChange('vsync', value)}
      />
      <SettingToggle
        label="Enable Animations"
        value={settings.animations !== false}
        onChange={(value) => onChange('animations', value)}
      />
      <SettingToggle
        label="Reduce Motion"
        value={settings.reduceMotion || false}
        onChange={(value) => onChange('reduceMotion', value)}
      />
    </div>
  );
}

// Controls Settings Tab
function ControlsSettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
        <h4 className="text-cyan-400 font-medium mb-4">KEYBOARD SHORTCUTS</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Open Hub</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-white">H</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quick Save</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-white">F5</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quick Load</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-white">F9</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Toggle Fullscreen</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-white">F11</kbd>
          </div>
        </div>
      </div>
      
      <SettingToggle
        label="Enable Gamepad Support"
        value={settings.gamepadEnabled || false}
        onChange={(value) => onChange('gamepadEnabled', value)}
      />
      
      <SettingToggle
        label="Invert Camera Y-Axis"
        value={settings.invertY || false}
        onChange={(value) => onChange('invertY', value)}
      />
    </div>
  );
}

// Notification Settings Tab
function NotificationSettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <SettingToggle
        label="Mission Reminders"
        value={settings.missionReminders !== false}
        onChange={(value) => onChange('missionReminders', value)}
      />
      <SettingToggle
        label="Daily Contract Notifications"
        value={settings.dailyNotifications !== false}
        onChange={(value) => onChange('dailyNotifications', value)}
      />
      <SettingToggle
        label="Partner Status Updates"
        value={settings.partnerNotifications !== false}
        onChange={(value) => onChange('partnerNotifications', value)}
      />
      <SettingToggle
        label="Achievement Unlocks"
        value={settings.achievementNotifications !== false}
        onChange={(value) => onChange('achievementNotifications', value)}
      />
    </div>
  );
}

// Privacy Settings Tab
function PrivacySettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <SettingToggle
        label="Send Anonymous Usage Data"
        value={settings.telemetry || false}
        onChange={(value) => onChange('telemetry', value)}
      />
      <SettingToggle
        label="Cloud Save Sync"
        value={settings.cloudSync !== false}
        onChange={(value) => onChange('cloudSync', value)}
      />
      <div className="pt-4">
        <NeuraButton variant="ghost" className="text-red-400 hover:bg-red-500/20">
          Delete Save Data
        </NeuraButton>
      </div>
    </div>
  );
}

// About Section
function AboutSection() {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-purple-400 mb-2">WHIX</h1>
        <p className="text-gray-400">Neurodivergent Delivery Simulator</p>
        <p className="text-sm text-gray-500 mt-4">Version 1.0.0</p>
      </div>
      
      <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-500/20">
        <p className="text-gray-300 text-sm leading-relaxed">
          WHIX is a cyberpunk-themed game about neurodivergent delivery partners navigating 
          a dystopian gig economy. Battle corporate exploitation while managing your team 
          of unique individuals in the neon-lit streets of Polanco.
        </p>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>© 2024 WHIX Game. All rights reserved.</p>
        <p className="mt-2">Made with ❤️ for the neurodivergent community</p>
      </div>
    </div>
  );
}

// Reusable Setting Components
function SettingSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="text-cyan-400 font-mono">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );
}

function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`
          relative w-12 h-6 rounded-full transition-colors duration-200
          ${value ? 'bg-purple-500' : 'bg-gray-700'}
        `}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
          animate={{ left: value ? '26px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function SettingSelect({ label, value, options, onChange }: { 
  label: string; 
  value: string; 
  options: { value: string; label: string }[]; 
  onChange: (value: string) => void 
}) {
  return (
    <div>
      <label className="text-gray-300 block mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}