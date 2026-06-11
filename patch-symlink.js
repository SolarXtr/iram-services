const fs = require('fs');
const path = require('path');
const Module = require('module');

function copyDirSync(src, dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function patchFs(fsModule) {
  if (!fsModule) return;
  
  if (fsModule.symlinkSync && !fsModule.symlinkSync.isPatched) {
    const originalSymlinkSync = fsModule.symlinkSync;
    fsModule.symlinkSync = function (target, destPath, type) {
      const absoluteTarget = path.resolve(path.dirname(destPath), target);
      console.log(`[symlinkSync] ${target} -> ${destPath} (resolved: ${absoluteTarget})`);
      try {
        if (fs.existsSync(absoluteTarget) && fs.statSync(absoluteTarget).isDirectory()) {
          console.log(`[symlinkSync] Copying directory ${absoluteTarget} to ${destPath}`);
          copyDirSync(absoluteTarget, destPath);
        } else {
          console.log(`[symlinkSync] Copying file ${absoluteTarget} to ${destPath}`);
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { force: true });
          }
          fs.copyFileSync(absoluteTarget, destPath);
        }
      } catch (e) {
        console.warn(`[symlinkSync] Failed to intercept: ${e.message}. Falling back to original.`);
        originalSymlinkSync(target, destPath, type);
      }
    };
    fsModule.symlinkSync.isPatched = true;
  }

  if (fsModule.symlink && !fsModule.symlink.isPatched) {
    const originalSymlink = fsModule.symlink;
    fsModule.symlink = function (target, destPath, type, callback) {
      if (typeof type === 'function') {
        callback = type;
        type = undefined;
      }
      const absoluteTarget = path.resolve(path.dirname(destPath), target);
      console.log(`[symlink] ${target} -> ${destPath} (resolved: ${absoluteTarget})`);
      try {
        if (fs.existsSync(absoluteTarget) && fs.statSync(absoluteTarget).isDirectory()) {
          console.log(`[symlink] Copying directory ${absoluteTarget} to ${destPath}`);
          copyDirSync(absoluteTarget, destPath);
        } else {
          console.log(`[symlink] Copying file ${absoluteTarget} to ${destPath}`);
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { force: true });
          }
          fs.copyFileSync(absoluteTarget, destPath);
        }
        if (callback) callback(null);
      } catch (e) {
        console.warn(`[symlink] Failed to intercept: ${e.message}. Falling back to original.`);
        originalSymlink(target, destPath, type, callback);
      }
    };
    fsModule.symlink.isPatched = true;
  }

  if (fsModule.promises && fsModule.promises.symlink && !fsModule.promises.symlink.isPatched) {
    const originalPromisesSymlink = fsModule.promises.symlink;
    fsModule.promises.symlink = async function(target, destPath, type) {
      const absoluteTarget = path.resolve(path.dirname(destPath), target);
      console.log(`[promises.symlink] ${target} -> ${destPath} (resolved: ${absoluteTarget})`);
      try {
        const exists = fs.existsSync(absoluteTarget);
        const isDir = exists && (await fs.promises.stat(absoluteTarget)).isDirectory();
        if (isDir) {
          console.log(`[promises.symlink] Copying directory ${absoluteTarget} to ${destPath}`);
          copyDirSync(absoluteTarget, destPath);
        } else {
          console.log(`[promises.symlink] Copying file ${absoluteTarget} to ${destPath}`);
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { force: true });
          }
          await fs.promises.copyFile(absoluteTarget, destPath);
        }
      } catch (e) {
        console.warn(`[promises.symlink] Failed to intercept: ${e.message}. Falling back to original.`);
        return originalPromisesSymlink(target, destPath, type);
      }
    };
    fsModule.promises.symlink.isPatched = true;
  }
}

// Hook Module.require to catch fs loads
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  const exports = originalRequire.apply(this, arguments);
  if (id === 'fs' || id === 'node:fs' || id === 'fs/promises' || id === 'node:fs/promises') {
    patchFs(exports);
    if (exports.promises) {
      patchFs(exports.promises);
    }
  }
  return exports;
};

// Also patch already-loaded fs
patchFs(fs);
patchFs(fs.promises);

console.log("Applying fs.symlink monkey-patch...");


