# mdblu

**A shared language for humans and AI agents.**

mdblu is an open collection of structured Markdown templates that standardize how humans and AI agents communicate during software development — and an MCP server that makes those templates available to any AI tool, anywhere.

---

## The Problem

AI agents are powerful but context-starved. Every session starts cold. Every handoff loses something. Every team invents their own way to write specs, missions, and handoffs — and none of it is machine-readable.

mdblu fixes this by giving agents a common vocabulary: a set of templates that define *what to produce*, *when to produce it*, and *how to fill it in correctly*.

---

## How It Works

mdblu has two parts that work together:

**Templates** — Structured `.md` files for every phase of development: planning, implementation, handoff, documentation. Each template has explicit instructions for the AI embedded as HTML comments (stripped from final output).

**CLAUDE.md** — A meta-template that tells any AI agent *which* template to use and *when*. It's the decision layer that connects the right document to the right moment.

They are interdependent: adding or updating a template always means updating CLAUDE.md too.

---

## Templates

| Template | When to use |
|---|---|
| `SPEC.md` | Plan a feature end-to-end before touching code |
| `MISSION.md` | Scope a single, concrete agent task |
| `BOOTSTRAP.md` | Decompose a SPEC into an ordered, tagged task list |
| `OPEN-QUESTIONS.md` | Surface blockers that only the developer can resolve |
| `CODING-NOTES.md` | Establish conventions at the start of an implementation session |
| `CLAUDE.md` | Give any AI agent the minimal context it needs for a repo |
| `HANDOFF.md` | Document v1 so a developer can take it forward |
| `MISSION-REPORT.md` | Close out a completed mission |
| `README.md` | Generate a project README |
| `DEV.md` | Generate a developer guide |
| `ARCHITECTURE.md` | Document high-level system architecture |
| `STRUCTURE.md` | Document internal codebase layout |
| `ADR.md` | Record a single architectural decision |
| `PLAYBOOK.md` | Write a repeatable operational procedure |
| `SKILL.md` | Document a reusable AI agent capability |
| `TODO.md` | Simple standalone task list |

All templates live in [`/templates`](templates/) and are open for contribution.

---

## MCP Server

mdblu runs as an MCP server at `https://mdblu.fly.dev/mcp`, so any MCP-compatible AI tool can pull templates on demand.

The server reads templates and `CLAUDE.md` directly from this repository at request time — no redeploy needed when templates change. Responses are cached for 5 minutes.

### Add to Claude Code

```bash
claude mcp add --transport http mdblu https://mdblu.fly.dev/mcp
```

### Add to Claude Desktop

In your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mdblu": {
      "type": "http",
      "url": "https://mdblu.fly.dev/mcp"
    }
  }
}
```

### Add to any MCP-compatible client

Point your client at:

```
https://mdblu.fly.dev/mcp
```

with transport `http`. No auth required.

### Available tools and prompts

| Name | Type | Description |
|---|---|---|
| `list_templates` | tool | List all available templates |
| `get_template` | tool | Fetch a template by name |
| `propose_template_update` | tool | Open a GitHub PR with an improved version of a template |
| `how_to_use` | prompt | Instructs the agent to pick and fill the right template |
| `propose_update` | prompt | Instructs the agent to critically evaluate and propose a template improvement |

---

## Usage

Once connected, ask your AI agent to use a template by name:

> "Write a SPEC for the new notifications system."

> "Create a MISSION for migrating the auth module."

> "Generate a HANDOFF for what we built today."

The agent will select the right template, fill every section from your prompt, strip the HTML comments, and return a clean, structured document.

---

## Contributing

mdblu is intentionally open and collaborative. Templates are plain Markdown — readable, forkable, improvable.

**To contribute a new template or improve an existing one:**

1. Fork the repo
2. Add or edit the template in `/templates`
3. Update `CLAUDE.md` — add or revise the entry that tells agents when and how to use the template
4. Open a PR

The rule: **every template change must be paired with a CLAUDE.md update.** Templates without a corresponding CLAUDE.md entry won't be used correctly by agents.

**AI-assisted contributions** — any agent connected to the MCP server can propose template improvements directly by using the `propose_update` prompt. It will open a PR only if the change clears the bar: durable improvement, structural gap, no task-specific bleed, minimal diff.

---

## Design Principles

- **Fill every section.** No placeholders, no empty cells, no "TBD" without a reason.
- **Remove HTML comments from output.** They're instructions for the model, not content.
- **Tag agent vs. human work.** `[BOT]` for what an AI can do autonomously. `[HUMAN]` for checkpoints that require judgment.
- **Templates and CLAUDE.md are a pair.** One without the other is incomplete.

---

## License

MIT