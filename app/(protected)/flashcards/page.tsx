"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { flashcardsApi } from "@/lib/api/flashcards";
import { DeckVisibility, FlashcardDeck } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Loader2, PlusCircle, Layers, BookOpenCheck } from "lucide-react";

const visibilityLabels: Record<DeckVisibility, string> = {
  private: "Riêng tư",
  unlisted: "Ẩn",
  public: "Công khai",
};

const scopeOptions = [
  { value: "all", label: "Tất cả" },
  { value: "mine", label: "Của tôi" },
  { value: "system", label: "Hệ thống" },
];

export default function FlashcardDecksPage() {
  const [scope, setScope] = useState("all");
  const [search, setSearch] = useState("");
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    visibility: "private" as DeckVisibility,
    language_pair: "en-vi",
  });
  const [debouncedSearch] = useDebounce(search, 400);

  const loadDecks = async () => {
    try {
      setIsLoading(true);
      const data = await flashcardsApi.listDecks({
        scope,
        q: debouncedSearch || undefined,
      });
      setDecks(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách bộ thẻ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, debouncedSearch]);

  const handleCreateDeck = async () => {
    try {
      setIsSubmitting(true);
      await flashcardsApi.createDeck(createForm);
      toast.success("Tạo bộ thẻ thành công");
      setDialogOpen(false);
      setCreateForm({ title: "", description: "", visibility: "private", language_pair: "en-vi" });
      loadDecks();
    } catch (error) {
      console.error(error);
      toast.error("Không thể tạo bộ thẻ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deckGrid = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!decks.length) {
      return (
        <p className="text-center py-10 text-muted-foreground">
          Chưa có bộ thẻ nào phù hợp.
        </p>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {decks.map((deck) => (
          <Card key={deck.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{deck.title}</CardTitle>
                <CardDescription className="mt-1">
                  {deck.description || "Chưa có mô tả"}
                </CardDescription>
              </div>
              <Badge variant="secondary">{visibilityLabels[deck.visibility]}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>{deck.language_pair.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4" />
                  <span>{deck.total_cards ?? 0} thẻ</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-md p-2">
                  <p className="text-xs text-muted-foreground">Mới</p>
                  <p className="text-lg font-semibold">{deck.new_cards ?? 0}</p>
                </div>
                <div className="bg-slate-50 rounded-md p-2">
                  <p className="text-xs text-muted-foreground">Đến hạn</p>
                  <p className="text-lg font-semibold">{deck.due_cards ?? 0}</p>
                </div>
                <div className="bg-slate-50 rounded-md p-2">
                  <p className="text-xs text-muted-foreground">Tổng</p>
                  <p className="text-lg font-semibold">{deck.total_cards ?? 0}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/flashcards/decks/${deck.id}`}>Chi tiết</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/flashcards/decks/${deck.id}/study`}>Học</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/flashcards/decks/${deck.id}/review`}>Ôn tập</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [decks, isLoading]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Flashcards</h1>
          <p className="text-muted-foreground">
            Tạo bộ thẻ từ mới và luyện tập mỗi ngày.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" asChild>
            <Link href="/flashcards/dictionary">Từ điển</Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Tạo bộ thẻ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo bộ thẻ mới</DialogTitle>
                <DialogDescription>
                  Điền thông tin để bắt đầu học tập với flashcards.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Tiêu đề"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <Textarea
                  placeholder="Mô tả"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                <Input
                  placeholder="Cặp ngôn ngữ (ví dụ: en-vi)"
                  value={createForm.language_pair}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, language_pair: e.target.value }))
                  }
                />
                <Select
                  value={createForm.visibility}
                  onValueChange={(value: DeckVisibility) =>
                    setCreateForm((prev) => ({ ...prev, visibility: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quyền riêng tư" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Riêng tư</SelectItem>
                    <SelectItem value="unlisted">Ẩn</SelectItem>
                    <SelectItem value="public">Công khai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateDeck} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Tạo
                </Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs value={scope} onValueChange={setScope} className="w-full md:w-auto">
          <TabsList>
            {scopeOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          placeholder="Tìm kiếm bộ thẻ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-80"
        />
      </div>

      {deckGrid}
    </div>
  );
}
