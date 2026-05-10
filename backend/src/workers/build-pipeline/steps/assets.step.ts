import * as path from 'path';
import * as fs from 'fs-extra';
import * as sharp from 'sharp';
import { BuildContext, StepResult, BUILD_ERROR_CODES } from '../types';
import { ANDROID_ICON_SIZES, IOS_ICON_SIZES, ANDROID_PLAY_STORE_ICON_SIZE } from '../constants/icon-sizes';

async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function assetsStep(ctx: BuildContext): Promise<StepResult> {
  const start = Date.now();
  try {
    const { app, workDir } = ctx;

    // ── Icon Processing ──────────────────────────────

    if (app.iconUrl) {
      const iconBuffer = await downloadToBuffer(app.iconUrl);
      const iconMeta = await sharp(iconBuffer).metadata();

      if (!iconMeta.width || !iconMeta.height || iconMeta.width < 1024 || iconMeta.height < 1024) {
        return {
          success: false, duration: Date.now() - start, step: 'assets',
          error: `Icon must be at least 1024x1024. Got ${iconMeta.width}x${iconMeta.height}`,
          data: { errorCode: BUILD_ERROR_CODES.ASSET_INVALID },
        };
      }

      // Android mipmap icons
      for (const { density, size } of ANDROID_ICON_SIZES) {
        const dir = path.join(workDir, 'android', 'app', 'src', 'main', 'res', `mipmap-${density}`);
        await fs.ensureDir(dir);
        await sharp(iconBuffer).resize(size, size).png().toFile(path.join(dir, 'ic_launcher.png'));
        await sharp(iconBuffer).resize(size, size).png().toFile(path.join(dir, 'ic_launcher_round.png'));
      }

      // Play Store icon (512x512)
      const playStoreDir = path.join(workDir, 'assets');
      await sharp(iconBuffer).resize(ANDROID_PLAY_STORE_ICON_SIZE, ANDROID_PLAY_STORE_ICON_SIZE).png().toFile(path.join(playStoreDir, 'icon.png'));

      // Adaptive icon foreground
      await sharp(iconBuffer).resize(432, 432).png().toFile(path.join(playStoreDir, 'adaptive-icon.png'));

      // iOS icons
      const iosIconDir = path.join(workDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
      await fs.ensureDir(iosIconDir);

      const contentsImages: { filename: string; idiom: string; scale: string; size: string }[] = [];

      for (const { size, scale, filename } of IOS_ICON_SIZES) {
        const pixelSize = Math.round(size * scale);
        await sharp(iconBuffer).resize(pixelSize, pixelSize).png().toFile(path.join(iosIconDir, filename));
        contentsImages.push({
          filename,
          idiom: 'universal',
          scale: `${scale}x`,
          size: `${size}x${size}`,
        });
      }

      // Write Contents.json for iOS icons
      await fs.writeJson(path.join(iosIconDir, 'Contents.json'), {
        images: contentsImages,
        info: { author: 'quickapps', version: 1 },
      }, { spaces: 2 });
    }

    // ── Splash Screen ────────────────────────────────

    const splashBgColor = ctx.app.configJson.branding.splashBgColor ?? '#FFFFFF';

    if (app.splashLogoUrl) {
      const logoBuffer = await downloadToBuffer(app.splashLogoUrl);

      // Generate splash for each Android density
      for (const { density, width, height } of [
        { density: 'mdpi', width: 320, height: 480 },
        { density: 'hdpi', width: 480, height: 800 },
        { density: 'xhdpi', width: 720, height: 1280 },
        { density: 'xxhdpi', width: 960, height: 1600 },
        { density: 'xxxhdpi', width: 1280, height: 1920 },
      ]) {
        const dir = path.join(workDir, 'android', 'app', 'src', 'main', 'res', `drawable-port-${density}`);
        await fs.ensureDir(dir);

        const logoSize = Math.round(Math.min(width, height) * 0.4);
        const resizedLogo = await sharp(logoBuffer).resize(logoSize, logoSize, { fit: 'inside' }).png().toBuffer();

        await sharp({
          create: { width, height, channels: 4, background: splashBgColor },
        })
          .composite([{ input: resizedLogo, gravity: 'centre' }])
          .png()
          .toFile(path.join(dir, 'splash.png'));
      }

      // iOS splash
      const iosSplashDir = path.join(workDir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset');
      await fs.ensureDir(iosSplashDir);

      const splashSizes = [
        { name: 'splash-1x.png', width: 375, height: 812 },
        { name: 'splash-2x.png', width: 750, height: 1624 },
        { name: 'splash-3x.png', width: 1125, height: 2436 },
      ];

      for (const { name, width, height } of splashSizes) {
        const logoSize = Math.round(Math.min(width, height) * 0.3);
        const resizedLogo = await sharp(logoBuffer).resize(logoSize, logoSize, { fit: 'inside' }).png().toBuffer();

        await sharp({
          create: { width, height, channels: 4, background: splashBgColor },
        })
          .composite([{ input: resizedLogo, gravity: 'centre' }])
          .png()
          .toFile(path.join(iosSplashDir, name));
      }

      await fs.writeJson(path.join(iosSplashDir, 'Contents.json'), {
        images: splashSizes.map((s, i) => ({ filename: s.name, idiom: 'universal', scale: `${i + 1}x` })),
        info: { author: 'quickapps', version: 1 },
      }, { spaces: 2 });

      // Also write to assets/ for EAS
      const mainSplash = await sharp({
        create: { width: 1284, height: 2778, channels: 4, background: splashBgColor },
      })
        .composite([{
          input: await sharp(logoBuffer).resize(400, 400, { fit: 'inside' }).png().toBuffer(),
          gravity: 'centre',
        }])
        .png()
        .toBuffer();
      await fs.writeFile(path.join(workDir, 'assets', 'splash.png'), mainSplash);
    } else {
      // No splash logo — create a plain colored splash
      const mainSplash = await sharp({
        create: { width: 1284, height: 2778, channels: 4, background: splashBgColor },
      }).png().toBuffer();
      await fs.writeFile(path.join(workDir, 'assets', 'splash.png'), mainSplash);
    }

    return { success: true, duration: Date.now() - start, step: 'assets' };
  } catch (error) {
    return {
      success: false, duration: Date.now() - start, step: 'assets',
      error: (error as Error).message,
      data: { errorCode: BUILD_ERROR_CODES.ASSET_DOWNLOAD_FAILED },
    };
  }
}
