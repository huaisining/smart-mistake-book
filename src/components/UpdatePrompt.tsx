"use client";

import { useEffect, useState } from "react";
import { checkForUpdate, downloadUpdate, UpdateInfo } from "@/lib/update-checker";

export default function UpdatePrompt() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkForUpdate().then((info) => {
      if (info) setUpdate(info);
    });
  }, []);

  if (!update || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-bold text-gray-900">发现新版本</h3>
          <p className="text-sm text-gray-500 mt-1">
            v{update.versionName} 可用（当前版本较低）
          </p>
        </div>

        {update.releaseNotes && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-800 whitespace-pre-wrap">
            {update.releaseNotes}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            稍后提醒
          </button>
          <button
            onClick={() => {
              downloadUpdate(update.apkUrl);
              setDismissed(true);
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            立即更新
          </button>
        </div>
      </div>
    </div>
  );
}