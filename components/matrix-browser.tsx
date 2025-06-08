"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Home,
  Globe,
  Search,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { MatrixBrowserClient } from "@/lib/matrix-client";
import { MDXRenderer } from "./mdx-renderer";

interface BrowserState {
  currentUrl: string;
  isLoading: boolean;
  content: string | null;
  author: string | null;
  timestamp: number | null;
  error: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
}

export function MatrixBrowser() {
  const [state, setState] = useState<BrowserState>({
    currentUrl: "",
    isLoading: false,
    content: null,
    author: null,
    timestamp: null,
    error: null,
    canGoBack: false,
    canGoForward: false,
  });

  const [urlInput, setUrlInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [client] = useState(() => new MatrixBrowserClient());

  const navigate = useCallback(
    async (url: string) => {
      if (!url.trim()) return;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        currentUrl: url,
      }));

      setProgress(20);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 80));
        }, 200);

        const result = await client.fetchUserContent(url);

        clearInterval(progressInterval);
        setProgress(100);

        if (result) {
          setState((prev) => ({
            ...prev,
            content: result.content,
            author: result.author,
            timestamp: result.timestamp,
            isLoading: false,
            error: null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            content: null,
            author: null,
            timestamp: null,
            isLoading: false,
            error: `No content found for user: ${url}`,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          content: null,
          author: null,
          timestamp: null,
          isLoading: false,
          error: `Failed to load content: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        }));
      }

      setTimeout(() => setProgress(0), 1000);
    },
    [client]
  );

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(urlInput);
  };

  const handleRefresh = () => {
    if (state.currentUrl) {
      navigate(state.currentUrl);
    }
  };

  const handleHome = () => {
    setUrlInput("");
    setState((prev) => ({
      ...prev,
      currentUrl: "",
      content: null,
      author: null,
      timestamp: null,
      error: null,
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Browser Chrome */}
      <Card className="rounded-none border-0 border-b">
        <div className="p-4 space-y-4">
          {/* Navigation Bar */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!state.canGoBack}
              className="px-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!state.canGoForward}
              className="px-2"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={state.isLoading}
              className="px-2"
            >
              {state.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleHome}
              className="px-2"
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>

          {/* Address Bar */}
          <form onSubmit={handleUrlSubmit} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter Matrix username (e.g., @alice:matrix.org)"
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button type="submit" size="sm" disabled={state.isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Go
            </Button>

            {/* Help Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>How to Host Your Website on Matrix</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold mb-2">
                      Using Element (Matrix Client)
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>
                        Open Element and join the room:{" "}
                        <code className="bg-muted px-1 rounded">
                          #matrix-internet:matrix.org
                        </code>
                      </li>
                      <li>
                        Create your website content in MDX format (Markdown with
                        JSX)
                      </li>
                      <li>
                        Wrap your content in a code block with{" "}
                        <code className="bg-muted px-1 rounded">```mdx</code>
                      </li>
                      <li>Post your message to the room</li>
                      <li>
                        Your content will now be accessible via your Matrix
                        username
                      </li>
                    </ol>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">
                      Example Website Content
                    </h3>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {`\`\`\`mdx
# Welcome to My Matrix Website

This is my personal website hosted on Matrix!

## About Me
I'm a developer who believes in decentralized web.

## My Projects
- [Project 1](https://example.com)
- [Project 2](https://example.com)

## Contact
Reach me at @myusername:matrix.org
\`\`\``}
                    </pre>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Tips</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Use MDX for rich content with React components</li>
                      <li>Keep your content updated by posting new messages</li>
                      <li>
                        Use your full Matrix ID (e.g., @alice:matrix.org) as the
                        URL
                      </li>
                      <li>
                        Content is fetched from the latest message in the room
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </form>

          {/* Progress Bar */}
          {state.isLoading && <Progress value={progress} className="h-1" />}

          {/* Status Bar */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {state.currentUrl && (
              <>
                <Badge variant="outline">Matrix</Badge>
                <span>•</span>
                <span>{state.currentUrl}</span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {!state.currentUrl && !state.isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-md">
              <Globe className="w-16 h-16 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-semibold">
                Matrix Internet Browser
              </h2>
              <p className="text-muted-foreground">
                Enter a Matrix username to browse their hosted content. This
                browser fetches websites hosted on the Matrix network.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try:</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUrlInput("@example:matrix.org");
                    navigate("@example:matrix.org");
                  }}
                >
                  @example:matrix.org
                </Button>
              </div>
            </div>
          </div>
        )}

        {state.isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">
                Loading content from Matrix...
              </p>
            </div>
          </div>
        )}

        {state.error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Content Not Found</h2>
              <p className="text-muted-foreground">{state.error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {state.content && !state.isLoading && (
          <div className="p-6 max-w-4xl mx-auto">
            <MDXRenderer
              content={state.content}
              author={state.author || undefined}
              timestamp={state.timestamp || undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
