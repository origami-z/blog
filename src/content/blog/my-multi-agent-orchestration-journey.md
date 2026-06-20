---
title: "My Multi-agent Orchestration Journey"
description: "Reflections on building a 40k lines of code agent orchestration tool - learnings on deterministic workflows, cost optimization, and multi-repo delivery."
pubDate: 2026-06-20
tags: ["ai", "agents", "orchestration", "automation"]
draft: false
---

I want to take some time to reflect on my journey building my "agentic army" as JKD kindly named it, a 40k lines of code agent orchestration tool just for me. It runs deterministic agentic workflows, which I use to create PRs from Jira tickets for me in the background.

TLDR;

Ask your agent to summarize this blog in X number of words.

## Learnings

### #0 Model intelligence should not be the excuse

This is not part of the blog until Fable 5 release. I thought this deserves the special callout being point 0. Model intelligence has indeed improved in the past year but definitely not like primary pupils vs PhD students. If the problem can't be one-shot by the current front-tier model, it likely won't be automagically solved by the next generation. Instead, work on task planning, prompt, context, orchestration and many more items around the model, don't be fooled by model intelligence being the achievement.

### #1 Knowing the unknown

When I was fresh out of college, I called myself full stack engineer because I know how to build a calculator iOS app to different forms of database normalisation. But now, I don't trust myself developing any software apart from frontend code, because I know a lot more that I don't know before and not confident that I can produce professional grade software that will last its lifespan needed.

This is proved again after spending many hours and token dollars debugging the AI system, that I'm not at all confident to give my orchestration setup to anyone else to use. Software system seems obvious when other people talked about it on YouTube or blog post, but working on a production grade system is not simple. It may be different if it's someone's full-time job to study and improve, but unfortunately it's not my situation.

### #2 Maintaining software is the real cost

> Building with AI is simple and fast, maintaining an app is 10x harder, maintaining a platform is 100x harder. Don't be fooled by the speed of code output.

There is a reason our job title is engineer not coder, writing code could be achieved now by a ten-year-old but they will have no idea to keep it running over time. A few meaningful questions I'd ask myself by now:

- Is there long term commitment to maintain the code and keep them running? Creating net new code is always simple but may become garbage and debt for the business in the long run if not being maintained correctly.
- Have you *actually* budgeted amount of maintenance into your day to day workload? Your team's net new feature delivery throughput should be decreasing over time to compensate amount of integration and maintenance, otherwise you're just lying to yourself about generating business value with "new" features.

### #3 Automatable and Verifiable

To benefit from AI, we need "automatable" and "verifiable" systems.

I'm lucky enough that all the system I've been connecting together is already automatable pre-AI era, mostly through personal access token. What if it's our internal system? I have no idea (yet) how to automate any system with Entra / VIAM.

"Vertically" verifiable becomes more important. We need to build minimal feature but end to end workflow so that agent can run verification for us. In comparison, a lot of traditional way of building software is by implementing layer by layer, in a "horizontal" fashion, which makes agents much harder to do verification with much slower full feedback loop.

### #4 Say more yes not later

Biggest change to my day to day, instead of saying "I'll come back to xyz when I have time", I create Jira issue, curate them later then send to agents to work. Smaller tasks like creating documentation is now a no brainer to do, which saves me to think about wording, the right structure and page. For larger work, I will leverage agent to brainstorm and align with me first, then create sub-issues with "blocks" links to ask agent to work in the correct sequence.

### #5 Value / ROI

I'm spending token to build the system and more tokens to run the system, did I create enough value for a good return on investment? For me, the answer is definitely yes. For many years, my output has always been capped by how much code I can type. My work surface areas have been expanded much more, so AI is helping me navigating much bigger context switch problems.

## My journey

There are a lot of stories online talking about companies achieving incredible productivity gains by introducing AI, like Stripe's end-to-end coding agent, Cloudflare's AI code review at scale. After spending many hours watching my chat dialog to come up with a result, I wanted to build some tool to help me parallelize my workflows so I can get more done.

My first goal was fairly simple on paper -- I want to create a workflow that could help me to create a PR in BitBucket for one of the npm libraries, then test it in another application repo using the npm package published in the PR to validate the change.

## Breaking it down

The goal has translated into a sequence of steps:

1. Work on some code update in repo 1
2. Review code and iterate
3. Create a PR, watch CI
4. Read npm package version number published from PR build
5. Use the new package version in repo 2, with code changes if necessary
6. Create the second PR, watch CI
7. Notify me to review both PRs on Teams
8. Merge first PR, wait for official npm package version
9. Update second PR with new version, and merge

For most of the steps, it would be able to loop back to implementation step to fix errors to save debug time, like resolving CI errors, updating library code with consumer's feedback.

