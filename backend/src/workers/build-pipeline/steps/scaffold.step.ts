import * as path from 'path';
import * as fs from 'fs-extra';
import * as Handlebars from 'handlebars';
import { BuildContext, StepResult } from '../types';

const TEMPLATE_DIR = path.resolve(__dirname, '../../../../capacitor-template');

export async function scaffoldStep(ctx: BuildContext): Promise<StepResult> {
  const start = Date.now();
  try {
    const { app, build, workDir } = ctx;
    const config = app.configJson;

    // 1. Copy template into work directory
    await fs.copy(TEMPLATE_DIR, workDir, { overwrite: true });

    // 2. Generate capacitor.config.ts from Handlebars template
    const capTemplatePath = path.join(workDir, 'capacitor.config.ts.hbs');
    if (await fs.pathExists(capTemplatePath)) {
      const template = await fs.readFile(capTemplatePath, 'utf-8');
      const compiled = Handlebars.compile(template);
      const capConfig = compiled({
        bundleId: app.bundleId,
        appName: app.name,
        url: app.url,
        splashDuration: (config.branding.splashDuration ?? 2) * 1000,
        splashBgColor: config.branding.splashBgColor ?? '#FFFFFF',
        splashAnimation: config.branding.splashAnimation ?? 'fade',
        fadeOutDuration: (config.branding.splashAnimation ?? 'fade') === 'fade' ? 500 : 0,
        statusBarStyle: config.display.statusBarStyle ?? 'dark',
        statusBarColor: config.display.statusBarColor,
        customUrlScheme: config.links.customUrlScheme ?? app.bundleId,
        pullToRefresh: config.display.pullToRefresh,
        pinchToZoom: config.display.pinchToZoom,
        domainWhitelist: config.links.domainWhitelist,
        domainWhitelistJson: config.links.domainWhitelist?.map(d => `'${d}'`).join(', '),
        addonPluginConfigs: [],
      });
      await fs.writeFile(path.join(workDir, 'capacitor.config.ts'), capConfig);
      await fs.remove(capTemplatePath);
    }

    // 3. Generate app.json from template
    const appJsonTemplatePath = path.join(workDir, 'app.json.hbs');
    if (await fs.pathExists(appJsonTemplatePath)) {
      const template = await fs.readFile(appJsonTemplatePath, 'utf-8');
      const compiled = Handlebars.compile(template);
      const appJson = compiled({
        appName: app.name,
        slug: app.bundleId.replace(/\./g, '-'),
        versionName: config.advanced.appVersionName ?? '1.0.0',
        versionCode: config.advanced.appVersionCode ?? build.buildNumber,
        orientation: config.display.orientation ?? 'portrait',
        splashBgColor: config.branding.splashBgColor ?? '#FFFFFF',
        bundleId: app.bundleId,
        themeColor: config.branding.themeColor ?? '#F97316',
      });
      await fs.writeFile(path.join(workDir, 'app.json'), appJson);
      await fs.remove(appJsonTemplatePath);
    }

    // 4. Write index.html with the user's URL
    const indexPath = path.join(workDir, 'www', 'index.html');
    if (await fs.pathExists(indexPath)) {
      let html = await fs.readFile(indexPath, 'utf-8');
      html = html.replace('{{APP_URL}}', app.url);
      await fs.writeFile(indexPath, html);
    }

    // 5. Create assets directory
    await fs.ensureDir(path.join(workDir, 'assets'));

    return { success: true, duration: Date.now() - start, step: 'scaffold' };
  } catch (error) {
    return {
      success: false,
      duration: Date.now() - start,
      step: 'scaffold',
      error: (error as Error).message,
    };
  }
}
