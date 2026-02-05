
export const USAGE_LIMITS = {
  MAX_REQUESTS: 50, // Safety limit per session
  ESTIMATED_MAX_TOKENS: 500000,
};

class UsageTracker {
  private requests = 0;
  private estimatedTokens = 0;
  private isHardStopped = false;

  recordRequest(tokens: number = 2000) {
    this.requests++;
    this.estimatedTokens += tokens;
    
    if (this.requests >= USAGE_LIMITS.MAX_REQUESTS) {
      this.isHardStopped = true;
    }
  }

  forceStop() {
    this.isHardStopped = true;
  }

  get usage() {
    return {
      requests: this.requests,
      maxRequests: USAGE_LIMITS.MAX_REQUESTS,
      isExhausted: this.isHardStopped
    };
  }

  canMakeRequest(): boolean {
    return !this.isHardStopped && this.requests < USAGE_LIMITS.MAX_REQUESTS;
  }
}

export const usageTracker = new UsageTracker();
