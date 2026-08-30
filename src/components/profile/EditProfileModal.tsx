'use client';

import React, { useState, useRef } from 'react';
import { ArtisanUser } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { uploadAvatar } from '@/services/profileService';
import { X, Camera, User, Store, MapPin, Sparkles } from 'lucide-react';

type EditProfileModalProps = {
  user: ArtisanUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<ArtisanUser>) => Promise<void>;
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name || '');
  const [craft, setCraft] = useState(user.craft || user.shop || '');
  const [location, setLocation] = useState(user.location || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;

      // Upload avatar to Supabase Storage if new file selected
      if (selectedFile && user.id) {
        const uploaded = await uploadAvatar(user.id, selectedFile);
        if (uploaded) {
          finalAvatarUrl = uploaded;
        }
      }

      await onSave({
        name: name.trim(),
        craft: craft.trim(),
        shop: craft.trim(),
        location: location.trim(),
        bio: bio.trim(),
        avatarUrl: finalAvatarUrl || undefined,
      });

      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#faf6f0] rounded-3xl w-full max-w-md overflow-hidden soft-shadow border border-[#c4c8bc]/40 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#c4c8bc]/30 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#4a7c59]" />
            <h2 className="font-headline font-bold text-lg text-[#2e3230]">
              Edit Artisan Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6b6358] hover:bg-[#f0ece4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Avatar Edit */}
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#c8e8d0] border-4 border-white shadow-md flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-[#4a7c59]" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 bg-[#4a7c59] text-white p-1.5 rounded-full shadow border-2 border-white">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-label text-xs font-bold text-[#4a7c59] hover:underline"
            >
              Change Photo (Supabase Storage)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <Input
            label="Artisan Name"
            type="text"
            placeholder="Aapka Naam"
            leftIcon={<User className="w-4 h-4 text-[#74796e]" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Craft / Specialization"
            type="text"
            placeholder="Jaise: Pottery, Banarasi Weaving, Wood Carving"
            leftIcon={<Store className="w-4 h-4 text-[#74796e]" />}
            value={craft}
            onChange={(e) => setCraft(e.target.value)}
            required
          />

          <Input
            label="Location"
            type="text"
            placeholder="Jaise: Varanasi, Uttar Pradesh"
            leftIcon={<MapPin className="w-4 h-4 text-[#74796e]" />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="space-y-1">
            <label className="font-label text-xs font-semibold text-[#4a4e4a]">
              Bio / About Your Craft
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Apne craft aur parivarik kala ke baare mein likhein..."
              className="w-full bg-white border border-[#c4c8bc]/60 rounded-xl p-3 text-sm text-[#2e3230] focus:ring-2 focus:ring-[#4a7c59] focus:outline-none font-body resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              disabled={isSaving}
            >
              {isSaving ? 'Uploading & Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
