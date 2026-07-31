import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
);
const version = packageJson.version;
if (typeof version !== "string" || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`Invalid package.json version: ${JSON.stringify(version)}`);
  process.exit(1);
}

const cargoTomlPath = join(root, "src-tauri/Cargo.toml");
const cargoToml = readFileSync(cargoTomlPath, "utf8");
const nextCargoToml = cargoToml.replace(
  /^version = "[^"]+"/m,
  `version = "${version}"`,
);
if (nextCargoToml === cargoToml && !cargoToml.includes(`version = "${version}"`)) {
  console.error("Could not find version field in src-tauri/Cargo.toml");
  process.exit(1);
}
writeFileSync(cargoTomlPath, nextCargoToml);

const cargoLockPath = join(root, "src-tauri/Cargo.lock");
const cargoLock = readFileSync(cargoLockPath, "utf8");
const nextCargoLock = cargoLock.replace(
  /(\[\[package\]\]\nname = "haven-build"\n)version = "[^"]+"/,
  `$1version = "${version}"`,
);
if (nextCargoLock === cargoLock && !cargoLock.includes(`version = "${version}"`)) {
  console.error('Could not find haven-build package in src-tauri/Cargo.lock');
  process.exit(1);
}
writeFileSync(cargoLockPath, nextCargoLock);

console.log(`Synced Cargo version to ${version}`);
