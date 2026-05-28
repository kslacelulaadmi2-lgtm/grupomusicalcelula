# Testing Scripts

## Overview

This directory contains utility testing scripts for the Grupo Musical Célula website. These are lightweight, manual test scripts designed to:
- Verify API configurations
- Check service connectivity
- Diagnose potential integration issues

## Available Tests

### 1. Multi-Provider Chatbot Test
- File: `test-multi-provider.js`
- Purpose: Verify multi-provider chatbot system
- Checks: Local server, OpenRouter, Groq API

### 2. Gemini API Test
- File: `test-gemini-api.js`
- Purpose: Validate Google Gemini API connectivity
- Checks: 
  - API key validity
  - Available models
  - Content generation
  - Rate limits

### 3. Local Deployment Test
- File: `test-local-deployment.js`
- Purpose: Verify local development environment setup

### 4. Chatbot Email Integration Test
- File: `test-chatbot-email.js`
- Purpose: Check email functionality in chatbot system

### 5. Groq Models Test
- File: `test-groq-models.js`
- Purpose: Verify Groq AI model configurations

## Running Tests

Prerequisites:
- Node.js 18+
- Required environment variables set

Run a specific test:
```bash
node tests/test-gemini-api.js
```

## Environment Variables

Ensure the following are set before running tests:
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `GROQ_API_KEY`

## Notes

- These are diagnostic scripts, not comprehensive unit or integration tests
- Always check console output for detailed information
- Modify scripts as needed for specific debugging scenarios