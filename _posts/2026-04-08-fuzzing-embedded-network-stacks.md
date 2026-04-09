---
layout: post
title: "Fuzzing Embedded Network Stacks"
date: 2026-04-08
category: research
tags: [planned, fuzzing]
---

Exploring coverage-guided fuzzing approaches for TCP/IP stacks on embedded devices with limited debugging interfaces.

## Background

Embedded network stacks are notoriously under-tested. Many IoT devices ship with custom or stripped-down TCP/IP implementations that have never seen a fuzzer. This research aims to develop a practical methodology for fuzzing these stacks without requiring full JTAG access.

## Goals

- Build a harness for common embedded TCP/IP stacks (lwIP, uIP, picoTCP)
- Adapt AFL++ for bare-metal targets using QEMU emulation
- Document crash triage workflow for embedded targets
- Responsible disclosure of any findings

More details coming as the project progresses.
