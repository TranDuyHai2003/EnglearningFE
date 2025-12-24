"use client";

import { FlashcardDeck } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";

interface FlashcardTabProps {
  decks: FlashcardDeck[];
}

export function FlashcardTab({ decks }: FlashcardTabProps) {
  const router = useRouter();

  if (!decks || decks.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-white text-center">
        <p className="text-muted-foreground">Bài học này chưa có bộ flashcard nào.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Flashcards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => (
          <Card key={deck.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium truncate">{deck.title}</h4>
                <Copy className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {deck.description || "Không có mô tả"}
              </p>
              <Button 
                variant="default" 
                size="sm" 
                className="w-full"
                onClick={() => router.push(`/flashcards/decks/${deck.id}`)}
              >
                Luyện tập
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
