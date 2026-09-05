// ─────────────────────────────────────────────
// Supabase Storage Helper
// Provides upload, download, and URL generation for financial files (receipts, statements)
// ─────────────────────────────────────────────

import { getSupabaseAdminClient } from "./admin";

export const STORAGE_BUCKETS = {
  RECEIPTS: "monielite-receipts",
  STATEMENTS: "monielite-statements",
  EXPORTS: "monielite-exports",
} as const;

export class SupabaseStorageService {
  /**
   * Uploads a file to a designated Supabase Storage bucket
   */
  async uploadFile(
    bucket: (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS],
    path: string,
    fileBody: Buffer | Blob | ArrayBuffer,
    contentType?: string
  ): Promise<{ url: string | null; path: string | null; error: string | null }> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return { url: null, path: null, error: "Supabase credentials not configured" };
    }

    try {
      const { data, error } = await admin.storage
        .from(bucket)
        .upload(path, fileBody, {
          contentType,
          upsert: true,
        });

      if (error) {
        return { url: null, path: null, error: error.message };
      }

      const { data: publicUrlData } = admin.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        path: data.path,
        error: null,
      };
    } catch (err: any) {
      return { url: null, path: null, error: err?.message ?? "Storage upload failed" };
    }
  }

  /**
   * Generates a secure, temporary signed URL for sensitive financial documents
   */
  async getSignedUrl(
    bucket: (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS],
    path: string,
    expiresInSeconds: number = 3600
  ): Promise<{ signedUrl: string | null; error: string | null }> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      return { signedUrl: null, error: "Supabase credentials not configured" };
    }

    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      return { signedUrl: null, error: error.message };
    }

    return { signedUrl: data.signedUrl, error: null };
  }
}

export const supabaseStorage = new SupabaseStorageService();
