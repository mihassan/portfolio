---
title: "Haskell on Cloud Run"
description: "A completed demonstration of packaging and deploying a Haskell web service on Cloud Run."
eyebrow: "Haskell · Cloud deployment"
status: "Completed demonstration"
links:
  - label: "Browse the Cloud Run demo"
    url: "https://github.com/mihassan/cloud-run-hs-demo"
  - label: "Browse the API backend"
    url: "https://github.com/mihassan/api-backend-hs"
stack: ["Haskell", "Containers", "Google Cloud Run"]
image: "images/portfolio/projects/haskell-cloud-run.svg"
image_alt: ""
featured: false
listed: true
weight: 7
draft: false
---

**Haskell on Cloud Run** brings two related repositories into one deployment story: a minimal Cloud Run demonstration and a larger Haskell API backend.

The goal was to establish that a Haskell web service could be packaged and deployed successfully on a managed, container-based platform.

## Why Cloud Run

Cloud Run was attractive for experimental infrastructure because it could scale to zero when unused while allowing a maximum instance count to control cost and resource exposure. That made it a practical home for a backend that was educational rather than continuously required.

The deployment succeeded. It is not currently running, and this page does not present it as a live service.

Together, the repositories form a completed demonstration of moving a Haskell application from local code to a controlled cloud deployment.
