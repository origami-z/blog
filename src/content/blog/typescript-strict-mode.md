---
title: "Why I Use TypeScript Strict Mode"
description: "Strict mode catches bugs before they happen. Here's why it's worth the effort."
pubDate: 2026-06-19
tags: ["typescript", "dx"]
draft: false
---

Every new project I start uses `"strict": true` in `tsconfig.json`. Here's
why I think it's non-negotiable.

## What Strict Mode Enables

The `strict` flag is actually a shorthand for several individual checks:

- `strictNullChecks` — no more `undefined is not a function`
- `strictFunctionTypes` — correct variance for function parameters
- `strictPropertyInitialization` — class properties must be initialized
- `noImplicitAny` — forces you to type things explicitly
- `noImplicitThis` — catches `this` context bugs

## The Trade-off

Yes, it's more typing up front. You'll write more type annotations, more
null checks, and more explicit returns. But the payoff is enormous:

1. Bugs caught at compile time instead of runtime
2. Better editor autocomplete and refactoring
3. Self-documenting code through types
4. Confidence when refactoring

## My Rule

If adding a type annotation feels tedious, it's usually a sign that the
code's structure could be simpler. Strict mode pushes you toward better
design.
