"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Reply,
  Pin,
  Edit,
  Trash2,
  Link,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Download,
  Image,
  File,
} from "lucide-react";
import {
  JobComment,
  CommentWithThread,
  CommentReaction,
  ReactionType,
} from "@/lib/types/Comments";

interface CommentProps {
  comment: CommentWithThread;
  currentUserId?: number;
  isThreaded?: boolean;
  threadLevel?: number;
  onReply?: (commentId: number) => void;
  onEdit?: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  onPin?: (commentId: number) => void;
  onReaction?: (commentId: number, reactionType: ReactionType) => void;
  className?: string;
}

// Reaction configuration
const REACTION_CONFIG = {
  like: { icon: Heart, emoji: "❤️", label: "Heart" },
  thumbs_up: { icon: ThumbsUp, emoji: "👍", label: "Thumbs Up" },
  thumbs_down: { icon: ThumbsDown, emoji: "👎", label: "Thumbs Down" },
  heart: { icon: Heart, emoji: "💖", label: "Love" },
  laugh: { icon: Smile, emoji: "😂", label: "Laugh" },
} as const;

// Comment type styling
const COMMENT_TYPE_CONFIG = {
  comment: { color: "bg-blue-100 text-blue-800", label: "Comment" },
  status_update: {
    color: "bg-green-100 text-green-800",
    label: "Status Update",
  },
  file_upload: { color: "bg-purple-100 text-purple-800", label: "File Upload" },
  system: { color: "bg-gray-100 text-gray-800", label: "System" },
} as const;

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;

  return date.toLocaleDateString();
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  return File;
}

export function Comment({
  comment,
  currentUserId,
  isThreaded = false,
  threadLevel = 0,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onReaction,
  className,
}: CommentProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const isAuthor = currentUserId === comment.user_id;
  const isDeleted = Boolean(comment.deleted_at);
  const typeConfig =
    COMMENT_TYPE_CONFIG[comment.comment_type] || COMMENT_TYPE_CONFIG.comment;

  // Calculate indentation for threaded comments
  const indentLevel = Math.min(threadLevel, 4); // Max 4 levels of indentation
  const marginLeft = isThreaded ? `${indentLevel * 1.5}rem` : "0";

  if (isDeleted) {
    return (
      <div
        className={`text-muted-foreground italic text-sm py-2 ${className}`}
        style={{ marginLeft }}
      >
        [This comment has been deleted]
      </div>
    );
  }

  return (
    <Card
      className={`w-full transition-all hover:shadow-sm ${className}`}
      style={{ marginLeft }}
    >
      <CardContent className="p-4">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Author Avatar */}
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {comment.author?.name?.charAt(0) || "U"}
              </span>
            </div>

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm truncate">
                  {comment.author?.name || "Unknown User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {comment.author?.role}
                </span>
                {comment.comment_type !== "comment" && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${typeConfig.color}`}
                  >
                    {typeConfig.label}
                  </Badge>
                )}
                {comment.is_pinned && (
                  <Pin className="w-3 h-3 text-yellow-600" />
                )}
              </div>

              {/* Timestamp */}
              <div className="flex items-center space-x-2 mt-1">
                <time
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  dateTime={comment.created_at}
                  title={new Date(comment.created_at).toLocaleString()}
                >
                  {formatRelativeTime(comment.created_at)}
                </time>
                {comment.updated_at !== comment.created_at && (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                )}
                {isThreaded && (
                  <span className="text-xs text-muted-foreground">• reply</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Comment actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onReply?.(comment.id)}>
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              {isAuthor && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit?.(comment.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPin?.(comment.id)}>
                    <Pin className="mr-2 h-4 w-4" />
                    {comment.is_pinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(comment.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {/* Simple content rendering - can be enhanced with markdown later */}
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {comment.content}
            </p>
          </div>
        </div>

        {/* File Attachments */}
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="mb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {comment.attachments.map((attachment) => {
                const FileIcon = getFileIcon(attachment.file_type);
                const isImage = attachment.file_type.startsWith("image/");

                return (
                  <div
                    key={attachment.id}
                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {isImage && attachment.thumbnail_url ? (
                        <img
                          src={attachment.thumbnail_url}
                          alt={attachment.file_name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <FileIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.file_size && (
                            <span>
                              {Math.round(attachment.file_size / 1024)}KB •{" "}
                            </span>
                          )}
                          {attachment.file_type}
                        </p>
                      </div>

                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">
                          Download {attachment.filename}
                        </span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reactions */}
        {comment.reactions && comment.reactions.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(comment.reaction_counts || {}).map(
                ([reactionType, count]) => {
                  if (count === 0) return null;

                  const config = REACTION_CONFIG[reactionType as ReactionType];
                  const hasUserReacted = comment.reactions?.some(
                    (r) =>
                      r.reaction_type === reactionType &&
                      r.user_id === currentUserId
                  );

                  return (
                    <Button
                      key={reactionType}
                      variant={hasUserReacted ? "secondary" : "outline"}
                      size="sm"
                      className={`h-7 px-2 ${
                        hasUserReacted ? "bg-blue-100 text-blue-800" : ""
                      }`}
                      onClick={() =>
                        onReaction?.(comment.id, reactionType as ReactionType)
                      }
                    >
                      <span className="mr-1">{config?.emoji}</span>
                      <span className="text-xs">{count}</span>
                    </Button>
                  );
                }
              )}

              {/* Add Reaction Button */}
              <DropdownMenu
                open={showReactionPicker}
                onOpenChange={setShowReactionPicker}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground"
                  >
                    <Smile className="h-4 w-4" />
                    <span className="sr-only">Add reaction</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  {Object.entries(REACTION_CONFIG).map(
                    ([reactionType, config]) => (
                      <DropdownMenuItem
                        key={reactionType}
                        onClick={() => {
                          onReaction?.(
                            comment.id,
                            reactionType as ReactionType
                          );
                          setShowReactionPicker(false);
                        }}
                      >
                        <span className="mr-2">{config.emoji}</span>
                        {config.label}
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Reply Count for Parent Comments */}
        {!isThreaded && comment.reply_count > 0 && (
          <div className="text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">
              {comment.reply_count}{" "}
              {comment.reply_count === 1 ? "reply" : "replies"}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Comment;
