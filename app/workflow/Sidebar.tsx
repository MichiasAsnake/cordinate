"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Tag {
  code: string;
  name: string;
  color: string;
  count: number;
}

interface SidebarProps {
  tags: Tag[];
  totalCount: number;
}

export function Sidebar({ tags, totalCount }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTagClick = (tagCode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tag", tagCode);
    router.push(`/workflow?${params.toString()}`);
  };

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Workflow</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("tag");
                router.push(`/workflow?${params.toString()}`);
              }}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">All</span>
                <Badge variant="secondary" className="text-sm">
                  {totalCount}
                </Badge>
              </div>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Tags</h2>
          <div className="space-y-3">
            {tags.map((tag) => (
              <button
                key={tag.code}
                onClick={() => handleTagClick(tag.code)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-lg font-medium">{tag.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {tag.count}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
