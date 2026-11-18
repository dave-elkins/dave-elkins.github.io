---
title: "The Machine Doesn't Care"
subtitle: 'Legible by Design: The Long Search — Post 2'
description: 'You have stared at a bug for an hour. The logic looks right. The machine does not care what you meant.'
date: 2026-07-23
series: 'legible-by-design-the-long-search'
order: 2
originalUrl: 'https://medium.com/@daveelkins/the-machine-doesnt-care-0b9a96499c74'
source: 'medium'
tags: []
draft: false
---

You have stared at a bug for an hour.
The logic looks right.
The machine does not care what you meant.

In 1936, a Cambridge mathematician in his early twenties named Alan Turing published a paper that defined what computation was.
He did it by imagining a machine so simple it was almost absurd: an infinite tape divided into cells, a read/write head that could move left or right, and a finite set of rules governing what to do next based on what the head currently read.

The Turing machine was not meant to be built.
It was a thought experiment — a way of asking "what can be computed?"
in a mathematically precise form.
But it established something that would shape the next ninety years of software: the foundational model of computation is a machine following instructions.
Code is instructions.
The machine executes them.
Whether a human can understand what the instructions mean is not part of the model.

The machine doesn't care.
It never did.

---

## The Stored-Program Architecture

A decade after Turing's paper, John von Neumann and his colleagues at the Institute for Advanced Study in Princeton produced a design for an electronic computer that would become the template for nearly every computer built since.
The key insight — elegant, consequential, and in retrospect double-edged — was that programs and data should live in the same memory.

Before the stored-program architecture, programming a computer meant physically rewiring it.
The ENIAC, the famous early American computer, was reprogrammed by plugging and unplugging cables.
Von Neumann's design replaced the cables with instructions stored in memory alongside the data they operated on.
You could change what the computer did by changing the contents of memory rather than by rewiring the hardware.

This was a liberation.
Programs became things you could write, store, copy, and modify.
The entire software industry flows from this decision.

But notice what the architecture assumes: a program is a sequence of instructions stored in memory, to be fetched and executed one at a time.
The structure that matters is the structure the machine sees — memory addresses, instruction pointers, registers.
Whether the program has a structure that a human can comprehend is, again, not part of the model.

The stored-program architecture gave us software.
It did not give us legible software.

---

## Assembly and the First Gap

The earliest programmers worked directly in binary or assembly language — sequences of numeric codes that corresponded directly to machine instructions.
Programming was close to the metal.
Every instruction moved data between specific registers, jumped to specific memory addresses, performed specific arithmetic operations.

This wasn't inherently illegible — expert assembly programmers could read code with fluency, the way a musician reads a score.
But it was illegible to everyone else, and it scaled poorly.
As programs grew, the gap between what the code said and what the programmer intended became harder and harder to bridge.

The first widely used high-level programming languages — Fortran in 1957, LISP in 1958, COBOL in 1959 — were attempts to close this gap.
Fortran let scientists write mathematical formulas in something resembling mathematical notation.
COBOL used English-like syntax on the theory that business logic should read like business language.
LISP represented programs as data structures that could reason about themselves.

Each was an attempt to make code express something closer to human intent.
Each was also a bet on what human intent looks like: mathematical formulas, business prose, symbolic logic.
The question of what the right level of abstraction was — what programs should be _organized around_ — was not yet clearly posed.

---

## What the Pioneers Inherited

By the late 1950s, a generation of programmers was building systems of a scale and complexity that nobody had anticipated.
The US military's SAGE air defense system, which became operational in 1959, comprised around a million lines of code — an almost unimaginable number at the time.
The programmers who built it were, in effect, inventing software engineering as they went.

What they inherited from Turing and Von Neumann was a model of computation that was precise, powerful, and entirely indifferent to human comprehension.
Code worked if the machine could execute it.
Whether a person could read it, understand it, reason about it, or modify it safely was a separate question — one the foundational models had nothing to say about.

The original sin of software runs deeper than anything MVC or OOP would later commit.
The definition of "correct code" was set before "comprehensible code" was even on the agenda.

The pioneers of the 1960s and 1970s — [Dijkstra, Knuth, Parnas, Brooks](/writing/the-first-legibilists/) — would spend their careers trying to put comprehensibility on the agenda.
The next post is about their efforts, what they got right, and what they left for subsequent generations to finish.

---

## A Note on What Was Not Wrong

It would be easy to read this history as a story of mistake.
Turing got it wrong.
Von Neumann got it wrong.
The early language designers got it wrong.

That reading would be unfair.

Turing was asking a mathematical question about computability, not a design question about software.
Von Neumann was solving an engineering problem — how do you build a general-purpose computer?
— not a usability problem.
The early language designers were trying to make programming possible at all, not to make it beautiful.

The gap between "what machines need" and "what humans need" was not a mistake.
It was an inevitability.
You cannot design for human comprehension until you have something for humans to comprehend — until programs are large enough, complex enough, and long-lived enough that comprehension becomes a genuine problem.

By the 1960s, programs were all of those things.
The problem had arrived.
The question was whether the field would notice.

---

---

_Part of the series: Legible by Design: The Long Search_
