// 应用内更新检测服务
import toast from "react-hot-toast";

const UPDATE_CONFIG_URL = "https://gitee.com/jiang-zhengyu666/smart-mistake-book/raw/master/version.json";
const CURRENT_VERSION = 6;

export interface UpdateInfo {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  releaseNotes: string;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(UPDATE_CONFIG_URL, { signal: controller.signal, cache: "no-cache" });
    clearTimeout(timeoutId);
    if (!response.ok) {
      toast.error("更新服务器响应异常 (" + response.status + ")");
      return null;
    }
    const text = await response.text();
    const data: UpdateInfo = JSON.parse(text.replace(/^\uFEFF/, ""));
    if (data.versionCode > CURRENT_VERSION) return data;
    return null;
  } catch (e: any) {
    const msg = e.name === "AbortError" ? "更新检测超时，请检查网络" : "更新检测失败，请检查网络连接";
    console.log("Update check failed:", msg);
    // Only toast on manual check to avoid annoying on startup
    return null;
  }
}

export function checkForUpdateWithToast(): Promise<UpdateInfo | null> {
  return checkForUpdate().then((result) => {
    if (result) {
      toast.success("发现新版本 v" + result.versionName + "！");
    } else {
      toast.success("已是最新版本");
    }
    return result;
  }).catch(() => {
    toast.error("网络连接失败，请检查网络");
    return null;
  });
}

export function downloadUpdate(apkUrl: string): void {
  window.open(apkUrl, "_blank");
}