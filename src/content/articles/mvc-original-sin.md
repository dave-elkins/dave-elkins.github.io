---
title: 'MVC and the Original Sin'
description: 'There is a file in your codebase called usercontroller.rb, or views/users/index.html.erb, or models/user.py. You know the one. It started out handling user authentication. Now it…'
date: 2026-07-23
series: 'legible-by-design-the-long-search'
order: 4
originalUrl: 'https://medium.com/@daveelkins/mvc-and-the-original-sin-6b9d5ca1a25a'
source: 'medium'
tags: []
draft: false
---

There is a file in your codebase called `user_controller.rb`, or `views/users/index.html.erb`, or `models/user.py`.
You know the one.
It started out handling user authentication.
Now it handles authentication, profile management, notification preferences, subscription status, and something to do with CSV exports that nobody fully understands anymore.

Don't blame yourself — this is the fault of a good idea that got badly distorted on its way from a research lab to a web framework.

---

## What Reenskaug Actually Said

In 1979, Trygve Reenskaug was working at Xerox PARC — the same lab that gave us the mouse, the GUI, and Ethernet.
He was trying to solve a problem with Smalltalk applications: how do you connect a rich domain of objects to the humans who need to interact with them?

His answer was MVC: Model, View, Controller.
But what he meant by _Model_ isn't what you probably think.

Reenskaug's Model was not a database row wrapped in an object.
It was a **representation of a user's mental model** — the concepts that a user thinks in terms of when working with the system.
His [December 1979 note](https://folk.universitetetioslo.no/trygver/1979/mvc-2/1979-12-MVC.pdf) states directly: "Models represent knowledge" and that "there should be a one-to-one correspondence between the model and its parts on the one hand, and the represented world as perceived by the owner of the model on the other hand."
A Model in the original sense was closer to what we would today call a domain concept: something with identity, behavior, and meaning in the user's world.

The View was a visual representation of that mental model.
The Controller was the mediator between the user's gestures and the model's state.
The whole thing was conceived as a way to keep the user's conceptual world legible in the code.

Read [Reenskaug's original 1979 notes](https://folk.universitetetioslo.no/trygver/1979/mvc-2/1979-12-MVC.pdf) and you find something surprisingly thoughtful — a design philosophy, not a folder structure.

---

## The Long Journey from PARC to Rails

Something happened between Reenskaug's whiteboard and DHH's `rails new`.

The pattern passed through Smalltalk-80, through early GUI frameworks, through Java Swing, through early web MVC frameworks like Struts — each translation stripping away a little more of the original intent.
By the time Rails popularized MVC for web development in the mid-2000s, what remained was a filing system in practice.

- **Model**: the database table, wrapped in an ORM class, with some validation logic stapled on
- **View**: the HTML template
- **Controller**: everything else

Rails was brilliant at what it did.
Convention over configuration meant you could build a working CRUD application in minutes.
The folder structure imposed just enough discipline to make teams productive.
For a generation of developers, it was revelatory.
Revelatory — and misleading.

But notice what got lost: Reenskaug's Model was a _conceptual_ entity — something meaningful in the user's world.
Rails' Model is a _persistence_ entity — a row in a table.
The word stayed the same.
The meaning inverted.

---

## The Fat Model Problem (Or: Where Your Complexity Lives Now)

Once you accept that a Model is a database table, you have a problem: where does business logic go?

Rails' answer — "fat models, skinny controllers" — was a reasonable heuristic for small applications.
Keep your controllers thin; put logic in the models.
Fine.

But models don't have natural boundaries.
A `User` model accumulates logic because everything in a typical application touches users.
Authentication lives on `User`.
Authorization logic lives on `User`.
Subscription management lives on `User`.
Notification delivery preferences live on `User`.
After a few years, `User` is a 2,000-line class with 60 methods, and nobody wants to touch it.

You can split it up — service objects, concerns, decorators, presenters — and Rails developers have been inventively papering over this problem for twenty years.
But these are remedies for a structural disease.
The disease is that the Model layer was never designed to express domain concepts; it was designed to express tables.

---

## The Symptom You Recognize

The tell is when a new engineer joins your team and asks "where does the logic for X live?"
— what do you say?

If the answer is "well, some of it is in the model, some is in a service object, there's a concern that handles part of it, and then there's this background job..." — you are experiencing the original sin.

The logic for a feature is scattered because the architecture has no place for it to cohere.
There is no concept of `Subscription` as a first-class entity with its own state, its own actions, and its own operational rules.
There is a `subscriptions` table, and there are various files that touch that table, and collectively they implement subscription behavior — but that behavior has no home.

This is not specific to Rails.
Django has the same shape.
Spring MVC has the same shape.
Express with a layered architecture has the same shape.
The framework provides a filing system; it does not provide a conceptual architecture.

---

## What Reenskaug Was Pointing At

The frustrating thing is that Reenskaug was pointing at the right idea.
He wanted code to reflect the concepts users think in.
He wanted the system's structure to mirror the user's mental model of the domain.

He just didn't have the vocabulary to make it stick.
"Model" was too easy to misread as "data model."
The pattern got cargo-culted: people kept the folder structure and threw away the philosophy.

Forty-five years later, [Daniel Jackson's Concept Design](/writing/jacksons-synthesis/) is, among other things, a serious attempt to recover what Reenskaug was actually after.
Jackson's "concept" is explicitly defined as a unit of user-facing functionality — something that exists because users need it, with behavior that users can understand.
Not a table.
Not a layer.
A concept.

The MVC filing system gave us organized code.
What we actually needed was conceptual architecture.
Not a filing system.
A design theory.
The field is still catching up.

---

---

_Part of the series: Legible by Design: The Long Search_

## References

- Reenskaug, T. (1979). [MVC — The Original MVC Notes](https://folk.universitetetioslo.no/trygver/1979/mvc-2/1979-12-MVC.pdf)
- Jackson, D. [_The Essence of Software_](https://essenceofsoftware.com)
