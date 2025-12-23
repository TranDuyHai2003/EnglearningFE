"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  flashcardsApi,
  LessonDeckPayload,
  CardPayload,
} from "@/lib/api/flashcards";
import {
  DeckVisibility,
  FlashcardDeck,
  FlashcardCard,
  Lesson,
} from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, PlusCircle, Trash2, BookOpen } from "lucide-react";
import { DictionaryAssist } from "@/components/flashcards/dictionary-assist";
import { FlashcardImage } from "@/components/flashcards/flashcard-image";

interface LessonVocabularyDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onClose: () => void;
}

type DraftCard = CardPayload & { id?: string };

const emptyCard: DraftCard = {
  front_text: "",
  back_text: "",
  example_text: "",
  ipa_text: "",
  tags: [],
  image_url: "",
  audio_url: "",
};

const defaultForm: Omit<LessonDeckPayload, "cards"> = {
  title: "",
  description: "",
  language_pair: "en-vi",
  visibility: "public",
};

export function LessonVocabularyDialog({
  lesson,
  open,
  onClose,
}: LessonVocabularyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [form, setForm] = useState(() => ({ ...defaultForm }));
  const [cards, setCards] = useState<DraftCard[]>([{ ...emptyCard }]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [originalCardIds, setOriginalCardIds] = useState<string[]>([]);

  const lessonId = lesson?.lesson_id;

  const resetDraft = () => {
    setForm({ ...defaultForm });
    setCards([{ ...emptyCard }]);
    setSelectedIndex(0);
    setEditingDeckId(null);
    setOriginalCardIds([]);
  };

  const mapCardToDraft = (card: FlashcardCard): DraftCard => ({
    id: card.id,
    front_text: card.front_text,
    back_text: card.back_text,
    example_text: card.example_text ?? "",
    ipa_text: card.ipa_text ?? "",
    audio_url: card.audio_url ?? "",
    image_url: card.image_url ?? "",
    tags: card.tags || [],
    dict_entry_id: card.dict_entry_id ?? undefined,
    dict_sense_ids: card.dict_sense_ids || [],
  });

  const buildCardPayload = (card: DraftCard): CardPayload => ({
    front_text: card.front_text.trim(),
    back_text: card.back_text.trim(),
    example_text: card.example_text || undefined,
    ipa_text: card.ipa_text || undefined,
    audio_url: card.audio_url || undefined,
    image_url: card.image_url || undefined,
    tags: card.tags || [],
    dict_entry_id: card.dict_entry_id ?? undefined,
    dict_sense_ids: card.dict_sense_ids?.length ? card.dict_sense_ids : undefined,
  });

  const isCompletedCard = (card: DraftCard) =>
    card.front_text?.trim() && card.back_text?.trim();

  const fetchDecks = async () => {
    if (!lessonId) return;
    try {
      setIsLoading(true);
      const data = await flashcardsApi.listLessonDecks(lessonId);
      setDecks(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách flashcards cho bài học này");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeckForEdit = async (deck: FlashcardDeck) => {
    try {
      setIsLoading(true);
      const detail = await flashcardsApi.getDeck(deck.id);
      const cardsRes = await flashcardsApi.listCards(deck.id, { limit: 500 });
      setForm({
        title: detail.deck.title,
        description: detail.deck.description ?? "",
        language_pair: detail.deck.language_pair,
        visibility: detail.deck.visibility,
      });
      const mapped = cardsRes.data.map(mapCardToDraft);
      setCards(mapped.length ? mapped : [{ ...emptyCard }]);
      setSelectedIndex(0);
      setEditingDeckId(deck.id);
      setOriginalCardIds(mapped.map((card) => card.id!).filter(Boolean));
      toast.success("Đã tải deck để chỉnh sửa");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải deck để chỉnh sửa");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lesson && open) {
      setForm({
        title: `${lesson.title} - Vocabulary`,
        description: `Flashcards cho bài học "${lesson.title}"`,
        language_pair: "en-vi",
        visibility: "public",
      });
      setCards([{ ...emptyCard }]);
      setSelectedIndex(0);
      setEditingDeckId(null);
      setOriginalCardIds([]);
      fetchDecks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, open]);

  const safeIndex = Math.min(selectedIndex, cards.length - 1);
  const activeCard = cards[safeIndex];

  const updateCard = (
    index: number,
    field: keyof CardPayload,
    value: string
  ) => {
    setCards((current) => {
      const next = [...current];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const addCardRow = () => {
    setCards((current) => [...current, { ...emptyCard }]);
    setSelectedIndex(cards.length);
  };

  const removeCardRow = (index: number) => {
    if (cards.length <= 1) {
      toast.info("Phải có ít nhất 1 thẻ");
      return;
    }
    setCards((current) => current.filter((_, idx) => idx !== index));
    setSelectedIndex((prev) => Math.max(0, prev - (index <= prev ? 1 : 0)));
  };

  const filteredCardCount = useMemo(
    () =>
      cards.filter(
        (card) => card.front_text?.trim() && card.back_text?.trim()
      ).length,
    [cards]
  );

  const handleDictionarySnapshot = (snapshot: any) => {
    const senseTexts = snapshot.senseTexts.join("\n");
    const examples =
      snapshot.examples.length > 0
        ? snapshot.examples
            .map((example: { en: string; vi?: string | null }) =>
              example.vi ? `${example.en} — ${example.vi}` : example.en
            )
            .join("\n")
        : "";
    const tags = new Set(activeCard.tags || []);
    snapshot.tags.forEach((tag: string) => tags.add(tag));

    setCards((current) => {
      const index = Math.min(safeIndex, current.length - 1);
      const next = [...current];
      next[index] = {
        ...next[index],
        front_text: next[index].front_text || snapshot.entry.headword,
        back_text: senseTexts || next[index].back_text,
        example_text: examples || next[index].example_text,
        ipa_text: next[index].ipa_text || snapshot.pronunciation || "",
        dict_entry_id: snapshot.entry.id,
        dict_sense_ids: snapshot.senseIds,
        tags: Array.from(tags),
      };
      return next;
    });
    toast.success("Đã áp dụng dữ liệu từ điển");
  };

  const handleDictionaryReferenceChange = (
    entryId: number | null,
    senseIds: number[]
  ) => {
    setCards((current) => {
      const index = Math.min(safeIndex, current.length - 1);
      const next = [...current];
      next[index] = {
        ...next[index],
        dict_entry_id: entryId ?? undefined,
        dict_sense_ids: senseIds,
      };
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!lessonId) return;
    if (!cards.some(isCompletedCard)) {
      toast.error("Hãy thêm ít nhất một từ vựng");
      return;
    }
    try {
      setIsSaving(true);
      if (editingDeckId) {
        await flashcardsApi.updateDeck(editingDeckId, {
          title: form.title || `${lesson?.title ?? "Lesson"} - Vocabulary`,
          description: form.description,
          language_pair: form.language_pair,
          visibility: form.visibility as DeckVisibility,
        });

        const updatedCards = [...cards];
        const usedIds = new Set<string>();
        for (let idx = 0; idx < cards.length; idx += 1) {
          const card = cards[idx];
          if (!isCompletedCard(card)) continue;
          const payload = buildCardPayload(card);
          if (card.id) {
            await flashcardsApi.updateCard(card.id, payload);
            usedIds.add(card.id);
          } else {
            const created = await flashcardsApi.createCard(editingDeckId, payload);
            if (created?.id) {
              updatedCards[idx] = { ...updatedCards[idx], id: created.id };
              usedIds.add(created.id);
            }
          }
        }
        const removed = originalCardIds.filter((id) => !usedIds.has(id));
        await Promise.all(removed.map((id) => flashcardsApi.deleteCard(id)));
        setCards(updatedCards);
        setOriginalCardIds(updatedCards.map((card) => card.id!).filter(Boolean));
        toast.success("Đã cập nhật flashcards");
      } else {
        await flashcardsApi.createLessonDeck(lessonId, {
          title: form.title || `${lesson?.title ?? "Lesson"} - Vocabulary`,
          description: form.description,
          language_pair: form.language_pair,
          visibility: form.visibility as DeckVisibility,
          cards: cards.filter(isCompletedCard).map(buildCardPayload),
        });
        toast.success("Đã tạo bộ flashcards cho bài học");
        resetDraft();
      }
      fetchDecks();
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu flashcards. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[1100px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Thiết lập flashcards cho bài: {lesson?.title}</DialogTitle>
          <DialogDescription>
            Tạo bộ từ mới để học sinh có thể luyện tập trực tiếp trong mục Flashcards.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 h-[calc(90vh-160px)] overflow-y-auto px-6 pb-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Bộ flashcards hiện có</p>
                <div className="border rounded-md h-64">
                  <ScrollArea className="h-64">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tải...
                      </div>
                    ) : decks.length ? (
                      <div className="p-3 space-y-3">
                        {decks.map((deck) => (
                          <div
                            key={deck.id}
                            className="border rounded-md p-3 flex flex-col gap-2 text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">{deck.title}</p>
                              <Badge variant="secondary">
                                {deck.total_cards ?? 0} từ
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {deck.description || "Chưa có mô tả"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cặp ngôn ngữ: {deck.language_pair?.toUpperCase()}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadDeckForEdit(deck)}
                              >
                                Chỉnh sửa
                              </Button>
                              <Button size="sm" variant="ghost" asChild>
                                <a
                                  href={`/flashcards/decks/${deck.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Mở deck
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground px-4 text-center">
                        Chưa có bộ flashcards nào cho bài học này. Hãy tạo bộ từ đầu
                        tiên ở bên phải.
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Bản nháp ({filteredCardCount}/{cards.length} đã hoàn chỉnh)
                  </p>
                  <Button variant="outline" size="sm" onClick={addCardRow}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Thêm từ
                  </Button>
                </div>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {cards.map((card, idx) => (
                    <button
                      type="button"
                      key={`draft-${idx}`}
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full border rounded-md p-3 text-left transition hover:bg-slate-50 ${
                        idx === safeIndex ? "border-primary" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{card.front_text || "Chưa có từ"}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {card.back_text || "Chưa có nghĩa"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeCardRow(idx);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4">
                {editingDeckId && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-sm px-3 py-2">
                    Đang chỉnh sửa deck hiện có. Lưu thay đổi để cập nhật trực tiếp bộ
                    từ.
                  </div>
                )}
                <Input
                  placeholder="Tên bộ flashcards"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <Textarea
                  placeholder="Mô tả"
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Cặp ngôn ngữ (ví dụ en-vi)"
                    value={form.language_pair}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, language_pair: e.target.value }))
                    }
                  />
                  <Select
                    value={form.visibility}
                    onValueChange={(value: DeckVisibility) =>
                      setForm((prev) => ({ ...prev, visibility: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quyền riêng tư" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Công khai</SelectItem>
                      <SelectItem value="unlisted">Ẩn (link)</SelectItem>
                      <SelectItem value="private">Riêng tư</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="space-y-3 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Thẻ #{safeIndex + 1}: {activeCard.front_text || "Chưa có từ"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chọn một thẻ bên trái để chỉnh sửa chi tiết
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={addCardRow}>
                        <PlusCircle className="h-4 w-4 mr-1" /> Mới
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCardRow(safeIndex)}
                        disabled={cards.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    placeholder="Từ tiếng Anh"
                    value={activeCard.front_text ?? ""}
                    onChange={(e) =>
                      updateCard(safeIndex, "front_text", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder="Nghĩa (mỗi dòng một nghĩa)"
                    value={activeCard.back_text ?? ""}
                    onChange={(e) =>
                      updateCard(safeIndex, "back_text", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder={`Ví dụ (mỗi dòng một ví dụ, có thể kèm "—" để tách EN/VI)`}
                    value={activeCard.example_text ?? ""}
                    onChange={(e) =>
                      updateCard(safeIndex, "example_text", e.target.value)
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="IPA"
                      value={activeCard.ipa_text ?? ""}
                      onChange={(e) =>
                        updateCard(safeIndex, "ipa_text", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Audio URL"
                      value={activeCard.audio_url ?? ""}
                      onChange={(e) =>
                        updateCard(safeIndex, "audio_url", e.target.value)
                      }
                    />
                  </div>
                  <Input
                    placeholder="Image URL"
                    value={activeCard.image_url ?? ""}
                    onChange={(e) =>
                      updateCard(safeIndex, "image_url", e.target.value)
                    }
                  />
                  <FlashcardImage
                    src={activeCard.image_url}
                    alt={activeCard.front_text || "preview"}
                    className="h-32 w-full"
                  />
                  <Input
                    placeholder="Tags (phân cách bằng dấu phẩy)"
                    value={activeCard.tags?.join(", ") ?? ""}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean);
                      setCards((current) => {
                        const next = [...current];
                        next[safeIndex] = { ...next[safeIndex], tags };
                        return next;
                      });
                    }}
                  />
                </div>
                <div className="space-y-3 border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <BookOpen className="h-4 w-4" />
                    Tra cứu từ điển
                  </div>
                  <DictionaryAssist
                    seedTerm={activeCard.front_text ?? ""}
                    onApplySnapshot={handleDictionarySnapshot}
                    onReferenceChange={handleDictionaryReferenceChange}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose}>
                  Đóng
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || !lessonId}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Lưu flashcards
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
