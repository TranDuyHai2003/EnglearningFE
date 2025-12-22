"use client";

import { useEffect, useState } from "react";
import { flashcardsApi } from "@/lib/api/flashcards";
import { FlashcardDeck, FlashcardSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const SummaryItem = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="p-3 rounded-md bg-slate-50">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

export default function FlashcardProgressPage() {
  const [summary, setSummary] = useState<FlashcardSummary | null>(null);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [globalSummary, deckList] = await Promise.all([
        flashcardsApi.getGlobalSummary(),
        flashcardsApi.listDecks({ scope: "all" }),
      ]);
      setSummary(globalSummary);
      setDecks(deckList);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tiến độ Flashcards</h1>
        <p className="text-muted-foreground">
          Theo dõi số lượng thẻ đến hạn, độ chính xác và streak học tập của bạn.
        </p>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải thống kê...
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Toàn bộ tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <SummaryItem label="Tổng thẻ" value={summary?.total_cards ?? 0} />
              <SummaryItem label="Thẻ mới" value={summary?.new_cards ?? 0} />
              <SummaryItem label="Đến hạn" value={summary?.due_cards ?? 0} />
              <SummaryItem label="Đã học" value={summary?.learned_cards ?? 0} />
              <SummaryItem
                label="Chính xác 7 ngày"
                value={`${Math.round(summary?.accuracy_7d ?? 0)}%`}
              />
              <SummaryItem
                label="Chính xác 30 ngày"
                value={`${Math.round(summary?.accuracy_30d ?? 0)}%`}
              />
              <SummaryItem label="Streak ngày" value={summary?.streak_days ?? 0} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deck của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bộ thẻ</TableHead>
                    <TableHead>Thẻ mới</TableHead>
                    <TableHead>Đến hạn</TableHead>
                    <TableHead>Tổng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decks.map((deck) => (
                    <TableRow key={deck.id}>
                      <TableCell>
                        <div>
                          <Link
                            href={`/flashcards/decks/${deck.id}`}
                            className="font-semibold hover:underline"
                          >
                            {deck.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {deck.language_pair.toUpperCase()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{deck.new_cards ?? 0}</TableCell>
                      <TableCell>{deck.due_cards ?? 0}</TableCell>
                      <TableCell>{deck.total_cards ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
