import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '../env';
import { subscribePush, unsubscribePush } from '../api/notifications';
import { UsersService } from '../api/users';
import type { UserDto, UserUpdateDto } from '../types/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, LoadingSpinner } from '../components/ui';

interface FormErrors {
  name?: string;
  email?: string;
  sedeId?: string;
}

export default function Profile() {
  const { t } = useTranslation('profile');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [user, setUser] = useState<UserDto | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pushSub, setPushSub] = useState<PushSubscription | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [sedeId, setSedeId] = useState<string>('');
  const [schedule, setSchedule] = useState<string>('');

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    // Validar nombre
    if (!name || name.trim().length < 2) {
      errors.name = t('validation.nameMinLength');
    }

    // Validar email
    if (!email || email.trim().length === 0) {
      errors.email = t('validation.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = t('validation.emailInvalid');
      }
    }

    // Validar sede
    if (!sedeId || sedeId === '') {
      errors.sedeId = t('validation.sedeRequired');
    }

    return errors;
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errors = validateForm();
    setFormErrors(errors);
  };

  useEffect(() => {
    setLoading(true);
    UsersService.getCurrentUser()
      .then((u) => {
        setUser(u);
        setName(u.name ?? '');
        setEmail(u.email ?? '');
        setSedeId(u.sedeId ?? '');
      })
      .catch((e) => {
        console.error('Error loading user:', e);
        showMessage('error', t('actions.loadError'));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como "touched"
    setTouched({
      name: true,
      email: true,
      sedeId: true,
    });

    // Validar formulario
    const errors = validateForm();
    setFormErrors(errors);

    // Si hay errores, no enviar
    if (Object.keys(errors).length > 0) {
      showMessage('error', t('validation.formErrors'));
      return;
    }

    try {
      setSaving(true);
      const payload: UserUpdateDto = { name, email, sedeId };
      const updated = await UsersService.updateCurrentUser(payload);
      setUser(updated);
      showMessage('success', t('actions.updateSuccess'));
    } catch (e: any) {
      console.error('[Profile] Error updating user:', e);
      const errorMsg = e?.response?.data?.message || e?.message || t('actions.updateError');
      showMessage('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Actualizar el valor
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'sedeId':
        setSedeId(value);
        break;
      case 'schedule':
        setSchedule(value);
        break;
    }
    
    // Si el campo ya fue tocado, revalidar inmediatamente
    if (touched[field]) {
      setTimeout(() => {
        const errors = validateForm();
        setFormErrors(errors);
      }, 0);
    }
  };

  const sedeOptions = [
    { value: '', label: t('personal.sedePlaceholder') },
    { value: 'SEDE-1', label: t('sede.SEDE-1') },
    { value: 'SEDE-2', label: t('sede.SEDE-2') },
    { value: 'SEDE-3', label: t('sede.SEDE-3') },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{t('actions.loadError')}</p>
      </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('personal.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nota de campos obligatorios */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="text-red-600 font-bold">*</span> {t('personal.required')}
              </p>
            </div>

            <Input
              label={
                <span>
                  {t('personal.name')} <span className="text-red-600">*</span>
                </span>
              }
              type="text"
              value={name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleFieldBlur('name')}
              error={touched.name ? formErrors.name : undefined}
              placeholder={t('personal.namePlaceholder')}
              required
            />

            <Input
              label={
                <span>
                  {t('personal.email')} <span className="text-red-600">*</span>
                </span>
              }
              type="email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              error={touched.email ? formErrors.email : undefined}
              placeholder={t('personal.emailPlaceholder')}
              helperText={t('personal.emailHelper')}
              required
            />

            <Select
              label={
                <span>
                  {t('personal.sede')} <span className="text-red-600">*</span>
                </span>
              }
              value={sedeId}
              onChange={(e) => handleInputChange('sedeId', e.target.value)}
              onBlur={() => handleFieldBlur('sedeId')}
              options={sedeOptions}
              error={touched.sedeId ? formErrors.sedeId : undefined}
              required
            />

            <Input
              label={t('personal.schedule')}
              type="text"
              value={schedule}
              onChange={(e) => handleInputChange('schedule', e.target.value)}
              placeholder={t('personal.schedulePlaceholder')}
              helperText={t('personal.scheduleHelper')}
            />

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                loading={saving}
              >
                {saving ? t('actions.saving') : t('actions.save')}
        </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">{t('account.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">{t('account.userId')}</p>
                <p className="font-mono text-gray-900">{user.id}</p>
              </div>
              {user.role && (
                <div>
                  <p className="text-gray-500">{t('account.role')}</p>
                  <p className="font-medium text-gray-900">{user.role}</p>
                </div>
              )}
            </div>
      </div>
        </CardContent>
      </Card>

      {/* Notificaciones Push */}
      <Card>
        <CardHeader>
          <CardTitle>{t('notifications.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button type="button" onClick={() => enablePush(setPushSub, setPushError, t)}>
              {t('notifications.enable')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => disablePush(setPushSub, setPushError, t)} disabled={!pushSub}>
              {t('notifications.disable')}
            </Button>
          </div>
          {pushError && <p className="text-red-600 mt-2 text-sm">{pushError}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

async function enablePush(setPushSub: (s: PushSubscription | null) => void, setPushError: (e: string | null) => void, t: (key: string) => string) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Push API no soportada');
    const reg = await navigator.serviceWorker.register('/sw.js');
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const key = env.VAPID_PUBLIC_KEY || '';
      const appKey = urlBase64ToUint8Array(key);
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appKey });
    }
    const p256dh = arrayBufferToBase64(sub.getKey('p256dh'));
    const auth = arrayBufferToBase64(sub.getKey('auth'));
    await subscribePush({ endpoint: sub.endpoint, p256dhKey: p256dh, authKey: auth });
    setPushSub(sub);
    setPushError(null);
  } catch (e: any) {
    setPushError(e?.message || t('notifications.error'));
  }
}

async function disablePush(setPushSub: (s: PushSubscription | null) => void, setPushError: (e: string | null) => void, t: (key: string) => string) {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await unsubscribePush(sub.endpoint);
      await sub.unsubscribe();
    }
    setPushSub(null);
    setPushError(null);
  } catch (e: any) {
    setPushError(e?.message || t('notifications.error'));
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buf: ArrayBuffer | null) {
  if (!buf) return '';
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

