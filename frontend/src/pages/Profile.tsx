import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Building, Clock, Globe, Mail, MapPin, Phone, Save, User } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ActionButton } from '../components/ui/action-button';
import { ErrorAlert } from '../components/ui/error-alert';
import { LoadingPage } from '../components/ui/loading-spinner';
import { PageHeader } from '../components/ui/page-header';
import { useProfileState } from '../hooks/useProfileState';
import { UpdateProfileDto } from '../types/profile';

// Validation schema
const profileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  website: z.string().url('Website must be a valid URL').optional().or(z.literal('')),
  email: z.string().email('Email must be a valid email address'),
  openingTime: z.string().min(5, 'Opening time must be at least 5 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  sector: z.string().min(2, 'Sector must be at least 2 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { state, loadProfile, updateProfile, clearError } = useProfileState();
  const { profile, loading, saving, error } = state;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  // Load profile data on mount ONLY
  useEffect(() => {
    loadProfile();
  }, []); // Empty dependency array - run only on mount

  // Reset form when profile data is loaded
  useEffect(() => {
    if (profile) {
      reset({
        companyName: profile.companyName,
        logoUrl: profile.logoUrl || '',
        description: profile.description,
        phoneNumber: profile.phoneNumber,
        website: profile.website || '',
        email: profile.email,
        openingTime: profile.openingTime,
        address: profile.address,
        sector: profile.sector,
      });
    }
  }, [profile, reset]);

  // Clear error when component unmounts ONLY
  useEffect(() => {
    return () => clearError();
  }, []); // Empty dependency array - run only on mount/unmount

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return;

    try {
      const updateData: UpdateProfileDto = {
        companyName: data.companyName,
        logoUrl: data.logoUrl || undefined,
        description: data.description,
        phoneNumber: data.phoneNumber,
        website: data.website || undefined,
        email: data.email,
        openingTime: data.openingTime,
        address: data.address,
        sector: data.sector,
      };

      await updateProfile(profile.id, updateData);
      
      // Reset form dirty state
      reset(data);
    } catch (err: any) {
      // Error handling is done in the hook
      console.error('Profile update failed:', err);
    }
  };

  if (loading) {
    return <LoadingPage text="Loading profile..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <PageHeader
        title="Company Profile"
        description="Manage your company information and settings"
        icon={User}
        iconColor="orange"
      />

      <div className="animate-scale-in">
        <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Error Messages */}
            {error && (
              <ErrorAlert error={error} onClose={clearError} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Username (Read-only) */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile?.username || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed transition-colors"
                  />
                  <p className="text-xs text-gray-500">Username cannot be changed</p>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building className="w-4 h-4 text-gray-400" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    {...register('companyName')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors"
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-3 h-3">⚠</span>
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Globe className="w-4 h-4 text-gray-400" />
                    Logo URL
                  </label>
                  <input
                    type="url"
                    {...register('logoUrl')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors"
                    placeholder="https://example.com/logo.png"
                  />
                  {errors.logoUrl && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-3 h-3">⚠</span>
                      {errors.logoUrl.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors resize-none"
                    placeholder="Describe your company..."
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-3 h-3">⚠</span>
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    {...register('phoneNumber')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-3 h-3">⚠</span>
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Website */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Globe className="w-4 h-4 text-gray-400" />
                    Website
                  </label>
                  <input
                    type="url"
                    {...register('website')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors"
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-3 h-3">⚠</span>
                      {errors.website.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors"
                    placeholder="contact@company.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-3 h-3">⚠</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Opening Time */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Opening Hours *
                  </label>
                  <input
                    type="text"
                    {...register('openingTime')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors"
                    placeholder="Mon-Fri 9:00-18:00"
                  />
                  {errors.openingTime && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-3 h-3">⚠</span>
                      {errors.openingTime.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Address *
                  </label>
                  <textarea
                    {...register('address')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors resize-none"
                    placeholder="123 Main St, City, State, ZIP"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-3 h-3">⚠</span>
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Sector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Business Sector *
                  </label>
                  <input
                    type="text"
                    {...register('sector')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors"
                    placeholder="e.g., Technology, Retail, Healthcare"
                  />
                  {errors.sector && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-3 h-3">⚠</span>
                      {errors.sector.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <ActionButton
                type="submit"
                icon={Save}
                loading={saving}
                disabled={!isDirty}
                variant="warning"
              >
                {saving ? "Saving..." : "Save Changes"}
              </ActionButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 