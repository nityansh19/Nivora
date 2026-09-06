# Phase 15 — AI Financial Assistant

Nivora now includes a premium financial copilot surface grounded in the user's existing local finance data.

## Included

- Natural-language-style question input
- Intent detection for summary, spending, budget, income, savings and help
- Current-month cash-flow explanations
- Largest spending category analysis
- Budget remaining / over-limit explanation
- Income and expense context
- Savings-goal progress context
- Suggested prompts
- Animated response cards
- Responsive assistant modal
- Honest empty-data behavior

## Safety and trust boundary

The current assistant is a deterministic local intelligence layer. It does not send financial data to an external AI provider and it does not invent missing numbers.

This is intentionally the first intelligence layer. A future AI provider can sit behind a server-side privacy boundary after authentication, consent, rate limiting and data-minimization are implemented.

## Next intelligence work

- Server-side model gateway
- Tool/function calling over Nivora's domain services
- Explainable calculations
- User-controlled AI data permissions
- Conversation persistence
- Streaming responses
- Action proposals with explicit confirmation
- Stronger anomaly and trend detection
