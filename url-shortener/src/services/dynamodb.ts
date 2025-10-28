import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

interface URLEntry {
  generatedKey: string;
  longURL: string;
  preferredAlias?: string;
  generatedURL: string;
  createdAt?: number;
}

class DynamoDBService {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const region = import.meta.env.VITE_AWS_REGION || "us-east-1";
    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    this.tableName = import.meta.env.VITE_DYNAMODB_TABLE_NAME || "url-shortener-urls";

    const dynamoDBClient = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.client = DynamoDBDocumentClient.from(dynamoDBClient);
  }

  /**
   * Get a URL entry by its generated key (primary key lookup)
   */
  async getUrlByKey(generatedKey: string): Promise<URLEntry | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          generatedKey,
        },
      });

      const response = await this.client.send(command);
      return response.Item ? (response.Item as URLEntry) : null;
    } catch (error) {
      console.error("Error fetching URL by key:", error);
      throw error;
    }
  }

  /**
   * Check if a preferred alias already exists
   */
  async checkAliasExists(preferredAlias: string): Promise<boolean> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: "preferredAliasIndex", // GSI for querying by preferred alias
        KeyConditionExpression: "preferredAlias = :alias",
        ExpressionAttributeValues: {
          ":alias": preferredAlias,
        },
      });

      const response = await this.client.send(command);
      return response.Items && response.Items.length > 0;
    } catch (error) {
      console.error("Error checking if alias exists:", error);
      throw error;
    }
  }

  /**
   * Insert a new URL entry
   */
  async insertUrl(entry: URLEntry): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: {
          ...entry,
          createdAt: entry.createdAt || Date.now(),
        },
      });

      await this.client.send(command);
    } catch (error) {
      console.error("Error inserting URL:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const dynamodbService = new DynamoDBService();
