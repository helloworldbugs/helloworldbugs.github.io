import { sliceByCodePoints } from "./sliceByCodePoints";
import { stripMarkdown } from "./stripMarkdown";

export interface WidgetPost {
  id: string;
  data: {
    title: string;
    description: string;
  };
}

export interface WidgetPostSource {
  id: string;
  body?: string;
  data: {
    title: string;
    description?: string;
    encrypted?: boolean;
    password?: string;
  };
}

const DEFAULT_EXCERPT_LENGTH = 300;

export function createWidgetPosts(
  posts: WidgetPostSource[],
  excerptLength: number = DEFAULT_EXCERPT_LENGTH,
): WidgetPost[] {
  return posts.map((post) => {
    const explicitDescription = post.data.description?.trim() || "";
    const bodyExcerpt =
      !post.data.encrypted && post.body
        ? sliceByCodePoints(stripMarkdown(post.body), excerptLength)
        : "";

    return {
      id: post.id,
      data: {
        title: post.data.title,
        description: explicitDescription || bodyExcerpt,
      },
    };
  });
}
