import { useCallback, useEffect, useState } from "react";
import { Lesson } from "@/lib/types";
import { storageService } from "@/lib/api/storageService";

interface LessonVideoState {
  url: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useLessonVideoUrl = (lesson?: Lesson | null): LessonVideoState => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!lesson?.video_key) {
      setUrl(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    storageService
      .getLecturePlaybackUrl(lesson.video_key)
      .then((signedUrl) => {
        if (isActive) {
          setUrl(signedUrl);
          setError(null);
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải video. Vui lòng thử lại."
          );
          setUrl(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [lesson?.video_key, refreshToken]);

  return { url, isLoading, error, refresh };
};
