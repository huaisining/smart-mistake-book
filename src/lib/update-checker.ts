// 閹煎瓨姊婚弫銈夊礃閸涱喗绾柡鍌滃椤ュ懎霉鐎ｎ偅绠涢柛?// 闁告凹鍨版慨鈺呭籍閼告姊鹃柡灞诲劜濠€鍥礉閳ヨ櫕鐝ゅ☉鎾筹功濞堟垿寮甸埀顒勫棘閹殿喖顣奸柡鍫墾缁辨繈寮垫径瀣厐闁绘鐗婂﹢浼村箵閹邦喓浠涢柣顫妽閸╂稒绋夌€ｎ厽绁伴悗鐟邦槼椤?
const UPDATE_CONFIG_URL = "https://gitee.com/jiang-zhengyu666/smart-mistake-book/raw/master/version.json";
const CURRENT_VERSION = 4; // 濞?build.gradle 濞戞搩鍘惧▓?versionCode 濞ｅ洦绻冪€垫梹绋夐埀顒勬嚊?
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
  // 闁活潿鍔庨柈瀵哥磼閻斿摜銈婚悷娆忕墕濞呮帗绋夌€ｎ厽绁?APK闁挎稑濂旂粭鍛姜閽樺鏆氶柟瀛樺姇閹鎮介妸锕€鐓曢柣鎰嚀閸ゎ噣宕￠崘鎻掕閻庣懓顦抽ˉ?  window.open(apkUrl, "_blank");
}