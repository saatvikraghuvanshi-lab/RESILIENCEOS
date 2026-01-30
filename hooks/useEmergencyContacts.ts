
import { useState, useCallback } from 'react';
import { AssetCategory } from '../services/EmergencyData';

export const useEmergencyContacts = () => {
  const [activeCategory, setActiveCategory] = useState<AssetCategory | null>(null);

  const openContacts = useCallback((category: AssetCategory) => {
    setActiveCategory(category);
  }, []);

  const closeContacts = useCallback(() => {
    setActiveCategory(null);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  }, []);

  return {
    activeCategory,
    openContacts,
    closeContacts,
    copyToClipboard
  };
};
