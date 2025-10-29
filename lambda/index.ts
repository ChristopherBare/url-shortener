import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);
const tableName = process.env.TABLE_NAME || 'url-shortener-urls';

interface URLEntry {
  generatedKey: string;
  longURL: string;
  preferredAlias?: string;
  generatedURL: string;
  createdAt?: number;
}

// CORS headers for development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Get URL by key
async function getUrl(generatedKey: string): Promise<URLEntry | null> {
  try {
    const response = await docClient.send(new GetCommand({
      TableName: tableName,
      Key: { generatedKey },
    }));
    return response.Item ? (response.Item as URLEntry) : null;
  } catch (error) {
    console.error('Error getting URL:', error);
    throw error;
  }
}

// Check if alias exists
async function checkAliasExists(preferredAlias: string): Promise<boolean> {
  try {
    const response = await docClient.send(new QueryCommand({
      TableName: tableName,
      IndexName: 'preferredAliasIndex',
      KeyConditionExpression: 'preferredAlias = :alias',
      ExpressionAttributeValues: { ':alias': preferredAlias },
    }));
    return response.Items && response.Items.length > 0;
  } catch (error) {
    console.error('Error checking alias:', error);
    throw error;
  }
}

// Create new URL entry
async function createUrl(entry: URLEntry): Promise<void> {
  try {
    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: {
        ...entry,
        createdAt: entry.createdAt || Date.now(),
      },
    }));
  } catch (error) {
    console.error('Error creating URL:', error);
    throw error;
  }
}

// Lambda handler
export const handler: APIGatewayProxyHandler = async (event) => {
  const method = event.httpMethod;
  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // OPTIONS for CORS preflight
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'OK' }),
      };
    }

    // GET /urls/{generatedKey} - Retrieve URL
    if (method === 'GET' && path.match(/^\/urls\/[^/]+$/)) {
      const generatedKey = path.split('/')[2];
      const url = await getUrl(generatedKey);

      if (!url) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'URL not found' }),
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(url),
      };
    }

    // POST /urls - Create new URL
    if (method === 'POST' && path === '/urls') {
      const { generatedKey, longURL, preferredAlias, generatedURL } = body;

      // Validate required fields
      if (!generatedKey || !longURL || !generatedURL) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing required fields' }),
        };
      }

      // Check if alias already exists
      if (preferredAlias) {
        const aliasExists = await checkAliasExists(preferredAlias);
        if (aliasExists) {
          return {
            statusCode: 409,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Alias already exists' }),
          };
        }
      }

      // Create the URL entry
      await createUrl({
        generatedKey,
        longURL,
        preferredAlias,
        generatedURL,
      });

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'URL created successfully',
          generatedKey,
          generatedURL,
        }),
      };
    }

    // GET /urls/check-alias - Check if alias exists
    if (method === 'GET' && path.match(/^\/urls\/check-alias\?.*alias=/)) {
      const url = new URL(event.requestContext.domainName + path, 'https://example.com');
      const alias = url.searchParams.get('alias');

      if (!alias) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Alias parameter required' }),
        };
      }

      const exists = await checkAliasExists(alias);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ exists }),
      };
    }

    // 404
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
