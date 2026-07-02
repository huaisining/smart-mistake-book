// 闁圭厧鐡ㄥ濠氬极閵堝绀冮柛娑卞枟缁绢垶鏌￠崒婊冾暭妞ゃ儱鎳庨湁閻庯綆鍋呯粻娑㈡煕?// 闂佸憡鍑归崹鐗堟叏閳哄懎绫嶉柤鍛婎問濮婇箖鏌＄仦璇插姕婵犫偓閸ヮ剙绀夐柍銉ㄦ珪閻濄倕鈽夐幘绛瑰姛婵炲牊鍨垮鐢稿焵椤掑嫬妫橀柟娈垮枛椤ｅジ鏌￠崼顐㈠⒕缂佽鲸绻堝鍨緞鐎ｎ偆鍘愰梺缁橆殔閻楀﹤锕㈡导鏉戠闁归偊鍠撴禒娑㈡煟椤剙濡介柛鈺傜⊕缁嬪鈧綆鍘界粊浼存倵閻熼偊妲兼い?
const UPDATE_CONFIG_URL = "https://gitee.com/jiang-zhengyu666/smart-mistake-book/raw/master/version.json";
const CURRENT_VERSION = 5; // 婵?build.gradle 婵炴垶鎼╅崢鎯р枔?versionCode 婵烇絽娲︾换鍐偓鍨⒐缁嬪鍩€椤掑嫭鍤?
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
  // 闂佹椿娼块崝搴ㄦ焾鐎靛摜纾奸柣鏂挎憸閵堝鎮峰▎蹇曞婵炲懏甯楃粙澶屸偓锝庡幗缁?APK闂佹寧绋戞總鏃傜箔閸涱喗濮滈柦妯侯槺閺嗘岸鏌熺€涙ê濮囬柟顔筋殜閹粙濡搁敃鈧悡鏇㈡煟閹邦喗鍤€闁搞値鍣ｅ畷锟犲礃閹绘帟顔夐柣搴ｆ嚀椤︽娊藟?  window.open(apkUrl, "_blank");
}