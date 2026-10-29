---
title: Find the bug in this binary search
locale: en
type: spot-the-bug
category: algorithms
stack: [java]
seniority: [jr, ssr]
fundamentals: true
language: java
code: |
  public static int binarySearch(int[] arr, int target) {
      int low = 0;
      int high = arr.length;
      while (low <= high) {
          int mid = low + (high - low) / 2;
          if (arr[mid] == target) return mid;
          if (arr[mid] < target) low = mid + 1;
          else high = mid - 1;
      }
      return -1;
  }
bugLine: 3
---

`high` starts at `arr.length`, which is one past the last valid index.

With the inclusive loop condition `low <= high`, `mid` can reach `arr.length`, so searching for a value larger than every element throws `ArrayIndexOutOfBoundsException`.

Fix: initialize `high = arr.length - 1`. The bounds (`low <= high`, `high = mid - 1`) must consistently describe a closed interval `[low, high]`.
