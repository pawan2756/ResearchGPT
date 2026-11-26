export const SEED_QUESTIONS = [
  // Category: Factual / Static Knowledge (Expected: Direct)
  { question: 'What is the chemical formula for water?', category: 'factual', expectedMode: 'direct', groundTruth: 'H2O' },
  { question: 'Who was the first President of the United States?', category: 'factual', expectedMode: 'direct', groundTruth: 'George Washington' },
  { question: 'What is the speed of light in a vacuum?', category: 'factual', expectedMode: 'direct', groundTruth: 'Approximately 299,792,458 meters per second' },
  { question: 'What is the boiling point of water at standard atmospheric pressure?', category: 'factual', expectedMode: 'direct', groundTruth: '100 degrees Celsius or 212 degrees Fahrenheit' },
  { question: 'In what year did the Apollo 11 moon landing take place?', category: 'factual', expectedMode: 'direct', groundTruth: '1969' },
  { question: 'What is the capital of Australia?', category: 'factual', expectedMode: 'direct', groundTruth: 'Canberra' },
  { question: 'What planet is known as the Red Planet?', category: 'factual', expectedMode: 'direct', groundTruth: 'Mars' },
  { question: 'Who wrote the play Romeo and Juliet?', category: 'factual', expectedMode: 'direct', groundTruth: 'William Shakespeare' },
  { question: 'What is the largest organ in the human body?', category: 'factual', expectedMode: 'direct', groundTruth: 'The skin' },
  { question: 'How many bones are in the adult human body?', category: 'factual', expectedMode: 'direct', groundTruth: '206 bones' },

  // Category: Technical / Foundations (Expected: Direct)
  { question: 'What does CSS stand for in web development?', category: 'technical', expectedMode: 'direct', groundTruth: 'Cascading Style Sheets' },
  { question: 'What is the time complexity of binary search on a sorted array?', category: 'technical', expectedMode: 'direct', groundTruth: 'O(log n)' },
  { question: 'What does HTTP status code 404 signify?', category: 'technical', expectedMode: 'direct', groundTruth: 'Not Found' },
  { question: 'What data structure operates on a First-In, First-Out (FIFO) basis?', category: 'technical', expectedMode: 'direct', groundTruth: 'Queue' },
  { question: 'What is the purpose of the primary key in a relational database?', category: 'technical', expectedMode: 'direct', groundTruth: 'Uniquely identifies each record/row in a table' },
  { question: 'What does TCP stand for in computer networking?', category: 'technical', expectedMode: 'direct', groundTruth: 'Transmission Control Protocol' },
  { question: 'What is an idempotent HTTP method?', category: 'technical', expectedMode: 'direct', groundTruth: 'A method whose multiple identical requests have the same effect as a single request (e.g. GET, PUT, DELETE)' },
  { question: 'What is the base of the hexadecimal numeral system?', category: 'technical', expectedMode: 'direct', groundTruth: '16' },
  { question: 'In Git, what command creates a new branch and switches to it?', category: 'technical', expectedMode: 'direct', groundTruth: 'git checkout -b <branch> or git switch -c <branch>' },
  { question: 'What does JSON stand for?', category: 'technical', expectedMode: 'direct', groundTruth: 'JavaScript Object Notation' },

  // Category: Temporal & Recent Events (Expected: Research)
  { question: 'What was the latest release date and version of Node.js current release?', category: 'temporal', expectedMode: 'research', groundTruth: 'Requires live check for current active Node.js version' },
  { question: 'Who is the current Prime Minister of the United Kingdom?', category: 'temporal', expectedMode: 'research', groundTruth: 'Keir Starmer (takes office July 2024)' },
  { question: 'What was the outcome and score of the most recent Champions League final?', category: 'temporal', expectedMode: 'research', groundTruth: 'Real Madrid won the 2024 Champions League final 2-0 against Borussia Dortmund' },
  { question: 'What major features were released in the latest version of React 19?', category: 'temporal', expectedMode: 'research', groundTruth: 'Actions, useActionState, useOptimistic, server components support' },
  { question: 'Who won the most recent Academy Award for Best Picture?', category: 'temporal', expectedMode: 'research', groundTruth: 'Oppenheimer (96th Academy Awards)' },
  { question: 'What is the latest status of the Artemis II space mission launch date?', category: 'temporal', expectedMode: 'research', groundTruth: 'NASA target date adjusted to 2025/2026' },
  { question: 'What are the newest AI models released by Anthropic in their Claude 3.5 family?', category: 'temporal', expectedMode: 'research', groundTruth: 'Claude 3.5 Sonnet and Haiku' },
  { question: 'Who is the current CEO of Twitter / X Corp?', category: 'temporal', expectedMode: 'research', groundTruth: 'Linda Yaccarino' },
  { question: 'What was the latest inflation rate reported by the US Bureau of Labor Statistics?', category: 'temporal', expectedMode: 'research', groundTruth: 'Requires live economic indicator lookup' },
  { question: 'Which team won the 2024 ICC Men\'s T20 World Cup?', category: 'temporal', expectedMode: 'research', groundTruth: 'India defeated South Africa in June 2024' },

  // Category: Pricing & Living Entities (Expected: Research)
  { question: 'What is the current stock price and market capitalization of NVIDIA?', category: 'pricing', expectedMode: 'research', groundTruth: 'Requires live financial quote lookup' },
  { question: 'How much does an OpenAI ChatGPT Plus monthly subscription cost today?', category: 'pricing', expectedMode: 'research', groundTruth: '$20 per month' },
  { question: 'What is the current base price of an Apple MacBook Air M3?', category: 'pricing', expectedMode: 'research', groundTruth: '$1,099 starting MSRP' },
  { question: 'What is the current spot price of Bitcoin in USD?', category: 'pricing', expectedMode: 'research', groundTruth: 'Real-time financial market price' },
  { question: 'Who is the current president of the World Bank?', category: 'entity', expectedMode: 'research', groundTruth: 'Ajay Banga' },
  { question: 'Who is the current chief executive of Microsoft Gaming / Xbox?', category: 'entity', expectedMode: 'research', groundTruth: 'Phil Spencer' },
  { question: 'What is the current population of Tokyo metropolitan area?', category: 'entity', expectedMode: 'research', groundTruth: 'Approximately 37 million people' },
  { question: 'What is the price of Google Workspace Business Starter tier per user?', category: 'pricing', expectedMode: 'research', groundTruth: '$6 per user per month' },
  { question: 'Who is the current Secretary-General of the United Nations?', category: 'entity', expectedMode: 'research', groundTruth: 'António Guterres' },
  { question: 'What is the current price per barrel of Brent crude oil?', category: 'pricing', expectedMode: 'research', groundTruth: 'Requires real-time commodity pricing' },
];
