import {
  createClient,
  MatrixClient,
  IContent,
  MatrixEvent,
} from "matrix-js-sdk";

interface MatrixContent {
  content: string;
  contentType: string;
  author: string;
  timestamp: number;
}

export class MatrixBrowserClient {
  private client: MatrixClient | null = null;
  private readonly defaultRoom = "#matrix-internet:matrix.org"; // Default room for hosting websites

  async initialize(baseUrl: string = "https://matrix.org") {
    try {
      this.client = createClient({
        baseUrl,
        useAuthorizationHeader: true,
      });

      return true;
    } catch (error) {
      console.error("Failed to initialize Matrix client:", error);
      return false;
    }
  }

  async fetchUserContent(username: string): Promise<MatrixContent | null> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      // Look for user's content in the predefined room
      const roomId = await this.resolveRoomAlias(this.defaultRoom);
      if (!roomId) {
        throw new Error("Could not resolve room alias");
      }

      // Get room state and timeline events
      const room = this.client!.getRoom(roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      // Get timeline events (messages)
      const timelineEvents = room.timeline;

      // Look for messages from the specified user that contain file content
      const userMessages = timelineEvents.filter((event: MatrixEvent) => {
        const sender = event.getSender();
        return sender?.includes(username) && this.isContentMessage(event);
      });

      if (userMessages.length === 0) {
        return null;
      }

      // Get the latest content message from the user
      const latestMessage = userMessages[0];
      const content = this.extractContent(latestMessage);

      return {
        content,
        contentType: "text/mdx",
        author: latestMessage.getSender() || username,
        timestamp: latestMessage.getTs(),
      };
    } catch (error) {
      console.error("Failed to fetch user content:", error);
      return null;
    }
  }

  private async resolveRoomAlias(alias: string): Promise<string | null> {
    try {
      const response = await this.client!.getRoomIdForAlias(alias);
      return response.room_id;
    } catch (error) {
      console.error("Failed to resolve room alias:", error);
      return null;
    }
  }

  private isContentMessage(event: MatrixEvent): boolean {
    const content = event.getContent();
    return (
      content.msgtype === "m.text" &&
      (content.body?.includes("```mdx") ||
        content.body?.includes("# ") ||
        content.formatted_body)
    );
  }

  private extractContent(event: MatrixEvent): string {
    const content = event.getContent();

    // Try to get formatted content first, then fall back to plain text
    if (content.formatted_body) {
      return content.formatted_body;
    }

    if (content.body) {
      // If it's wrapped in code blocks, extract the content
      if (content.body.includes("```mdx")) {
        const match = content.body.match(/```mdx\n([\s\S]*?)\n```/);
        return match ? match[1] : content.body;
      }
      return content.body;
    }

    return "";
  }

  async searchRooms(query: string): Promise<string[]> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const publicRooms = await this.client!.publicRooms();
      return publicRooms.chunk
        .filter(
          (room) =>
            room.name?.toLowerCase().includes(query.toLowerCase()) ||
            room.topic?.toLowerCase().includes(query.toLowerCase())
        )
        .map((room) => room.name || room.room_id)
        .slice(0, 10);
    } catch (error) {
      console.error("Failed to search rooms:", error);
      return [];
    }
  }
}
