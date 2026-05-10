// Map addon slug → required Info.plist entries

export interface IosPlistEntry {
  keys: Record<string, string | boolean | string[]>;
  backgroundModes?: string[];
  entitlements?: Record<string, boolean | string>;
}

export const IOS_PLIST_MAP: Record<string, IosPlistEntry> = {
  'onesignal-push': {
    keys: {},
    backgroundModes: ['remote-notification'],
    entitlements: { 'aps-environment': 'production' },
  },
  'firebase-notifications': {
    keys: {},
    backgroundModes: ['remote-notification'],
    entitlements: { 'aps-environment': 'production' },
  },
  'background-location': {
    keys: {
      NSLocationAlwaysUsageDescription: 'This app needs your location to provide location-based services.',
      NSLocationWhenInUseUsageDescription: 'This app uses your location while in use.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs your location for background updates.',
    },
    backgroundModes: ['location'],
  },
  'qr-scanner': {
    keys: {
      NSCameraUsageDescription: 'This app needs camera access to scan QR codes and barcodes.',
    },
  },
  'native-contacts': {
    keys: {
      NSContactsUsageDescription: 'This app needs access to your contacts.',
    },
  },
  'bluetooth': {
    keys: {
      NSBluetoothAlwaysUsageDescription: 'This app uses Bluetooth to connect to nearby devices.',
      NSBluetoothPeripheralUsageDescription: 'This app uses Bluetooth to communicate with peripherals.',
    },
  },
  'nfc-ibeacon': {
    keys: {
      NFCReaderUsageDescription: 'This app uses NFC to read tags and interact with beacons.',
    },
    backgroundModes: ['nfc'],
  },
  'nfc-tag-readwrite': {
    keys: {
      NFCReaderUsageDescription: 'This app uses NFC to read and write tags.',
    },
  },
  'calendar-integration': {
    keys: {
      NSCalendarsUsageDescription: 'This app needs access to your calendar to manage events.',
    },
  },
  'biometric-auth': {
    keys: {
      NSFaceIDUsageDescription: 'This app uses Face ID to verify your identity.',
    },
  },
  'device-sensors': {
    keys: {
      NSMotionUsageDescription: 'This app uses device sensors for motion-based features.',
    },
  },
  'siri-shortcuts': {
    keys: {
      NSSiriUsageDescription: 'This app supports Siri Shortcuts for quick actions.',
    },
  },
  'haptic-feedback': {
    keys: {},
  },
  'background-audio': {
    keys: {},
    backgroundModes: ['audio'],
  },
  'custom-media-player': {
    keys: {},
    backgroundModes: ['audio'],
  },
  'social-login': {
    keys: {
      // These get dynamically populated from addon config
    },
  },
  'google-admob': {
    keys: {
      GADApplicationIdentifier: '${admob_app_id_ios}',
      SKAdNetworkItems: true, // Special handling — array of SKAdNetwork IDs
    },
  },
};
