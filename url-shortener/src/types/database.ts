/**
 * Database type definitions for DynamoDB
 */

/**
 * Represents a shortened URL entry in DynamoDB
 */
export interface URLEntry {
  /** Unique identifier for the short URL (either random nanoid or custom alias) */
  generatedKey: string;

  /** The original long URL to redirect to */
  longURL: string;

  /** Optional user-provided custom alias */
  preferredAlias?: string;

  /** The full shortened URL (e.g., https://short.er/abc12) */
  generatedURL: string;

  /** Timestamp (milliseconds) when the URL was created */
  createdAt?: number;
}

/**
 * Request payload for creating a new shortened URL
 */
export interface CreateURLRequest {
  longURL: string;
  preferredAlias?: string;
}

/**
 * Response from URL creation
 */
export interface CreateURLResponse {
  generatedKey: string;
  generatedURL: string;
  success: boolean;
}

/**
 * Response from URL lookup
 */
export interface URLLookupResponse {
  longURL: string | null;
  found: boolean;
}

/**
 * DynamoDB Service interface
 */
export interface IDynamoDBService {
  /**
   * Get a URL entry by its generated key
   */
  getUrlByKey(generatedKey: string): Promise<URLEntry | null>;

  /**
   * Check if a preferred alias already exists
   */
  checkAliasExists(preferredAlias: string): Promise<boolean>;

  /**
   * Insert a new URL entry
   */
  insertUrl(entry: URLEntry): Promise<void>;
}
