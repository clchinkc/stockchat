const API_BASE = 'http://localhost:8000/api/v1';

export interface StockStats {
  technical: {
    current_price: number;
    daily_change: number;
    daily_return: number;
    yearly_change: number;
    yearly_return: number;
    daily_volume: number;
    avg_daily_volume: number;
    yearly_high: number;
    yearly_low: number;
    daily_volatility: number;
    avg_daily_return: number;
    annualized_volatility: number;
    ticker: string;
    trend: string;
    trend_strength: number;
  };
  fundamental: {
    marketCap: number;
    trailingPE: number;
    forwardPE: number;
    priceToBook: number;
    beta: number;
    dividendYield: number;
    trailingEps: number;
    forwardEps: number;
    profitMargins: number;
    operatingMargins: number;
    sector: string;
    industry: string;
  };
}

export interface ApiResponse {
  stockData: StockStats[];
  analysisText: {
    summary: string;
    technicalFactors: string[];
    fundamentalFactors: string[];
    outlook: string;
    timestamp: string;
  };
  shareId?: string;
}

interface CacheItem {
  data: ApiResponse;
  timestamp: number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static RETRY_ATTEMPTS = 3;
  private static RETRY_DELAY = 1000; // 1 second
  private static TIMEOUT = 10000; // 10 seconds
  private static pendingRequests = new Map<string, Promise<ApiResponse>>();

  private static async fetchWithTimeout(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ApiClient.TIMEOUT);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  private static getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    return `${endpoint}${params ? JSON.stringify(params) : ''}`;
  }

  private static getFromCache(key: string): ApiResponse | null {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CacheItem = JSON.parse(cached);
    if (Date.now() - timestamp > ApiClient.CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  }

  private static setCache(key: string, data: ApiResponse): void {
    const cacheItem: CacheItem = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  }

  private static async handleResponse(response: Response): Promise<ApiResponse> {
    if (!response.ok) {
      throw new ApiError(
        response.status,
        `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  }

  private static async executeRequest(
    endpoint: string,
    options?: RequestInit,
    useCache = true
  ): Promise<ApiResponse> {
    const cacheKey = this.getCacheKey(endpoint, options?.body);
    
    // Return cached data if available and cache is enabled
    if (useCache) {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;
    }

    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create new request with retry logic
    const request = async (): Promise<ApiResponse> => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= ApiClient.RETRY_ATTEMPTS; attempt++) {
        try {
          const response = await this.fetchWithTimeout(
            `${API_BASE}${endpoint}`,
            options
          );
          const data = await this.handleResponse(response);
          
          if (useCache) {
            this.setCache(cacheKey, data);
          }
          
          return data;
        } catch (error) {
          lastError = error as Error;
          
          if (error instanceof ApiError && error.status === 404) {
            throw error; // Don't retry 404 errors
          }

          if (attempt < ApiClient.RETRY_ATTEMPTS) {
            await new Promise(resolve => 
              setTimeout(resolve, ApiClient.RETRY_DELAY * attempt)
            );
          }
        }
      }

      throw lastError || new Error('Request failed after all retry attempts');
    };

    // Store the promise and remove it when completed
    const promise = request().finally(() => {
      this.pendingRequests.delete(cacheKey);
    });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  static async getInitialStock(): Promise<ApiResponse> {
    return this.executeRequest('/stock', {
      headers: this.getDefaultHeaders(),
    });
  }

  static async getSharedAnalysis(analysisId: string): Promise<ApiResponse> {
    return this.executeRequest(`/stock/share/${analysisId}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  static async analyzeStock(message: string): Promise<ApiResponse> {
    return this.executeRequest(
      '/stock',
      {
        method: 'POST',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify({ message: message }),
      },
      false // Don't cache POST requests
    );
  }

  private static getDefaultHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Clear all cached data
  static clearCache(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(API_BASE)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export default ApiClient; 