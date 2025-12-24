import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { dictionaryApi } from "@/lib/api/dictionary";
import {
  DictionaryEntryDetail,
  DictionaryLookupItem,
  DictionarySense,
} from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export interface DictionarySnapshotPayload {
  entry: DictionaryEntryDetail;
  senseIds: number[];
  senseTexts: string[];
  examples: { en: string; vi?: string | null }[];
  pronunciation?: string | null;
  tags: string[];
}

interface DictionaryAssistProps {
  seedTerm?: string;
  onApplySnapshot: (payload: DictionarySnapshotPayload) => void;
  onReferenceChange: (entryId: number | null, senseIds: number[]) => void;
}

export function DictionaryAssist({
  seedTerm,
  onApplySnapshot,
  onReferenceChange,
}: DictionaryAssistProps) {
  const [query, setQuery] = useState(seedTerm || "");
  const [results, setResults] = useState<DictionaryLookupItem[]>([]);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [isEntryLoading, setIsEntryLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntryDetail | null>(null);
  const [selectedSenseIds, setSelectedSenseIds] = useState<number[]>([]);
  const [selectedExampleIds, setSelectedExampleIds] = useState<Set<number>>(new Set());
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [manualLookupTerm, setManualLookupTerm] = useState<string | null>(null);
  const [hasTyped, setHasTyped] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasTyped && seedTerm) {
      setQuery(seedTerm);
    }
  }, [seedTerm, hasTyped]);

  const fetchLookup = useCallback(
    async (term: string) => {
      if (!term) {
        setResults([]);
        return;
      }
      try {
        setIsLookupLoading(true);
        const data = await dictionaryApi.lookup(term, 20);
        setResults(data.items || []);
        setHighlightIndex(0);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tra cứu từ điển");
      } finally {
        setIsLookupLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchLookup(debouncedQuery);
    } else if (!debouncedQuery.length) {
      setResults([]);
    }
  }, [debouncedQuery, fetchLookup]);

  useEffect(() => {
    if (manualLookupTerm) {
      fetchLookup(manualLookupTerm);
      setManualLookupTerm(null);
    }
  }, [manualLookupTerm, fetchLookup]);

  const loadEntry = async (entryId: number) => {
    try {
      setIsEntryLoading(true);
      const entry = await dictionaryApi.getEntry(entryId);
      setSelectedEntry(entry);
      setSelectedSenseIds([]);
      setSelectedExampleIds(new Set());
      onReferenceChange(entry.id, []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được chi tiết từ điển");
    } finally {
      setIsEntryLoading(false);
    }
  };

  const handleResultSelect = (item: DictionaryLookupItem) => {
    loadEntry(item.id);
  };

  const visibleExamplesCount = selectedExampleIds.size;

  const toggleSense = (senseId: number) => {
    if (selectedSenseIds.includes(senseId)) {
      const next = selectedSenseIds.filter((id) => id !== senseId);
      setSelectedSenseIds(next);
      onReferenceChange(selectedEntry?.id ?? null, next);
    } else {
      if (selectedSenseIds.length >= 3) {
        toast.info("Bạn chỉ nên chọn tối đa 3 nghĩa cho mỗi thẻ");
        return;
      }
      const next = [...selectedSenseIds, senseId];
      setSelectedSenseIds(next);
      onReferenceChange(selectedEntry?.id ?? null, next);
    }
  };

  const toggleExample = (exampleId: number) => {
    setSelectedExampleIds((prev) => {
      const next = new Set(prev);
      if (next.has(exampleId)) {
        next.delete(exampleId);
        return next;
      }
      if (next.size >= 2) {
        toast.info("Chỉ nên lấy tối đa 2 ví dụ để tránh quá dài");
        return prev;
      }
      next.add(exampleId);
      return next;
    });
  };

  const handleFill = () => {
    if (!selectedEntry || !selectedSenseIds.length) {
      toast.info("Hãy chọn ít nhất một nghĩa trước khi điền");
      return;
    }
    const senseMap = new Map<number, DictionarySense>();
    selectedEntry.pos.forEach((posBlock) => {
      posBlock.senses.forEach((sense) => {
        senseMap.set(sense.id, sense);
      });
    });

    const senseTexts: string[] = [];
    const exampleRows: { en: string; vi?: string | null }[] = [];
    const tagsSet = new Set<string>();

    selectedEntry.pos.forEach((posBlock) => {
      const selectedInPos = posBlock.senses.filter((sense) =>
        selectedSenseIds.includes(sense.id)
      );
      if (selectedInPos.length) {
        tagsSet.add(posBlock.posTag);
      }
    });

    selectedSenseIds.forEach((id) => {
      const sense = senseMap.get(id);
      if (!sense) return;
      senseTexts.push(sense.senseText);
      sense.tags.forEach((tag) => tagsSet.add(tag));
      sense.examples
        .filter((example) => selectedExampleIds.has(example.id))
        .forEach((example) => exampleRows.push({ en: example.en, vi: example.vi }));
    });

    onApplySnapshot({
      entry: selectedEntry,
      senseIds: selectedSenseIds,
      senseTexts,
      examples: exampleRows,
      pronunciation: selectedEntry.pronunciation || undefined,
      tags: Array.from(tagsSet),
    });
  };

  const handleKeyboardNav = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) {
      if (event.key === "Enter" && query.length === 1) {
        setManualLookupTerm(query);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (highlightIndex + 1) % results.length;
      setHighlightIndex(nextIndex);
      scrollHighlightedIntoView(nextIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = highlightIndex - 1 < 0 ? results.length - 1 : highlightIndex - 1;
      setHighlightIndex(nextIndex);
      scrollHighlightedIntoView(nextIndex);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results[highlightIndex];
      if (item) {
        handleResultSelect(item);
      } else if (query.length === 1) {
        setManualLookupTerm(query);
      }
    }
  };

  const scrollHighlightedIntoView = (index: number) => {
    if (!listRef.current) return;
    const container = listRef.current;
    const option = container.querySelectorAll("[data-option]")[index];
    if (option instanceof HTMLElement) {
      option.scrollIntoView({ block: "nearest" });
    }
  };

  const selectionSummary = useMemo(() => {
    if (!selectedSenseIds.length) return "Chọn nghĩa để gợi ý mặt sau";
    return `${selectedSenseIds.length} nghĩa được chọn • ${visibleExamplesCount} ví dụ`;
  }, [selectedSenseIds, visibleExamplesCount]);

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Gợi ý từ điển
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery(seedTerm || "");
              setHasTyped(false);
              if ((seedTerm || "").length === 1) {
                setManualLookupTerm(seedTerm || "");
              }
            }}
          >
            Dùng từ mặt trước
          </Button>
        </div>
        <div className="relative">
          <Input
            value={query}
            placeholder="Nhập từ tiếng Anh để tra..."
            onChange={(event) => {
              setQuery(event.target.value);
              setHasTyped(true);
            }}
            onKeyDown={handleKeyboardNav}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        {query.length === 1 && (
          <p className="text-xs text-muted-foreground">
            Nhấn Enter để tìm các từ chỉ có 1 ký tự (ví dụ: a, I)
          </p>
        )}
        <div
          className="border rounded-md bg-white"
          ref={listRef}
        >
          <ScrollArea className="h-40">
            {isLookupLoading ? (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tra cứu...
              </div>
            ) : results.length ? (
              results.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  data-option
                  onClick={() => handleResultSelect(item)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 ${
                    highlightIndex === index ? "bg-slate-100" : ""
                  }`}
                >
                  <div className="font-medium">{item.headword}</div>
                  {item.pronunciation && (
                    <div className="text-xs text-muted-foreground">
                      {item.pronunciation}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <p className="p-3 text-sm text-muted-foreground">Không có gợi ý</p>
            )}
          </ScrollArea>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {selectedEntry ? selectedEntry.headword : "Chưa chọn mục từ"}
          </p>
          {selectedEntry?.pronunciation && (
            <Badge variant="secondary">{selectedEntry.pronunciation}</Badge>
          )}
        </div>
        {isEntryLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải nghĩa...
          </div>
        )}
        {!isEntryLoading && selectedEntry && (
          <div className="space-y-3">
            {selectedEntry.pos.map((posBlock) => (
              <div key={posBlock.id} className="border rounded-md bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{posBlock.pos}</p>
                    <p className="text-xs text-muted-foreground">
                      {posBlock.posTag}
                      {posBlock.posMeta ? ` • ${posBlock.posMeta}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline">{posBlock.posTag}</Badge>
                </div>
                <div className="space-y-2">
                  {posBlock.senses.map((sense) => (
                    <div
                      key={sense.id}
                      className="rounded-md border p-2 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`sense-${sense.id}`}
                          checked={selectedSenseIds.includes(sense.id)}
                          onCheckedChange={() => toggleSense(sense.id)}
                        />
                        <label
                          htmlFor={`sense-${sense.id}`}
                          className="text-sm font-medium leading-tight"
                        >
                          {sense.senseText}
                        </label>
                      </div>
                      {sense.tags?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {sense.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      {sense.examples.length ? (
                        <div className="space-y-1">
                          {sense.examples.map((example) => (
                            <label
                              key={example.id}
                              className="flex items-start gap-2 text-xs cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedExampleIds.has(example.id)}
                                onCheckedChange={() => toggleExample(example.id)}
                              />
                              <div>
                                <p className="font-medium">{example.en}</p>
                                {example.vi && (
                                  <p className="text-muted-foreground">
                                    {example.vi}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {!selectedEntry && !isEntryLoading && (
          <p className="text-sm text-muted-foreground">
            Chọn một mục từ ở danh sách trên để xem nghĩa chi tiết.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">{selectionSummary}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleFill}
              disabled={!selectedEntry || !selectedSenseIds.length}
            >
              Điền vào flashcard
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSelectedSenseIds([]);
                setSelectedExampleIds(new Set());
                onReferenceChange(selectedEntry?.id ?? null, []);
              }}
              disabled={!selectedSenseIds.length && !selectedExampleIds.size}
            >
              Xóa lựa chọn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
