// Android mipmap icon sizes
export const ANDROID_ICON_SIZES = [
  { density: 'mdpi', size: 48 },
  { density: 'hdpi', size: 72 },
  { density: 'xhdpi', size: 96 },
  { density: 'xxhdpi', size: 144 },
  { density: 'xxxhdpi', size: 192 },
] as const;

export const ANDROID_PLAY_STORE_ICON_SIZE = 512;

// iOS AppIcon sizes (Contents.json idiom: "universal")
export const IOS_ICON_SIZES = [
  { size: 20, scale: 2, filename: 'icon-20@2x.png' },
  { size: 20, scale: 3, filename: 'icon-20@3x.png' },
  { size: 29, scale: 2, filename: 'icon-29@2x.png' },
  { size: 29, scale: 3, filename: 'icon-29@3x.png' },
  { size: 40, scale: 2, filename: 'icon-40@2x.png' },
  { size: 40, scale: 3, filename: 'icon-40@3x.png' },
  { size: 60, scale: 2, filename: 'icon-60@2x.png' },
  { size: 60, scale: 3, filename: 'icon-60@3x.png' },
  { size: 76, scale: 2, filename: 'icon-76@2x.png' },
  { size: 83.5, scale: 2, filename: 'icon-83.5@2x.png' },
  { size: 1024, scale: 1, filename: 'icon-1024.png' },
] as const;

// Splash screen sizes
export const ANDROID_SPLASH_SIZES = [
  { density: 'mdpi', width: 320, height: 480 },
  { density: 'hdpi', width: 480, height: 800 },
  { density: 'xhdpi', width: 720, height: 1280 },
  { density: 'xxhdpi', width: 960, height: 1600 },
  { density: 'xxxhdpi', width: 1280, height: 1920 },
] as const;
