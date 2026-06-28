---
title: Why We Are Choosing mT5 Over Gemini for Japanese Translation at Scale
description: A deep dive into why a 3.7B encoder-decoder model (mT5) outperforms general LLMs like Gemini for large-scale Japanese translation tasks.
category: AI & Agents
tags: ["ai", "machine-translation", "nlp"]
date: 2026-06-29
updatedText: Updated today
featured: true
icon: layers
---

We are onboarding a new Japanese client. They have 50,000 reports that need translation. Before writing a single line of fine-tuning code, we run the token math on the obvious path — Gemini 2.5 Flash. What we find stops us in our tracks.

Each report averages ~250,000 output tokens. At Gemini 2.5 Flash pricing:

**Gemini 2.5 Flash — Cost Projection**
*(Press enter or click to view image in full size)*

**$35k**. For one client. For translation alone. Gemini 2.5 Flash is a genuinely impressive model — this is not a criticism of it. It is simply the wrong tool for what we are building.

So we go back to first principles: what architecture actually fits this problem?

The key insight: translation is a sequence-to-sequence task, not a reasoning or chat task. The architecture you choose should match the task — not just the benchmark leaderboard.

## The Architecture Problem

Large language models like Gemini, GPT-4, and Gemma are decoder-only transformers. They are exceptional at reasoning, instruction-following, code generation, and multi-turn chat. But they are not designed specifically for translation — translation is one skill among dozens they have absorbed during pretraining.

mT5 is different. It is a multilingual encoder-decoder model covering 101 languages, trained explicitly as a text-to-text system. The architecture matters here.

### Encoder-Decoder (mT5)
* Japanese sentence → Encoder
* Full representation stored
* Cross-attention at every step
* Decoder generates English

### Decoder-Only (GPT, Gemma)
* [Prompt] + [Japanese text]
* Tokens continue in sequence
* Source competes with output
* English output generated

In an encoder-decoder model, the decoder can attend to the full encoder representation at every generation step. When the model is producing word 30 of the English translation, it still has direct access to the first word of the Japanese source via cross-attention.

In a decoder-only model, the source and target share the same context window. As the English output grows, attention over early source tokens naturally weakens. For short sentences this barely matters. For long business reports with complex nested clauses, it is the difference between accurate translation and plausible-sounding drift.

## Why Japanese Makes This Worse

Japanese is a linguistically challenging source language for decoder-only models for specific structural reasons:

* **SOV word order.** Japanese puts the verb at the end of the sentence. An English speaker would say “I bought a book yesterday.” Japanese says “I yesterday book bought.” The decoder-only model sees the subject, then sees modifiers, then finally sees the verb — and must maintain all of that in working attention memory to produce the right English word order.
* **Particles carry grammar.** The particles は (topic), が (subject), を (object), に (direction/time) encode grammatical relationships that have no direct English equivalent. A model without deep cross-attention can misplace these subtly.
* **Omitted subjects.** Japanese regularly drops the subject when it’s implied by context. “本を読んでいた” (was reading a book) doesn’t say who. The model must resolve this from surrounding context and produce the correct English subject.

Consider this example:

> 昨日買った本をまだ読んでいない。

* **Correct English:** “I still haven’t read the book I bought yesterday.”
* **A decoder-only model might produce:** “I haven’t read yesterday’s book yet.”

Both are understandable. In casual conversation, either works. In a business report — legal, financial, technical — the first version is accurate and the second is not. At 50,000 reports, that difference will compound into a serious quality problem.

## The Model Comparison

*(Press enter or click to view image in full size)*

## Why Not NLLB-200?

NLLB-200 (No Language Left Behind) from Meta is a strong open-source translation model, especially at the 1.3B distilled parameter count. It is often cited as a top choice for Japanese-English translation. Our benchmarks tell a different story.

On our domain corpus, mT5-XL scores 25.6 BLEU on Japanese→English versus NLLB-200’s 11.5 — more than double. The gap is smaller on English→Japanese (31.7 vs 30.3), but mT5-XL leads there too. We believe the Japanese→English gap is so large because Japanese SOV word order creates a bigger structural mismatch with English, and mT5’s cross-attention handles that restructuring more effectively than NLLB-200’s architecture does on our specific data.

