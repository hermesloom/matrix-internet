import type { NextConfig } from "next";
import withMDX from "@next/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

export default withMDX({
  options: {
    remarkPlugins: [remarkFrontmatter, remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight],
  },
})(nextConfig);
