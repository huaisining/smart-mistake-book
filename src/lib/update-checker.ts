// 应用内更新检测服务
// 多源回退 + 重试机制，参考 Ahu_Plus 方案
import toast from "react-hot-toast";

// 稳定版 version.json 多源列表（按顺序回退）
const STABLE_VERSION_JSON_URLS = [
  "https://gitee.com/jiang-zhengyu666/smart-mistake-book/raw/master/version.json",
  "https://raw.githubusercontent.com/huaisining/smart-mistake-book/master/version.json",
];
const CURRENT_VERSION = 6;

export interface UpdateInfo {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  releaseNotes: string;
}

/** 单次 fetch 带超时 */
async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-cache" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** 多源回退获取 version.json */
async function fetchVersionJson(): Promise<UpdateInfo | null> {
  for (const url of STABLE_VERSION_JSON_URLS) {
    try {
      const response = await fetchWithTimeout(url, 12000);
      const text = await response.text();
      const data = JSON.parse(text.replace(/^\uFEFF/, "")) as UpdateInfo;
      if (data.versionCode && data.versionName) return data;
    } catch {
      // 当前源失败，尝试下一个
      continue;
    }
  }
  return null;
}

/** 带重试的版本检查 */
export async function checkForUpdate(retries: number = 2): Promise<UpdateInfo | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // 重试前等待递增延迟
      await new Promise(r => setTimeout(r, attempt * 1500));
    }
    const data = await fetchVersionJson();
    if (data) {
      if (data.versionCode > CURRENT_VERSION) return data;
      return null; // 已是最新
    }
  }
  // 全部重试失败
  return null;
}

/** 手动检查更新（带 toast 反馈） */
export function checkForUpdateWithToast(): Promise<UpdateInfo | null> {
  return checkForUpdate(3).then((result) => {
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

/** 打开浏览器下载 APK */
export function downloadUpdate(apkUrl: string): void {
  window.open(apkUrl, "_blank");
}