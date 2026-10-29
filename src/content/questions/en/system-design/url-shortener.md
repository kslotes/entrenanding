---
title: Design a URL shortener
locale: en
type: system-design
category: system-design
stack: []
seniority: [ssr, sr]
fundamentals: false
evidence:
  - type: interview-report
    url: https://github.com/CreatCodeBuild/system-design-interview-lies
  - type: interview-report
    url: https://www.hellointerview.com/community/questions/url-shortener-design/cm5svnaco01dqxszbok7e1lk1
steps:
  - Clarify requirements, such as custom aliases, expiration, and analytics.
  - Estimate scale, including the read/write ratio, requests per second, and storage over several years.
  - Define the API for creating a short link and for redirecting.
  - Choose how to generate short codes and how to avoid collisions.
  - Design the data model and choose the storage.
  - Add caching and scale the read path.
  - Discuss bottlenecks, failure modes, and trade-offs.
rubric:
  - States functional and non-functional requirements before designing.
  - Recognizes the workload is read-heavy and sizes it with rough numbers.
  - Proposes a collision-free code generation strategy and explains its trade-offs.
  - Chooses between 301 and 302 redirects with a reason.
  - Uses a cache in front of the database for hot links.
  - Identifies single points of failure and how to remove them.
---

A solid answer walks from requirements to a simple design, then scales it.

- **API:** `POST /urls` returns a short code; `GET /{code}` redirects. Use `302` if you need click analytics, `301` if you want browsers to cache the redirect.
- **Code generation:** encode a unique numeric ID (from a counter or pre-allocated ID ranges per server) in base62. Seven characters give about 3.5 trillion codes. Hashing the long URL is simpler but needs collision handling.
- **Storage:** a key-value or wide-column store keyed by code fits the access pattern; the mapping rarely changes.
- **Read path:** reads far outnumber writes, so put a cache (for example Redis) in front of the store and serve redirects from the nearest region.
- **Trade-offs:** a central counter is a bottleneck and a single point of failure; ID ranges avoid it at the cost of non-sequential codes.
