import { useCallback, useEffect, useState } from "react";
import { Lesson } from "@/lib/types";
import { getAuthToken } from "@/lib/auth/utils";

interface LessonVideoState {
  url: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useLessonVideoUrl = (lesson?: Lesson | null): LessonVideoState => {
  const [url, setUrl] = useState<string | null>(null);
  const isLoading = false;
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!lesson?.video_key || !lesson?.lesson_id) {
      setUrl(null);
      setError(null);
      return;
    }

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const normalizedBase = apiBase.replace(/\/$/, "");
    const authToken = getAuthToken();
    const tokenQuery = authToken
      ? `&token=${encodeURIComponent(authToken)}`
      : "";
    const streamUrl = `${normalizedBase}/videos/${lesson.lesson_id}/stream?t=${refreshToken}${tokenQuery}`;
    setUrl(streamUrl);
    setError(null);
  }, [lesson?.lesson_id, lesson?.video_key, refreshToken]);

  return { url, isLoading, error, refresh };
};
