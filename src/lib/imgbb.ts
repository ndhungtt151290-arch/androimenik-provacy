/**
 * ImgBB image upload service
 * Upload ảnh lên ImgBB
 * Có retry với exponential backoff khi gặp lỗi
 */

import { IMGBB_API_KEY } from "../config/ads";
import { logger } from "../utils/logger";

const IMGBB_API = "https://api.imgbb.com/1/upload";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export interface ImgBBUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Mutex lock: chỉ cho phép 1 request upload tại một thời điểm
let uploadInProgress: Promise<ImgBBUploadResult> | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readFileAsBase64(fileUri: string): Promise<string> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error("Failed to convert image to base64"));
      }
    };
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}

async function doUpload(
  base64Data: string,
  retryCount: number = 0
): Promise<ImgBBUploadResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    // ImgBB requires FormData
    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", base64Data);

    const result = await fetch(IMGBB_API, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (result.status === 429) {
      const retryAfter = result.headers.get("Retry-After");
      let waitMs = BASE_DELAY_MS * Math.pow(2, retryCount);

      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          waitMs = Math.max(seconds * 1000, waitMs);
        }
      }

      logger.log(`[ImgBB] Rate limited (429), waiting ${waitMs}ms before retry ${retryCount + 1}/${MAX_RETRIES}`);

      if (retryCount < MAX_RETRIES - 1) {
        await delay(waitMs);
        return doUpload(base64Data, retryCount + 1);
      } else {
        return {
          success: false,
          error: "ImgBB rate limit exceeded. Please try again later.",
        };
      }
    }

    if (!result.ok) {
      let errorMessage = `Upload failed: ${result.status}`;
      try {
        const errorData = await result.json();
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // ignore parse error
      }
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await result.json();

    // ImgBB response: { data: { url: "...", display_url: "..." }, success: true }
    if (data.success && (data.data?.url || data.data?.display_url)) {
      return {
        success: true,
        url: data.data.url || data.data.display_url,
      };
    } else {
      return {
        success: false,
        error: data.error?.message || "Failed to get image URL from ImgBB",
      };
    }
  } catch (fetchError: any) {
    clearTimeout(timeoutId);

    if (fetchError.name === "AbortError") {
      return { success: false, error: "Timeout: Image upload took too long" };
    }

    logger.warn("[ImgBB] Upload error:", fetchError);
    return {
      success: false,
      error: fetchError.message || "Failed to upload image",
    };
  }
}

export async function uploadToImgBB(imageUri: string): Promise<ImgBBUploadResult> {
  // Nếu đang có request đang chạy, đợi nó xong rồi mới làm request mới
  if (uploadInProgress) {
    logger.log("[ImgBB] Waiting for previous upload to finish...");
    return uploadInProgress;
  }

  uploadInProgress = (async () => {
    try {
      const base64Data = await readFileAsBase64(imageUri);
      return await doUpload(base64Data);
    } finally {
      uploadInProgress = null;
    }
  })();

  return uploadInProgress;
}

// Backward compatibility alias
export const uploadToImgur = uploadToImgBB;
