"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { flashcardsApi } from "@/lib/api/flashcards";
import { ReviewQueueItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Repeat, ExternalLink } from "lucide-react";
import { SpeechButton } from "@/components/flashcards/speech-button";
import { FlashcardImage } from "@/components/flashcards/flashcard-image";

type Grade = "again" | "hard" | "good" | "easy";

const gradeButtons: {
  key: string;
  label: string;
  grade: Grade;
  variant: "destructive" | "secondary" | "default" | "outline";
}[] = [
  { key: "1", label: "Again", grade: "again", variant: "destructive" },
  { key: "2", label: "Hard", grade: "hard", variant: "secondary" },
  { key: "3", label: "Good", grade: "good", variant: "default" },
  { key: "4", label: "Easy", grade: "easy", variant: "outline" },
];

export default function ReviewModePage() {
  const params = useParams<{ deckId: string }>();
  const deckId = params?.deckId;
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idempotencyRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const splitLines = (value?: string | null) =>
    value
      ? value
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
      : [];

  const buildGoogleUrl = (text: string) =>
    `https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(text)}`;

  const buildOxfordUrl = (text: string) =>
    `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(
      text.toLowerCase().replace(/\s+/g, "-")
    )}`;

  const loadQueue = useCallback(
    async ({ append = false, silent = false }: { append?: boolean; silent?: boolean } = {}) => {
      if (!deckId) return;
      try {
        if (!silent) {
          setIsLoading(true);
        }
        const items = await flashcardsApi.getReviewQueue(deckId, 20);
        setQueue((prev) => {
          const isAppending = append && prev.length > 0;
          const merged = isAppending
            ? [
                ...prev,
                ...items.filter(
                  (item) => !prev.some((entry) => entry.card.id === item.card.id)
                ),
              ]
            : items;
          if (!isAppending) {
            setIsFlipped(false);
            startTimeRef.current = Date.now();
          }
          return merged;
        });
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải hàng đợi ôn tập");
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    }
  ,
    [deckId]
  );

useEffect(() => {
  loadQueue();
}, [loadQueue]);

const current = queue[0];

const handleGrade = useCallback(
  async (grade: Grade) => {
    const currentCard = queue[0];
    if (!currentCard || !deckId) return;
    try {
      setIsSubmitting(true);
      if (!idempotencyRef.current) {
        idempotencyRef.current = crypto.randomUUID();
      }
      const duration = Date.now() - startTimeRef.current;
      await flashcardsApi.submitReview({
        deckId,
        cardId: currentCard.card.id,
        grade,
        idempotencyKey: idempotencyRef.current,
        durationMs: duration,
      });
      idempotencyRef.current = null;
      const remaining = queue.length - 1;
      setQueue((prev) => prev.slice(1));
      setIsFlipped(false);
      startTimeRef.current = Date.now();
      if (remaining <= 3) {
        loadQueue({ append: true, silent: true });
      }
    } catch (error) {
      console.error(error);
      toast.error("Gửi kết quả ôn tập thất bại, thử lại nhé");
    } finally {
      setIsSubmitting(false);
    }
  },
  [deckId, queue, loadQueue]
);

useEffect(() => {
  const handler = (event: KeyboardEvent) => {
    if (!isFlipped || isSubmitting) return;
    const config = gradeButtons.find((btn) => btn.key === event.key);
    if (config) {
      event.preventDefault();
      handleGrade(config.grade);
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [handleGrade, isFlipped, isSubmitting]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>Đang tải hàng đợi ôn tập...</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="space-y-4 text-center">
        <Button asChild variant="ghost">
          <Link href={`/flashcards/decks/${deckId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại deck
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Không còn thẻ đến hạn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Chúc mừng! Bạn đã hoàn thành hàng đợi ôn tập hôm nay.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Button asChild variant="ghost">
          <Link href={`/flashcards/decks/${deckId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại deck
          </Link>
        </Button>
        <p>Còn {queue.length} thẻ</p>
      </div>
      <Card className="min-h-[320px]">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl text-center">
                {current.card.front_text}
              </CardTitle>
              <SpeechButton text={current.card.front_text} />
            </div>
            {current.card.ipa_text && (
              <p className="text-sm text-muted-foreground">/ {current.card.ipa_text} /</p>
            )}
            <div className="flex flex-wrap gap-1 justify-center">
              {current.card.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <FlashcardImage
            src={current.card.image_url}
            alt={current.card.front_text}
            className="h-32 w-full"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {isFlipped && (
            <>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground text-center">
                  Nghĩa
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  {splitLines(current.card.back_text).map((line, idx) => (
                    <li key={`${current.card.id}-meaning-${idx}`}>{line}</li>
                  ))}
                </ul>
              </div>
              {splitLines(current.card.example_text).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground text-center">
                    Ví dụ
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    {splitLines(current.card.example_text).map((line, idx) => (
                      <li key={`${current.card.id}-example-${idx}`}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={buildGoogleUrl(current.card.front_text)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Google Translate <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a
                    href={buildOxfordUrl(current.card.front_text)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Oxford <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </>
          )}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsFlipped((prev) => !prev)}
              className="gap-2"
            >
              <Repeat className="h-4 w-4" /> {isFlipped ? "Ẩn đáp án" : "Lật thẻ"}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {gradeButtons.map((btn) => (
              <Button
                key={btn.grade}
                variant={btn.variant}
                disabled={!isFlipped || isSubmitting}
                onClick={() => handleGrade(btn.grade)}
                className="flex items-center justify-center gap-2"
              >
                <span>{btn.label}</span>
                <span className="text-xs text-muted-foreground">[{btn.key}]</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
