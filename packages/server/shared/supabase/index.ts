/**
 * Supabase Client for Lambda Functions
 * 
 * This module provides a cached Supabase client for use in Lambda functions.
 * Credentials are fetched from AWS Secrets Manager and cached for warm starts.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

interface SupabaseCredentials {
  supabase_url: string;
  supabase_anon_key: string;
  supabase_service_key: string;
  supabase_jwt_secret: string;
  supabase_project_ref: string;
}

interface CachedClient {
  client: SupabaseClient;
  serviceClient: SupabaseClient;
  credentials: SupabaseCredentials;
}

let cachedClient: CachedClient | null = null;
let secretsClient: SecretsManagerClient | null = null;

/**
 * Get Supabase credentials from AWS Secrets Manager
 */
async function getCredentials(): Promise<SupabaseCredentials> {
  const secretArn = process.env.SUPABASE_CREDENTIALS_SECRET_ARN;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!secretArn) {
    throw new Error('SUPABASE_CREDENTIALS_SECRET_ARN environment variable is not set');
  }

  // Initialize Secrets Manager client (cached for warm starts)
  if (!secretsClient) {
    secretsClient = new SecretsManagerClient({ region });
  }

  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretArn })
  );

  if (!response.SecretString) {
    throw new Error('Secret value is empty');
  }

  return JSON.parse(response.SecretString) as SupabaseCredentials;
}

/**
 * Get cached Supabase client or create a new one
 * Uses the anonymous key (for client-side operations)
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (cachedClient) {
    return cachedClient.client;
  }

  const credentials = await getCredentials();

  const client = createClient(credentials.supabase_url, credentials.supabase_anon_key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const serviceClient = createClient(credentials.supabase_url, credentials.supabase_service_key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  cachedClient = { client, serviceClient, credentials };

  return client;
}

/**
 * Get cached Supabase admin client or create a new one
 * Uses the service role key (for admin operations)
 */
export async function getSupabaseAdminClient(): Promise<SupabaseClient> {
  if (cachedClient) {
    return cachedClient.serviceClient;
  }

  const credentials = await getCredentials();

  const client = createClient(credentials.supabase_url, credentials.supabase_anon_key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const serviceClient = createClient(credentials.supabase_url, credentials.supabase_service_key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  cachedClient = { client, serviceClient, credentials };

  return serviceClient;
}

/**
 * Verify a user's JWT token
 * Returns the user object if valid, null if invalid
 */
export async function verifyUserToken(jwt: string) {
  const client = await getSupabaseAdminClient();
  
  try {
    const { data: { user }, error } = await client.auth.getUser(jwt);
    
    if (error) {
      console.error('Error verifying user token:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Exception verifying user token:', error);
    return null;
  }
}

/**
 * Get user by ID (admin operation)
 */
export async function getUserById(userId: string) {
  const client = await getSupabaseAdminClient();
  
  try {
    const { data: { user }, error } = await client.auth.admin.getUserById(userId);
    
    if (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Exception getting user by ID:', error);
    return null;
  }
}

/**
 * List all users (admin operation)
 */
export async function listUsers(page = 1, perPage = 50) {
  const client = await getSupabaseAdminClient();
  
  try {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage,
    });
    
    if (error) {
      console.error('Error listing users:', error);
      return null;
    }
    
    return data.users;
  } catch (error) {
    console.error('Exception listing users:', error);
    return null;
  }
}

/**
 * Create a new user (admin operation)
 */
export async function createUser(email: string, password: string, options?: {
  email_confirm?: boolean;
  user_metadata?: Record<string, any>;
}) {
  const client = await getSupabaseAdminClient();
  
  try {
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: options?.email_confirm ?? false,
      user_metadata: options?.user_metadata,
    });
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Exception creating user:', error);
    return null;
  }
}

/**
 * Delete a user (admin operation)
 */
export async function deleteUser(userId: string) {
  const client = await getSupabaseAdminClient();
  
  try {
    const { error } = await client.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception deleting user:', error);
    return false;
  }
}

/**
 * Update user metadata (admin operation)
 */
export async function updateUserMetadata(userId: string, metadata: Record<string, any>) {
  const client = await getSupabaseAdminClient();
  
  try {
    const { data, error } = await client.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });
    
    if (error) {
      console.error('Error updating user metadata:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Exception updating user metadata:', error);
    return null;
  }
}

/**
 * Clear the cached client (useful for testing)
 */
export function clearCache() {
  cachedClient = null;
  secretsClient = null;
}
