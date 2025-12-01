import { supabase } from '@/integrations/supabase/client';
import { apiOrigins, env } from '@/config/env';
import logger from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';
import type { PostgrestError } from '@supabase/supabase-js';

// API response wrapper
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

// Edge function call options
export interface EdgeFunctionOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, string | number | undefined>;
}
type SupabaseFilterValue = string | number | boolean | null;

type Tables = Database['public']['Tables'];
type TableName = keyof Tables & string;
type TableRow<Table extends TableName> = Tables[Table]['Row'];
type TableInsert<Table extends TableName> = Tables[Table]['Insert'];
type TableUpdate<Table extends TableName> = Tables[Table]['Update'];

// Default timeout for edge function calls (10 seconds)
const DEFAULT_TIMEOUT = 10000;

/**
 * Standardized edge function caller with error handling, timeout, and response formatting
 */
export async function callEdgeFunction<T = unknown>(functionName: string, options: EdgeFunctionOptions = {}): Promise<ApiResponse<T>> {
  const {
    method = 'POST',
    body,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    params
  } = options;
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const {
      data: {
        session
      },
      error: sessionError
    } = await supabase.auth.getSession();
    if (sessionError) {
      logger.warn('Error getting session for edge function call', {
        error: sessionError,
        functionName
      }, 'EdgeFunction');
    }

    // Build headers with auth
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (session?.access_token) {
      requestHeaders.Authorization = `Bearer ${session.access_token}`;
    }

    // Build query string for GET requests
    let queryString = '';
    if (params && method === 'GET') {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      queryString = queryParams.toString();
    }

    // Make the request
    const {
      data,
      error
    } = await supabase.functions.invoke<T>(functionName, {
      body,
      headers: requestHeaders,
      method,
      ...(queryString && {
        query: queryString
      })
    });
    clearTimeout(timeoutId);
    if (error) {
      logger.error(`Edge function ${functionName} error`, error, {
        functionName,
        method
      }, 'EdgeFunction');
      return {
        error: error.message || `Edge function ${functionName} failed`,
        status: error.status || 500,
        success: false
      };
    }
    return {
      data,
      status: 200,
      success: true
    };
  } catch (err: unknown) {
    logger.error(`Edge function ${functionName} unexpected error`, err, {
      functionName,
      method
    }, 'EdgeFunction');
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return {
          error: `Edge function ${functionName} timed out after ${timeout}ms`,
          status: 408,
          success: false
        };
      }
      return {
        error: err.message,
        status: 500,
        success: false
      };
    }
    return {
      error: `Unexpected error calling edge function ${functionName}`,
      status: 500,
      success: false
    };
  }
}

/**
 * Direct Supabase client wrapper for table operations
 */
export class SupabaseClient {
  private client = supabase;

  async select<Table extends TableName>(
    table: Table,
    options: {
      columns?: string;
      filter?: Record<string, SupabaseFilterValue>;
      orderBy?: {
        column: string;
        ascending?: boolean;
      };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: TableRow<Table>[] | null; error: PostgrestError | null }> {
    let query = this.client.from(table).select(options.columns || '*');

    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    if (options.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true
      });
    }

    if (typeof options.limit === 'number') {
      query = query.limit(options.limit);
    }

    if (typeof options.offset === 'number') {
      const limit = typeof options.limit === 'number' ? options.limit : 10;
      query = query.range(options.offset, options.offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(`Supabase select error on ${String(table)}`, error, {
        table,
        options
      }, 'SupabaseClient');
      return {
        data: null,
        error
      };
    }

    return {
      data: (data as TableRow<Table>[] | null) ?? null,
      error: null
    };
  }

  async insert<Table extends TableName>(
    table: Table,
    data: TableInsert<Table>
  ): Promise<{ data: TableRow<Table> | null; error: PostgrestError | null }> {
    const { data: result, error } = await this.client.from(table).insert(data).select().single();

    if (error) {
      logger.error(`Supabase insert error on ${String(table)}`, error, {
        table
      }, 'SupabaseClient');
      return {
        data: null,
        error
      };
    }

    return {
      data: result as TableRow<Table>,
      error: null
    };
  }

  async update<Table extends TableName>(
    table: Table,
    id: string,
    data: TableUpdate<Table>
  ): Promise<{ data: TableRow<Table> | null; error: PostgrestError | null }> {
    const { data: result, error } = await this.client.from(table).update(data).eq('id', id).select().single();

    if (error) {
      logger.error(`Supabase update error on ${String(table)}`, error, {
        table,
        id
      }, 'SupabaseClient');
      return {
        data: null,
        error
      };
    }

    return {
      data: result as TableRow<Table>,
      error: null
    };
  }

  async delete<Table extends TableName>(
    table: Table,
    id: string
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.client.from(table).delete().eq('id', id);

    if (error) {
      logger.error(`Supabase delete error on ${String(table)}`, error, {
        table,
        id
      }, 'SupabaseClient');
      return {
        error
      };
    }

    return {
      error: null
    };
  }
}

// Export singleton instance
export const apiClient = new SupabaseClient();

// Export configured origins
export { env, apiOrigins };