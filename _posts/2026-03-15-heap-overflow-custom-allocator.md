---
layout: post
title: "Heap Overflow in Custom Allocator"
date: 2026-03-15
category: ctf
tags: [pwn, picoCTF]
---

Exploiting a use-after-free in a custom slab allocator to get arbitrary write and pop a shell.

## Challenge Info

- **Event:** picoCTF 2026
- **Category:** pwn
- **Points:** 500
- **Solves:** 42

## Analysis

The binary implements a custom slab allocator for managing "notes." Each note gets a fixed-size chunk from a pre-allocated pool. The vulnerability is in the `delete_note` function — it frees the chunk but doesn't null out the pointer in the note table.

```c
void delete_note(int idx) {
    slab_free(notes[idx]);  // freed
    // notes[idx] = NULL;   // missing!
}
```

## Exploitation

1. Allocate two notes (A and B)
2. Free note A
3. Allocate a new note C — gets A's old chunk
4. Use the dangling pointer to A to overwrite C's metadata
5. Leverage the corrupted metadata for arbitrary write
6. Overwrite GOT entry for `free` with `system`
7. Free a note containing `/bin/sh`

## Flag

`picoCTF{h34p_0f_tr0ubl3_2026}`
