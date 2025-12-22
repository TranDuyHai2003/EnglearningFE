"use client";

import { useState } from "react";
import {
  DictionaryAssist,
  DictionarySnapshotPayload,
} from "@/components/flashcards/dictionary-assist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function FlashcardDictionaryPage() {
  const [snapshot, setSnapshot] = useState<DictionarySnapshotPayload | null>(
    null
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Từ điển song ngữ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Sử dụng bảng bên dưới để tìm kiếm headword, chọn các nghĩa và ví dụ
            phù hợp rồi áp dụng trực tiếp vào flashcard. Đây là cách nhanh nhất
            để tạo thẻ chất lượng mà vẫn giữ quyền chỉnh sửa nội dung.
          </p>
          <Separator />
          <p>
            Nếu bạn mở trang này từ một deck cụ thể, nút &ldquo;Điền vào
            flashcard&rdquo; trong modal &ldquo;Thêm thẻ&rdquo; sẽ sao chép dữ
            liệu sang form và lưu cả tham chiếu từ điển.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kết quả tạm thời</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {snapshot ? (
                <>
                  <div>
                    <p className="font-semibold">{snapshot.entry.headword}</p>
                    {snapshot.pronunciation && (
                      <Badge variant="secondary">{snapshot.pronunciation}</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nghĩa đã chọn</p>
                    <ul className="list-disc list-inside space-y-1">
                      {snapshot.senseTexts.map((text) => (
                        <li key={text}>{text}</li>
                      ))}
                    </ul>
                  </div>
                  {snapshot.examples.length ? (
                    <div>
                      <p className="text-muted-foreground">Ví dụ</p>
                      <ul className="list-disc list-inside space-y-1">
                        {snapshot.examples.map((example, idx) => (
                          <li key={`${example.en}-${idx}`}>
                            <span className="font-medium">{example.en}</span>
                            {example.vi ? ` — ${example.vi}` : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {snapshot.tags.length ? (
                    <div className="flex flex-wrap gap-2">
                      {snapshot.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground">
                  Chưa có lựa chọn nào. Hãy tìm một mục từ ở bảng bên phải nhé.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <DictionaryAssist
          onApplySnapshot={(payload) => setSnapshot(payload)}
          onReferenceChange={() => undefined}
        />
      </div>
    </div>
  );
}