So you may ask, surely an agent skill of steps mentioned above would do the job? Maybe yes, if you're lucky. Even if each step has 99% success rate, overall success rate would drop to only 90% after 10 steps. This is not acceptable for parallel workflows running in the background.

## The problems

- External system integration
- Deterministic workflow, AI is a slot machine, 10 CI one-liner PR change ended up with many different interpretation
- Context, long running tasks, "self-affirmation" problem
- Multi repo delivery, different repo, different branch name, optimization around git worktree
- Reusable workflow engine, writing code v.s. team support
- Cost optimization, subagent
- Recoverability, recover from system
- Damage control, dedicated tools, read-only Confluence access
- Observability, debug, audit trail
- Cross AI agent tools, expose local MCP to VS Code
- Too many skills problem
- Infrastructure scaling, Jira didn't go down
- Not useful features should be cut, e.g., web UI
- Model fallback and custom provider

### External System integration

My workflow needs to talk to Jira, BitBucket, Jenkins, Teams. We don't have all the necessary MCP servers available to us, to integrate with these systems. Pi doesn't support MCP out-of-the-box anyway, but it allows custom extensions to expose custom tools on top of built-in tools like read, bash, etc.

Fortunately, Atlassian products give us Personal Access Token to make REST API calls. My first step was to ask the AI to create individual CLI tools to call REST APIs, by giving it OpenAPI schema file found online. Each system connection becomes a Pi extension, which reads my personal access token from environment, making the API call when needed. So I can ask questions like:

> Give me details of Jira issue DEV-25

> What's the latest build status of this PR?

For Teams notification, the easiest way I found is by creating a webhook using Teams workflow, with Microsoft Power Automate behind the scene and a few tweaks to make it sending message to myself.

My Jenkins integration was using similar approach with access token, as of today, you could also enable first-party MCP support from Jenkins.

### Non-deterministic Slot machine

AI is a smart slot machine, with very convincing success rate, which may cause dilution of its intelligence. But sooner or later, just like a human, it will make mistake. Asking AI to follow long step-by-step instructions likely will result in disappointment when random steps are skipped momentarily during different runs.

I need an assembly line with deterministic workflow, implemented using state machine. Each state determines possible next state, custom agent and prompts to use, something like this:

```json
"verify_change": {
    "title": "Verify Change",
    "agent": "symphony-dev-delivery-verifier",
    "next": [
      "feedback_triage",
      "prepare_pr",
      "human_intervention"
    ],
    "instructions": "Review the current implementation against the Jira issue, saved plan, and the repository state in the workspace. If the implementation is incomplete, risky, or missing validation, persist concise reviewFeedback and a structured open feedback.items entry with owner 'single', sourceState 'verify_change', targetState 'implement_change', evidence, and transition to feedback_triage. If the implementation is solid, mark any matching review feedback addressed, capture a short verificationSummary, and transition to prepare_pr."
}
```

### Long Context and Self-affirmation

Each stage of the workflow is spawning new sub-agent to help with context control with custom tools defined in their custom agent definition. So far it has been fixed one agent spawn for each step, given I control the size of the work for each Jira ticket. In the future, I can imagine making dynamic launch of agents to work on larger size of work if needed.

Front-tier models are smart that if you ask it to review its own work, it will likely come back with "looking good" answer just like a human, so I'm using a different model to review code. I used a standard template of the review comments to be passed between stages/agents, to avoid model language ambiguity.

### Multi-repo delivery

I need to find a way for agent to know which repo(s) to work on. For a Jira working on a single repo, I used Jira Component field as the primary source, with a local Jira component name to repo address mapping config file. For any one-off repo work, I add the repo address to the Jira description, which is usually enough.

To save some time, agent will clone the repo in a single central location, then create git worktree alongside of it, to enable parallel work in a single repo. This is also the first time I learnt that you can't checkout the same branch across multiple worktrees, so to avoid disrupting my manual work, I chose to have the agent clone a second time away from my daily work directory.

I also have to cater for different default branch names, for most library repos, I use `develop` as the default branch to work from and release as npm `next` tag (to avoid consumers accidentally use work-in-progress features), and then merge to `main` for `latest` tag release. For agent to work across repos, I hard coded a few preferred branch names before branching out from remote default branch.

For multi-repo work, e.g., React library update + consumer testing, the Jira description needs to be more explicit about which repo to test. I used the Jira component field for the library repo, and added explicit repo URL for the consumer, which means I can in theory test a single change in many different apps.

I also have to use AutoResearch to improve my agent prompt, to help fix the agent classify whether the Jira is about single or multi repo work. This is the first time I found it being quite magical that small tweak of prompt wording would result in different success rate. This doubles down the importance of "verifiable" system.

### Reusable workflow engine

Given my workflow is mostly built on top of state machine with agents, I can also make a new workflow definition file for different type of work. I made some adjustment to also include initial JQL to pull issues from Jira into the workflow definition.

