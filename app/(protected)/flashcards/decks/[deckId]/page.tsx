"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { flashcardsApi } from "@/lib/api/flashcards";
import { DeckStats, FlashcardDeckDetail, FlashcardCard } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle, Trash2, Edit2, ExternalLink } from "lucide-react";
import {
  DictionaryAssist,
  DictionarySnapshotPayload,
} from "@/components/flashcards/dictionary-assist";
import { useAuth } from "@/lib/hooks/useAuth";
import { SpeechButton } from "@/components/flashcards/speech-button";
import { FlashcardImage } from "@/components/flashcards/flashcard-image";

interface CardFormState {
  front_text: string;
  back_text: string;
  ipa_text?: string;
  example_text?: string;
  audio_url?: string;
  image_url?: string;
  tags: string;
  dict_entry_id?: number | null;
  dict_sense_ids: number[];
}

const defaultCardForm: CardFormState = {
  front_text: "",
  back_text: "",
  ipa_text: "",
  example_text: "",
  audio_url: "",
  image_url: "",
  tags: "",
  dict_entry_id: null,
  dict_sense_ids: [],
};

const StatsBlock = ({ label, value }: { label: string; value: number }) => (
  <div className="p-3 rounded-md bg-slate-50">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

export default function DeckDetailPage() {
  const params = useParams<{ deckId: string }>();
  const deckId = params?.deckId;
  const { user } = useAuth();
  const [detail, setDetail] = useState<FlashcardDeckDetail | null>(null);
  const [cards, setCards] = useState<FlashcardCard[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [cardForm, setCardForm] = useState<CardFormState>(defaultCardForm);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardCard | null>(null);

  const loadDetail = async () => {
    if (!deckId) return;
    try {
      setIsLoadingDetail(true);
      const data = await flashcardsApi.getDeck(deckId);
      setDetail(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin bộ thẻ");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const loadCards = async (cursor?: string | null) => {
    if (!deckId) return;
    try {
      setIsLoadingCards(true);
      const res = await flashcardsApi.listCards(deckId, {
        limit: 25,
        cursor: cursor ?? null,
      });
      if (cursor) {
        setCards((prev) => [...prev, ...res.data]);
      } else {
        setCards(res.data);
      }
      setNextCursor(res.nextCursor ?? null);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách thẻ");
    } finally {
      setIsLoadingCards(false);
    }
  };

  useEffect(() => {
    loadDetail();
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);
 console.log(detail,user,"log");
  const canManageCards = detail?.deck.owner_user_id === user?.id;

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

  const handleDialogChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setCardForm(defaultCardForm);
      setEditingCard(null);
    }
  };

  const handleStartCreate = () => {
    setEditingCard(null);
    setCardForm(defaultCardForm);
    setAddDialogOpen(true);
  };

  const handleEditCard = (card: FlashcardCard) => {
    setEditingCard(card);
    setCardForm({
      front_text: card.front_text,
      back_text: card.back_text,
      ipa_text: card.ipa_text || "",
      example_text: card.example_text || "",
      audio_url: card.audio_url || "",
      image_url: card.image_url || "",
      tags: (card.tags || []).join(", "),
      dict_entry_id: card.dict_entry_id ?? null,
      dict_sense_ids: card.dict_sense_ids || [],
    });
    setAddDialogOpen(true);
  };

  const handleSaveCard = async () => {
    if (!deckId) return;
    try {
      setIsSavingCard(true);
      const payload = {
        front_text: cardForm.front_text,
        back_text: cardForm.back_text,
        ipa_text: cardForm.ipa_text || undefined,
        example_text: cardForm.example_text || undefined,
        audio_url: cardForm.audio_url || undefined,
        image_url: cardForm.image_url || undefined,
        tags: cardForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        dict_entry_id: cardForm.dict_entry_id ?? undefined,
        dict_sense_ids: cardForm.dict_sense_ids?.length
          ? cardForm.dict_sense_ids
          : undefined,
      };
      if (editingCard) {
        await flashcardsApi.updateCard(editingCard.id, payload);
        toast.success("Đã cập nhật thẻ");
      } else {
        await flashcardsApi.createCard(deckId, payload);
        toast.success("Thêm thẻ thành công");
      }
      handleDialogChange(false);
      loadDetail();
      loadCards();
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu thẻ");
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleDictionarySnapshot = (snapshot: DictionarySnapshotPayload) => {
    setCardForm((prev) => {
      const joinedSenses = snapshot.senseTexts.join("\n");
      const newBack = prev.back_text.trim()
        ? `${prev.back_text.trim()}\n\n${joinedSenses}`
        : joinedSenses;
      const exampleText =
        snapshot.examples.length > 0
          ? snapshot.examples
              .map((example) =>
                example.vi ? `${example.en} — ${example.vi}` : example.en
              )
              .join("\n")
          : "";
      const shouldReplaceExamples = exampleText && !prev.example_text?.trim();
      const shouldReplaceIpa = snapshot.pronunciation && !prev.ipa_text?.trim();
      const existingTags = prev.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const tagsSet = new Set(existingTags);
      snapshot.tags.forEach((tag) => tagsSet.add(tag));

      return {
        ...prev,
        back_text: newBack,
        example_text: shouldReplaceExamples ? exampleText : prev.example_text,
        ipa_text: shouldReplaceIpa ? snapshot.pronunciation ?? "" : prev.ipa_text,
        tags: Array.from(tagsSet).join(", "),
        dict_entry_id: snapshot.entry.id,
        dict_sense_ids: snapshot.senseIds,
      };
    });
    toast.success("Đã áp dụng gợi ý từ điển");
  };

  const handleDictionaryReferenceChange = (entryId: number | null, senseIds: number[]) => {
    setCardForm((prev) => ({
      ...prev,
      dict_entry_id: entryId,
      dict_sense_ids: senseIds,
    }));
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Xóa thẻ này?")) return;
    try {
      await flashcardsApi.deleteCard(cardId);
      toast.success("Đã xóa thẻ");
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      loadDetail();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa thẻ");
    }
  };

  if (!deckId) {
    return <p>Deck không tồn tại</p>;
  }

  const stats: DeckStats | undefined = detail?.stats;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{detail?.deck.title}</h1>
          <p className="text-muted-foreground">
            {detail?.deck.description || "Chưa có mô tả"}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary">{detail?.deck.visibility}</Badge>
            <Badge>{detail?.deck.language_pair?.toUpperCase()}</Badge>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="secondary">
            <Link href={`/flashcards/decks/${deckId}/study`}>Học</Link>
          </Button>
          <Button asChild>
            <Link href={`/flashcards/decks/${deckId}/review`}>Ôn tập</Link>
          </Button>
          {canManageCards && (
            <Button variant="outline" onClick={handleStartCreate}>
              <PlusCircle className="h-4 w-4 mr-2" /> Thêm thẻ
            </Button>
          )}
          <Dialog open={addDialogOpen} onOpenChange={handleDialogChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto lg:max-w-5xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCard ? "Chỉnh sửa flashcard" : "Thêm thẻ vào deck"}
                </DialogTitle>
                <DialogDescription>
                  {editingCard
                    ? "Cập nhật nội dung cho flashcard đã chọn."
                    : "Nhập nội dung cho flashcard mới"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="space-y-3">
                  <Input
                    placeholder="Mặt trước"
                    value={cardForm.front_text}
                    onChange={(e) =>
                      setCardForm((prev) => ({ ...prev, front_text: e.target.value }))
                    }
                  />
                  <Textarea
                    placeholder="Mặt sau"
                    value={cardForm.back_text}
                    onChange={(e) =>
                      setCardForm((prev) => ({ ...prev, back_text: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="IPA"
                    value={cardForm.ipa_text}
                    onChange={(e) =>
                      setCardForm((prev) => ({ ...prev, ipa_text: e.target.value }))
                    }
                  />
                  <Textarea
                    placeholder="Ví dụ"
                    value={cardForm.example_text}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        example_text: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Audio URL"
                    value={cardForm.audio_url}
                    onChange={(e) =>
                      setCardForm((prev) => ({ ...prev, audio_url: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Image URL"
                    value={cardForm.image_url}
                    onChange={(e) =>
                      setCardForm((prev) => ({ ...prev, image_url: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Tags (phân cách bởi dấu phẩy)"
                    value={cardForm.tags}
                    onChange={(e) =>
                      setCardForm((prev) => ({ ...prev, tags: e.target.value }))
                    }
                  />
                </div>
                <DictionaryAssist
                  seedTerm={cardForm.front_text}
                  onApplySnapshot={handleDictionarySnapshot}
                  onReferenceChange={handleDictionaryReferenceChange}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleSaveCard} disabled={isSavingCard}>
                  {isSavingCard && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Lưu
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thống kê</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDetail ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsBlock label="Tổng thẻ" value={stats?.total_cards ?? 0} />
              <StatsBlock label="Thẻ mới" value={stats?.new_cards ?? 0} />
              <StatsBlock label="Đến hạn" value={stats?.due_cards ?? 0} />
              <StatsBlock label="Đã thành thạo" value={stats?.learned_cards ?? 0} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thẻ</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCards ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
            </div>
          ) : (
            <div className="space-y-4">
              {cards.length ? (
                <>
                  {cards.map((card) => {
                    const meanings = splitLines(card.back_text);
                    const examples = splitLines(card.example_text);
                    return (
                      <Card key={card.id} className="border border-slate-200 shadow-sm">
                        <CardContent className="space-y-4 pt-6">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xl font-semibold">{card.front_text}</p>
                                <SpeechButton text={card.front_text} />
                                {card.ipa_text && (
                                  <span className="text-sm text-muted-foreground">
                                    / {card.ipa_text} /
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {card.tags?.map((tag) => (
                                  <Badge key={tag} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                                {card.state?.status && (
                                  <Badge variant="secondary">{card.state.status}</Badge>
                                )}
                              </div>
                            </div>
                            <FlashcardImage
                              src={card.image_url}
                              alt={card.front_text}
                              className="h-24 w-full md:w-48"
                            />
                          </div>
                          {meanings.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground">
                                Nghĩa
                              </p>
                              <ul className="list-disc pl-5 space-y-1">
                                {meanings.map((line, idx) => (
                                  <li key={`${card.id}-meaning-${idx}`}>{line}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {examples.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground">
                                Ví dụ
                              </p>
                              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                {examples.map((line, idx) => (
                                  <li key={`${card.id}-example-${idx}`}>{line}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={buildGoogleUrl(card.front_text)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                Google Translate <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={buildOxfordUrl(card.front_text)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                Oxford <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                          {card.audio_url && (
                            <audio controls src={card.audio_url} className="w-full">
                              Trình duyệt không hỗ trợ audio.
                            </audio>
                          )}
                          {canManageCards && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCard(card)}
                                className="gap-2"
                              >
                                <Edit2 className="h-4 w-4" /> Sửa
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCard(card.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" /> Xóa
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {nextCursor && (
                    <Button variant="outline" onClick={() => loadCards(nextCursor)}>
                      Tải thêm
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  Chưa có flashcard nào. Hãy thêm thẻ đầu tiên!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