If you are building a general-purpose translation pipeline and cannot fine-tune, NLLB-200 distilled 1.3B remains a solid baseline. But if you have domain data and the ability to fine-tune, these numbers show mT5-XL is the clear winner for Japanese→English.

## Fine-Tuning mT5 for Our Domain

The fine-tuning process for mT5 is remarkably clean. The input-output format maps directly onto the task:

```python
# mT5 training format

input_text = "translate Japanese to English: 昨日の会議の議事録を送付します。"

target_text = "Please find attached the minutes from yesterday’s meeting."

# That’s it. No chat templates, no instruction tuning gymnastics.

# We trained on 1.5 million domain-specific Japanese-English pairs.
```

Compare this with fine-tuning a decoder-only model, which requires careful prompt formatting, instruction tuning, and guardrails against the model producing conversational filler around the translation.

We have fine-tuned on a corpus of 1.5 million Japanese-English report pairs from our domain — human-verified, domain-specific, covering the full range of terminology our client uses. At that scale, the model does not just learn translation; it learns our client’s language. Training runs on an A100 cluster over several days. Inference runs comfortably on a single A10 GPU — infrastructure we already have. The cost per report drops from ~$700 (Gemini API) to a few cents of compute.

## Our Results: BLEU Scores After Fine-Tuning

After fine-tuning on our 1.5 million pair corpus, we benchmark both models on our held-out test set. The numbers make the architecture argument concrete:

*(Press enter or click to view image in full size)*

On Japanese→English — our primary direction — mT5-XL scores 25.6 vs 11.5 for NLLB-200. That is more than double the BLEU score. For English→Japanese, both models are competitive (31.7 vs 30.3), but mT5-XL still leads. This is exactly what the cross-attention architecture predicts: holding the full Japanese source in the encoder pays off most when the target language (English) has very different word order.

## My Recommended Ranking (Under 4B Parameters)

### Pure Japanese → English Translation
* **mT5-XL (3.7B)**
  25.6 BLEU (Ja→En) on our corpus. Best with domain fine-tuning data.
* **NLLB-200 Distilled 1.3B**
  11.5 BLEU (Ja→En). Strong baseline if you cannot fine-tune.
* **mBART-50**
  Good encoder-decoder alternative, especially for multilingual scenarios.
* **Qwen3.5–4B**
  Strong multilingual LLM if you need translation + other tasks.
* **Gemma E4B**
  Best for translation + reasoning + RAG in a single model.

## When to Use Decoder-Only Anyway

This decision isn’t always in favour of encoder-decoder. If you need:

* Translation + a conversational interface around it
* Translation + RAG over a knowledge base
* Translation + structured information extraction from the same text
* One model to handle multiple languages and task types

Then Qwen3.5–4B or Gemma E4B makes sense. The trade-off is that you are getting a generalist doing one specific job — you pay in translation accuracy, but you gain in flexibility. For our use case — bulk report translation, same task, 50,000 times — a specialist wins decisively.

## Final Verdict

*(Press enter or click to view image in full size)*

## The Bigger Lesson

The AI ecosystem has a tendency to reach for the biggest, most capable model available. That instinct is often wrong — not because large models are not impressive, but because architectural fit matters more than raw capability for specific tasks.

A 3.7B encoder-decoder model with every parameter optimized for multilingual sequence-to-sequence tasks will frequently outperform a 4B general LLM on translation — and will cost orders of magnitude less to run at scale. In our case, the difference is the gap between $35M in API spend and a self-hosted solution running on existing infrastructure.

We are not saying never use Gemini. We are saying: understand the architecture, match it to the task, and run the token math before you commit. The right tool for the job is rarely the most famous one.

---
**Tags:** mT5 · Machine Translation · Japanese NLP · Fine-tuning · LLM Architecture · Cost Optimization

Questions or thoughts? This is a live production decision we are working through — happy to go deeper on fine-tuning setup, VRAM requirements, domain adaptation, or evaluation methodology.

*Fine Tuning, Llm Model, Translation, ML, Machine Learning*
