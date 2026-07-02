// 鎼存梻鏁ら崘鍛纯閺傜増顥呭ù瀣箛閸?// 閸氼垰濮╅弮鑸殿梾閺屻儲婀囬崝鈥虫珤娑撳﹦娈戦張鈧弬鎵閺堫剨绱濋張澶嬫煀閻楀牊婀伴幓鎰仛閻劍鍩涙稉瀣祰鐎瑰顥?
const UPDATE_CONFIG_URL = "https://gitee.com/jiang-zhengyu666/smart-mistake-book/raw/master/version.json";
const CURRENT_VERSION = 3; // 娑?build.gradle 娑擃厾娈?versionCode 娣囨繃瀵旀稉鈧懛?
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
  // 閻劎閮寸紒鐔哥セ鐟欏牆娅掓稉瀣祰 APK閿涘奔绗呮潪钘夌暚閹存劕鎮楅悽銊﹀煕閻愮懓鍤崡鍐插讲鐎瑰顥?  window.open(apkUrl, "_blank");
}