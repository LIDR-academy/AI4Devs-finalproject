// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export const CommentsTab = ({
  selectedElement,
  elementComments,
  newCommentContent,
  setNewCommentContent,
  addComment,
  t,
}) => {
  if (!selectedElement) {
    return (
      <p className="text-sm text-zinc-500 text-center py-8">
        {t("editor.select_for_comments")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {selectedElement.businessObject?.name || selectedElement.id}
        </Badge>
      </div>

      {elementComments.length > 0 ? (
        <div className="space-y-3">
          {elementComments.map((comment) => (
            <div key={comment.id} className="p-3 bg-zinc-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{comment.created_by_name}</span>
                <span className="text-xs text-zinc-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-zinc-600">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">{t("editor.no_comments")}</p>
      )}

      <div className="flex gap-2">
        <Textarea
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
          placeholder={t("editor.write_comment")}
          rows={2}
        />
      </div>
      <Button onClick={addComment} size="sm" className="w-full">
        <Send className="w-4 h-4 mr-2" />
        {t("editor.send")}
      </Button>
    </div>
  );
};
