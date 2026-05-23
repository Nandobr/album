"use client";

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const router = useRouter();
  const { stickers, resetAlbum, importStickers, isInitialized } = useAlbumStore();
  const { t } = useLanguageStore();
  const isLoaded = useMounted();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoaded || !isInitialized) return null;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stickers));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "album_backup_2026.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation: Check if it's an object and has at least one valid key
        if (typeof json === 'object' && json !== null) {
          importStickers(json);
          alert(t('settingsImportSuccess'));
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        alert(t('settingsImportError'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm(t('resetConfirm'))) {
      resetAlbum();
      router.push('/onboarding');
    }
  };

  return (
    <div className="space-y-8 min-h-full flex flex-col">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-800">{t('settingsTitle')}</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('settingsData')}</h3>
        
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <button 
            onClick={handleExport}
            className="w-full flex items-center p-4 hover:bg-gray-50 transition border-b border-gray-100 text-left"
          >
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
              <Download size={20} />
            </div>
            <div>
              <div className="font-bold text-gray-800">{t('settingsExport')}</div>
              <div className="text-sm text-gray-500">{t('settingsExportDesc')}</div>
            </div>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center p-4 hover:bg-gray-50 transition text-left"
          >
            <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
              <Upload size={20} />
            </div>
            <div>
              <div className="font-bold text-gray-800">{t('settingsImport')}</div>
              <div className="text-sm text-gray-500">{t('settingsImportDesc')}</div>
            </div>
          </button>
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">{t('settingsDanger')}</h3>
        
        <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
          <button 
            onClick={handleReset}
            className="w-full flex items-center p-4 hover:bg-red-50 transition text-left"
          >
            <div className="bg-red-100 text-red-600 p-3 rounded-full mr-4">
              <Trash2 size={20} />
            </div>
            <div>
              <div className="font-bold text-red-600">{t('settingsReset')}</div>
              <div className="text-sm text-red-400">{t('settingsResetDesc')}</div>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}