For my daily coding work, I filter DEV project with issues or sub-tasks assigned to me, and also a label "agent" added to the task. This acts as the first line of filtering which I triage first, to make sure task descriptions are curated and broken down before handing over to agents in the background.

I also tried to help support triage, where it will look at APPSUPPORT queue without any assignees, then run through a few steps like looking at dev documentation, recent duplicate / related issues and potential category, so it will add an internal only comment to the ticket, to help to get to any existing answers more quickly.

### Cost optimization

Not every single step of each task needs most advanced AI model. Although we can manually change model and thinking levels in any chat interface, it often becomes an extra hustle to tweak the settings between tasks.

For my workflow, I got the opportunity to optimize cost by choosing different models. For example, my cleanup step at the end of the workflow involves tasks like moving Jira to done status and clean up git worktree, so I can use `gpt-mini-current` from LLM Proxy with low thinking level.

Looking across typical daily usage, I would use more than double the amount of token with GPT mini model on simple steps than GPT model on complex steps, resulting less than two-thirds of the cost on mini usage.

### Recoverability

Like any software, it could break due to many different reasons like agent harness error, network failure, machine / terminal failure, which I encountered many times already in the past two months.

The main orchestrator spawns child Pi agent sessions in JSON Event Stream Mode, which pipes to `jsonl` file for each session log. When failure happens, another session can be created to resume work as much as possible. This also creates natural separation between different work sessions to avoid cascading failure across workflows.

### Damage Control

Agents are now smart enough to find alternative solutions to achieve a goal. It sometimes can be dangerous especially when involving external systems, for example you would have heard about production database being dropped by agent by mistake.

The Atlassian products we use don't give us fine access control when generating access token, which means it could potentially cause large adverse effect by sharing the same access level with me. I tried to remove `bash` tool from many of my sub-agent capability to restrict its access to my system as well as external system. By also exposing different REST API calls from CLI to my Pi agent as custom tools, I manage to provide read-only access to Confluence when needed.

Another type of damage control is by avoiding infinite loop, therefore in agentic world infinite token cost. I added maximum number of transitions a workflow can perform, before transitioning into "human intervention" step so I can look into the problem manually, with a convenient shortcut to open VS Code in the specific git worktree folder.

### Observability and Debugging

Given the nature of agent uncertainty, there are many bugs caused by agent handover. Thanks to the full conversation logs across sub-agent sessions, whenever I encountered something wrong, I would go to another terminal tab to ask the agent to debug.

I have to incorporate tracing ID type of capability in the event logs, so later I can debug what actually happened. This becomes a repeatable process when I incorporate prompt template `/debug:session [UUID]` so I can easily invoke it.

### Cross Agent Tools

Pi agent is quite different in many ways, I still want to expose some of the capabilities it has to my chat window in VS Code when working on a project, which has better UX features like file and symbol reference.

Because most of the external system integration was created in different CLIs, I can easily reuse them via `@modelcontextprotocol/sdk`, to expose them as MCP tools in a local stdio node script, even with different access control like read-only or write.

```json
"servers": {
    "pi-automation-mcp": {
      "type": "stdio",
      "command": "node",
      "args": [
        "~/code/pi-automation/mcp/dist/mcp/src/index.js",
        "--stdio",
        "--profile",
        "write"
      ]
    }
}
```

### Features should be cut

When building a product, it's inevitably to build more and more features. For me, the app has its own custom command palette because I sometimes forget which shortcut key I should press for certain features I rarely use.

One of them is a web UI representing the same monitoring capability to my TUI. I built because I thought it's a cool idea to have a nice UI and some of the other open-source tools have it. Unfortunately I only used it once, and soon got lost in many tabs opened in my browser.

I should have got back and removed the code to reduce complexity, which reminded me the same problem as many production apps. If we have good user analytics, we should be more than proud to tell the business that certain feature is rarely used and we should remove them given maintaining code has a cost and is rarely talked about.

## Closing

My time now is bounded by two different type of things -- writing good quality Jira description and reviewing code written by the AI. I'm still finding new ways to improve the verification step, e.g., I want a PR with visual proof (e.g., screenshot or video with annotation) for the work it carries out, not just long text.

Without a custom app, VS Code agents window (or similar) gives me the hope that I will be able to do a lot of the workflows without custom setup, which supports out-of-box parallel git worktree and all other standard agent features in a nice UI interface.

Sorry, I'm not going to share the repo code because it's not production ready for others to use, and I know I don't have the time to maintain it by offering support and answering questions. So I hope to use this blog post to share some of my learnings and inspire you with some new ideas. I'm always happy to talk about these and brainstorm, so feel free to reach out and have a coffee chat.

---

## References

There are tons of useful links and materials out there:

- OpenAI's Symphony spec: https://github.com/openai/symphony
- Hermes agent with built-in learning: https://hermes-agent.nousresearch.com/
