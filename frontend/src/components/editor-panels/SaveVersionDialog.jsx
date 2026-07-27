// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save } from "lucide-react";

const TAGS = ["production", "staging", "feature", "hotfix"];

export const SaveVersionDialog = ({
  open,
  onOpenChange,
  commitMessage,
  setCommitMessage,
  versionTags,
  setVersionTags,
  onSave,
  t,
}) => {
  const toggleTag = (tag) => {
    setVersionTags(
      versionTags.includes(tag)
        ? versionTags.filter((tg) => tg !== tag)
        : [...versionTags, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editor.save_version_title")}</DialogTitle>
          <DialogDescription>{t("editor.save_version_desc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("editor.commit_msg")}</Label>
            <Textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder={t("editor.describe_changes")}
              rows={3}
            />
          </div>
          <div>
            <Label>{t("editor.version_tags")}</Label>
            <div className="flex gap-2 mt-2">
              {TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={versionTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
