// Enhanced Comments System Types
// Supporting Slack-style threaded communication for job orders

export type CommentType =
  | "comment"
  | "status_update"
  | "file_upload"
  | "system";
export type MentionType = "direct" | "team" | "role";
export type ReactionType =
  | "like"
  | "thumbs_up"
  | "thumbs_down"
  | "heart"
  | "laugh";

export interface JobComment {
  id: number;
  job_number: string;
  order_id?: number;
  user_id?: number;
  content: string;
  content_type: string;
  comment_type: CommentType;
  parent_comment_id?: number;
  reply_to_id?: number;
  is_pinned: boolean;
  is_internal: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;

  // Relations (populated when queried with joins)
  author?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  replies?: JobComment[];
  attachments?: CommentAttachment[];
  mentions?: CommentMention[];
  reactions?: CommentReaction[];
  reaction_counts?: Record<ReactionType, number>;
}

export interface CommentAttachment {
  id: number;
  comment_id: number;
  file_name: string;
  filename: string;
  file_type: string;
  file_url: string;
  storage_path?: string;
  thumbnail_url?: string;
  file_size?: number;
  uploaded_by_user_id?: number;
  is_active: boolean;
  uploaded_at: string;
  created_at: string;

  // Relations
  uploaded_by?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CommentMention {
  id: number;
  comment_id: number;
  mentioned_user_id: number;
  mention_type: MentionType;
  is_read: boolean;
  notification_sent_at?: string;
  created_at: string;

  // Relations
  mentioned_user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  comment: Pick<JobComment, "id" | "content" | "job_number" | "created_at">;
}

export interface CommentReaction {
  id: number;
  comment_id: number;
  user_id: number;
  reaction_type: ReactionType;
  created_at: string;

  // Relations
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// Compound types for thread management
export interface CommentThread {
  parent_comment: JobComment;
  replies: JobComment[];
  total_replies: number;
  participants: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
}

export interface CommentWithThread extends JobComment {
  thread?: CommentThread;
  reply_count: number;
}

// API request/response types
export interface CreateCommentRequest {
  job_number: string;
  order_id?: number;
  content: string;
  content_type?: string;
  comment_type?: CommentType;
  parent_comment_id?: number;
  reply_to_id?: number;
  is_internal?: boolean;
  mentioned_user_ids?: number[];
  attachments?: Array<{
    file_name: string;
    file_type: string;
    file_url: string;
    file_size?: number;
  }>;
}

export interface UpdateCommentRequest {
  content?: string;
  is_pinned?: boolean;
  is_internal?: boolean;
}

export interface CommentReactionRequest {
  reaction_type: ReactionType;
}

export interface CommentSearchFilters {
  job_number?: string;
  order_id?: number;
  user_id?: number;
  comment_type?: CommentType;
  is_pinned?: boolean;
  is_internal?: boolean;
  has_attachments?: boolean;
  date_from?: string;
  date_to?: string;
  search_content?: string;
}

export interface CommentsPaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
  include_deleted?: boolean;
  include_replies?: boolean;
  thread_depth?: number;
}

export interface CommentsResponse {
  comments: CommentWithThread[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: CommentSearchFilters;
}
