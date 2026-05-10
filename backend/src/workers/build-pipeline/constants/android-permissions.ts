// Map addon slug → required Android permissions + manifest entries

export interface AndroidManifestEntry {
  permissions: string[];
  metaData?: { name: string; value: string }[];
  services?: { name: string; exported?: boolean; intentFilter?: string[] }[];
  receivers?: { name: string; actions: string[] }[];
  features?: { name: string; required: boolean }[];
}

export const ANDROID_MANIFEST_MAP: Record<string, AndroidManifestEntry> = {
  'onesignal-push': {
    permissions: ['POST_NOTIFICATIONS'],
    metaData: [
      { name: 'onesignal_app_id', value: '${onesignal_app_id}' },
    ],
  },
  'firebase-notifications': {
    permissions: ['POST_NOTIFICATIONS'],
  },
  'background-location': {
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_LOCATION',
    ],
  },
  'qr-scanner': {
    permissions: ['CAMERA'],
    features: [{ name: 'android.hardware.camera', required: false }],
  },
  'native-contacts': {
    permissions: ['READ_CONTACTS', 'WRITE_CONTACTS'],
  },
  'bluetooth': {
    permissions: [
      'BLUETOOTH',
      'BLUETOOTH_ADMIN',
      'BLUETOOTH_SCAN',
      'BLUETOOTH_CONNECT',
      'BLUETOOTH_ADVERTISE',
      'ACCESS_FINE_LOCATION',
    ],
  },
  'nfc-ibeacon': {
    permissions: ['NFC'],
    features: [{ name: 'android.hardware.nfc', required: false }],
  },
  'nfc-tag-readwrite': {
    permissions: ['NFC'],
    features: [{ name: 'android.hardware.nfc', required: false }],
  },
  'calendar-integration': {
    permissions: ['READ_CALENDAR', 'WRITE_CALENDAR'],
  },
  'device-sensors': {
    permissions: ['BODY_SENSORS'],
  },
  'flashlight': {
    permissions: ['FLASHLIGHT'],
    features: [{ name: 'android.hardware.camera.flash', required: false }],
  },
  'background-app-service': {
    permissions: ['FOREGROUND_SERVICE', 'WAKE_LOCK'],
  },
  'app-auto-launch': {
    permissions: ['RECEIVE_BOOT_COMPLETED'],
    receivers: [{
      name: '.BootReceiver',
      actions: ['android.intent.action.BOOT_COMPLETED'],
    }],
  },
  'google-admob': {
    permissions: [],
    metaData: [
      { name: 'com.google.android.gms.ads.APPLICATION_ID', value: '${admob_app_id}' },
    ],
  },
  'biometric-auth': {
    permissions: ['USE_BIOMETRIC', 'USE_FINGERPRINT'],
  },
  'disable-screenshot-enhanced': {
    permissions: [],
  },
  'background-audio': {
    permissions: ['FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_MEDIA_PLAYBACK'],
  },
  'custom-media-player': {
    permissions: ['FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_MEDIA_PLAYBACK', 'WAKE_LOCK'],
  },
  'download-manager': {
    permissions: ['WRITE_EXTERNAL_STORAGE', 'READ_EXTERNAL_STORAGE'],
  },
  'in-app-update': {
    permissions: ['REQUEST_INSTALL_PACKAGES'],
  },
};
