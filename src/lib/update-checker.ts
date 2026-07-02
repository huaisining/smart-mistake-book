// 搴旂敤鍐呮洿鏂版娴嬫湇鍔?// 鍚姩鏃舵鏌ユ湇鍔″櫒涓婄殑鏈€鏂扮増鏈紝鏈夋柊鐗堟湰鎻愮ず鐢ㄦ埛涓嬭浇瀹夎

const UPDATE_CONFIG_URL = "https://gitee.com/jiang-zhengyu666/smart-mistake-book/raw/master/version.json";
const CURRENT_VERSION = 2; // 涓?build.gradle 涓殑 versionCode 淇濇寔涓€鑷?
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
  // 鐢ㄧ郴缁熸祻瑙堝櫒涓嬭浇 APK锛屼笅杞藉畬鎴愬悗鐢ㄦ埛鐐瑰嚮鍗冲彲瀹夎
  window.open(apkUrl, "_blank");
}