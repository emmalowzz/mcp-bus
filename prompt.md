# Project Prompts Log

This document records all user prompts submitted during the development of the **TransitPulse** application.

---

### Prompt 1: Initial App Creation & Design Specification

```markdown
Build me an app with screens that look like this. You can hotlink images from the html
```

*(Accompanied by the TransitPulse design token specification: brand style, color system, typography with Plus Jakarta Sans and Inter tabular-nums, dual-surface split-screen layout, and component guidelines for transit shields, mechanical arrival countdowns, and real-time telemetry).*

---

### Prompt 2: Session Recovery

```markdown
There was an unexpected error. Finish what you were doing.
```

---

### Prompt 3: Git Repository Initialization & Remote Push

```markdown
git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/emmalowzz/mcp-bus.git
```

*Raw input (token masked for security):*
```
git push https://ghp_************************************
@https://github.com/emmalowzz/mcp-bus.git
```

---

### Prompt 4: API Directory & Singapore LTA Bus DataMall Integration

```markdown
1) Create an /api folder under the project main to store all the apis
2) Create a /api/health.js to monitor if the APIs are working
3) Integrate the LTA bus information api endpoint  GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
Header:  AccountKey:

# BusStopCode is the only required parameter.
# Add &ServiceNo=7 to ask about one service only.
# Refreshes every 20 seconds. JSON comes back by default.
I will add the LTA_ACCOUNT_KEY in vercel environment variables later
```

---

### Prompt 5: Documentation

```markdown
create a prompt.md containing all my prompts located at project main
```
