import { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

export default function cesiumPlugin(): Plugin {
  const ensureCesiumAssets = () => {
    const cesiumSource = path.join(
      __dirname,
      'node_modules',
      'cesium',
      'Build',
      'Cesium'
    );
    const cesiumDest = path.join(__dirname, 'public', 'cesium');

    if (!fs.existsSync(cesiumSource)) return;

    if (!fs.existsSync(cesiumDest)) {
      fs.mkdirSync(cesiumDest, { recursive: true });
      copyRecursiveSync(cesiumSource, cesiumDest);
    }
  };

  return {
    name: 'vite-plugin-cesium',
    config(config) {
      return {
        define: {
          CESIUM_BASE_URL: JSON.stringify('/cesium'),
        },
      };
    },
    buildStart() {
      ensureCesiumAssets();
    },
    configureServer(server) {
      ensureCesiumAssets();
    },
  };
}

function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
