/**
 * Imgur anonymous upload service
 * Upload ảnh lên Imgur không cần API key (anonymous upload)
 */

import { IMGUR_CLIENT_ID } from "../config/ads";

const IMGUR_ANONYMOUS_API = "https://api.imgur.com/3/image";

export interface ImgurUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadToImgur(imageUri: string): Promise<ImgurUploadResult> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("image", blob, "screenshot.png");
    formData.append("type", "file");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const result = await fetch(IMGUR_ANONYMOUS_API, {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!result.ok) {
        const errorData = await result.json().catch(() => ({}));
        return {
          success: false,
          error: `Upload failed: ${result.status} - ${errorData?.data?.error || "Unknown error"}`,
        };
      }

      const data = await result.json();

      if (data.success && data.data?.link) {
        return {
          success: true,
          url: data.data.link,
        };
      } else {
        return {
          success: false,
          error: data.data?.error || "Failed to get image URL from Imgur",
        };
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return { success: false, error: "Timeout: Image upload took too long" };
      }
      throw fetchError;
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to upload image",
    };
  }
}
