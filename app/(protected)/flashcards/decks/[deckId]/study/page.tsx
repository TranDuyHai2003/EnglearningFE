"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { flashcardsApi } from "@/lib/api/flashcards";
import { FlashcardCard } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { SpeechButton } from "@/components/flashcards/speech-button";
import { FlashcardImage } from "@/components/flashcards/flashcard-image";

export default function StudyModePage() {
  const params = useParams<{ deckId: string }>();
  const deckId = params?.deckId;
  const [cards, setCards] = useState<FlashcardCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
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

  const loadCards = async () => {
    if (!deckId) return;
    try {
      setIsLoading(true);
      const res = await flashcardsApi.listCards(deckId, { limit: 200 });
      setCards(res.data);
      setIndex(0);
      setKnown(0);
      setUnknown(0);
      setIsFlipped(false);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const currentCard = cards[index];

  const handleNext = (isKnown: boolean) => {
    if (!currentCard) return;
    if (isKnown) {
      setKnown((prev) => prev + 1);
    } else {
      setUnknown((prev) => prev + 1);
    }
    const nextIndex = index + 1;
    if (nextIndex < cards.length) {
      setIndex(nextIndex);
      setIsFlipped(false);
    } else {
      toast.success("Bạn đã xem hết bộ thẻ!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>Đang chuẩn bị chế độ học...</p>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href={`/flashcards/decks/${deckId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại deck
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Chưa có thẻ nào</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hãy thêm flashcards trước khi bắt đầu học.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost">
        <Link href={`/flashcards/decks/${deckId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại deck
        </Link>
      </Button>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Thẻ {index + 1}/{cards.length}
        </p>
        <p>
          ✅ {known} · ❓ {unknown}
        </p>
      </div>
      <Card className="min-h-[260px] flex flex-col justify-between">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-center text-2xl">
                {currentCard.front_text}
              </CardTitle>
              <SpeechButton text={currentCard.front_text} />
            </div>
            {currentCard.ipa_text && (
              <p className="text-center text-sm text-muted-foreground">
                / {currentCard.ipa_text} /
              </p>
            )}
            {currentCard.tags?.length ? (
              <div className="flex flex-wrap justify-center gap-1 text-xs">
                {currentCard.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-center">
            <FlashcardImage
              src={currentCard.image_url}
              alt={currentCard.front_text}
              className="h-32 w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isFlipped && (
            <>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground text-center">
                  Nghĩa
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  {splitLines(currentCard.back_text).map((line, idx) => (
                    <li key={`${currentCard.id}-meaning-${idx}`}>{line}</li>
                  ))}
                </ul>
              </div>
              {splitLines(currentCard.example_text).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground text-center">
                    Ví dụ
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    {splitLines(currentCard.example_text).map((line, idx) => (
                      <li key={`${currentCard.id}-example-${idx}`}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={buildGoogleUrl(currentCard.front_text)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Google Translate <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a
                    href={buildOxfordUrl(currentCard.front_text)}
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
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setIsFlipped((prev) => !prev)}>
              {isFlipped ? "Ẩn đáp án" : "Lật thẻ"}
            </Button>
          </div>
          {isFlipped && (
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => handleNext(false)}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" /> Chưa nhớ
              </Button>
              <Button className="gap-2" onClick={() => handleNext(true)}>
                <CheckCircle className="h-4 w-4" /> Đã nhớ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
