// 应用内更新检测服务
// 启动时检查服务器上的最新版本，有新版本提示用户下载安装

const UPDATE_CONFIG_URL = "https://gitee.com/huaisining/smart-mistake-book/raw/master/version.json";
const CURRENT_VERSION = 2; // 与 build.gradle 中的 versionCode 保持一致

export interface UpdateInfo {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  releaseNotes: string;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(UPDATE_CONFIG_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data: UpdateInfo = await response.json();
    if (data.versionCode > CURRENT_VERSION) return data;
    return null;
  } catch {
    console.log("Update check skipped (network unavailable)");
    return null;
  }
}

export function downloadUpdate(apkUrl: string): void {
  // 用系统浏览器下载 APK，下载完成后用户点击即可安装
  window.open(apkUrl, "_blank");
}