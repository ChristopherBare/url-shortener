interface URLEntry {
  generatedKey: string;
  longURL: string;
  preferredAlias?: string;
  generatedURL: string;
  createdAt?: number;
}

class URLService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  }

  /**
   * Get a URL entry by its generated key
   */
  async getUrlByKey(generatedKey: string): Promise<URLEntry | null> {
    try {
      const response = await fetch(`${this.apiUrl}/urls/${generatedKey}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      return await response.json();
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
      const response = await fetch(
        `${this.apiUrl}/urls/check-alias?alias=${encodeURIComponent(preferredAlias)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to check alias: ${response.statusText}`);
      }

      const data = await response.json();
      return data.exists;
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
      const response = await fetch(`${this.apiUrl}/urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to create URL: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error inserting URL:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const dynamodbService = new URLService();
