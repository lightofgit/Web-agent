"use client";
import { useState } from "react";
import styles from "./page.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  name: string; ticker: string; description: string;
  category: string; targetAudience: string; vibeKeywords: string;
  budget: number;
}

type Tab = "generate" | "plan" | "kol" | "sentiment";

const EMPTY_PROJECT: Project = {
  name: "", ticker: "", description: "", category: "memecoin",
  targetAudience: "solana degens, memecoin traders",
  vibeKeywords: "degen, based, WAGMI, LFG", budget: 100,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [project, setProject]     = useState<Project>(EMPTY_PROJECT);
  const [tab, setTab]             = useState<Tab>("generate");
  const [result, setResult]       = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [configured, setConfigured] = useState(false);

  // Generate tab state
  const [platform, setPlatform]       = useState("twitter");
  const [contentType, setContentType] = useState("thread");
  const [phase, setPhase]             = useState("pre-launch");
  const [context, setContext]         = useState("");

  // Sentiment tab state
  const [mentions, setMentions] = useState("just found this gem, going to moon 🚀\nteam looks legit, in.\ntokenomics are solid, bullish af\nwen launch?? been waiting");

  const projectReady = project.name && project.ticker && project.description;

  async function call(endpoint: string, body: object) {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Unknown error");
      setResult(json.data);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  function runGenerate() {
    call("generate", {
      project: { ...project, targetAudience: project.targetAudience.split(",").map(s => s.trim()), vibeKeywords: project.vibeKeywords.split(",").map(s => s.trim()) },
      platform, contentType, phase, context,
    });
  }

  function runPlan() {
    call("plan", {
      project: { ...project, targetAudience: project.targetAudience.split(",").map(s => s.trim()) },
      phase, days: 14,
    });
  }

  function runKol() {
    call("kol", {
      project: { ...project, targetAudience: project.targetAudience.split(",").map(s => s.trim()) },
      budgetSol: project.budget * 0.4,
    });
  }

  function runSentiment() {
    call("sentiment", {
      project,
      mentions: mentions.split("\n").filter(Boolean),
    });
  }

  function runTab() {
    if (!projectReady) { setError("Fill in project name, ticker, and description first."); return; }
    if (tab === "generate") runGenerate();
    else if (tab === "plan") runPlan();
    else if (tab === "kol") runKol();
    else runSentiment();
  }

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔥</span>
          <span>Hype<span className={styles.accent}>Agent</span></span>
        </div>
        <div className={styles.badge}>Solana Launch AI</div>
      </header>

      <main className={styles.main}>
        {/* Project Config */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.step}>01</span> Project Config
          </h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Project name</label>
              <input placeholder="HypeCat" value={project.name}
                onChange={e => setProject(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label>Ticker</label>
              <input placeholder="HCAT" value={project.ticker}
                onChange={e => setProject(p => ({ ...p, ticker: e.target.value.toUpperCase() }))} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea placeholder="What is this project? What makes it unique?"
              value={project.description}
              onChange={e => setProject(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className={styles.grid3}>
            <div className={styles.field}>
              <label>Category</label>
              <select value={project.category} onChange={e => setProject(p => ({ ...p, category: e.target.value }))}>
                <option value="memecoin">Memecoin</option>
                <option value="defi">DeFi</option>
                <option value="nft">NFT</option>
                <option value="gamefi">GameFi</option>
                <option value="dao">DAO</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Budget (SOL)</label>
              <input type="number" min={1} value={project.budget}
                onChange={e => setProject(p => ({ ...p, budget: Number(e.target.value) }))} />
            </div>
            <div className={styles.field}>
              <label>Launch phase</label>
              <select value={phase} onChange={e => setPhase(e.target.value)}>
                <option value="pre-launch">Pre-launch</option>
                <option value="launch">Launch</option>
                <option value="post-launch">Post-launch</option>
                <option value="growth">Growth</option>
              </select>
            </div>
          </div>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Target audience <span className={styles.hint}>(comma separated)</span></label>
              <input placeholder="solana degens, memecoin traders"
                value={project.targetAudience}
                onChange={e => setProject(p => ({ ...p, targetAudience: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label>Vibe keywords <span className={styles.hint}>(comma separated)</span></label>
              <input placeholder="degen, based, WAGMI, LFG"
                value={project.vibeKeywords}
                onChange={e => setProject(p => ({ ...p, vibeKeywords: e.target.value }))} />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className={styles.card}>
          <div className={styles.tabs}>
            {(["generate","plan","kol","sentiment"] as Tab[]).map(t => (
              <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
                onClick={() => { setTab(t); setResult(null); setError(""); }}>
                {t === "generate" && "✍️ Content"}
                {t === "plan" && "📅 14-Day Plan"}
                {t === "kol" && "🤝 KOL Outreach"}
                {t === "sentiment" && "📊 Sentiment"}
              </button>
            ))}
          </div>

          {/* Generate options */}
          {tab === "generate" && (
            <div className={styles.tabContent}>
              <div className={styles.grid3}>
                <div className={styles.field}>
                  <label>Platform</label>
                  <select value={platform} onChange={e => setPlatform(e.target.value)}>
                    <option value="twitter">Twitter/X</option>
                    <option value="telegram">Telegram</option>
                    <option value="discord">Discord</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Content type</label>
                  <select value={contentType} onChange={e => setContentType(e.target.value)}>
                    <option value="thread">Thread</option>
                    <option value="announcement">Announcement</option>
                    <option value="alpha_leak">Alpha Leak</option>
                    <option value="countdown">Countdown</option>
                    <option value="ama">AMA</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Extra context <span className={styles.hint}>(optional)</span></label>
                  <input placeholder="e.g. partnership announcement tomorrow"
                    value={context} onChange={e => setContext(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Sentiment options */}
          {tab === "sentiment" && (
            <div className={styles.tabContent}>
              <div className={styles.field}>
                <label>Paste mentions <span className={styles.hint}>(one per line)</span></label>
                <textarea rows={5} value={mentions} onChange={e => setMentions(e.target.value)} />
              </div>
            </div>
          )}

          {/* Run button */}
          <button className={styles.runBtn} onClick={runTab} disabled={loading}>
            {loading ? <><span className={styles.spinner} /> Generating...</> : (
              <>
                {tab === "generate" && "⚡ Generate Content"}
                {tab === "plan" && "⚡ Build Content Plan"}
                {tab === "kol" && "⚡ Find & Message KOLs"}
                {tab === "sentiment" && "⚡ Analyze Sentiment"}
              </>
            )}
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className={styles.error}>⚠️ {error}</div>
        )}

        {/* Results */}
        {result && !loading && (
          <section className={`${styles.card} ${styles.result} fade-up`}>
            <h2 className={styles.cardTitle}>
              <span className={styles.step}>✓</span> Result
            </h2>

            {/* Content result */}
            {tab === "generate" && result.text && (
              <div>
                {result.threadParts?.length > 1 ? (
                  <div>
                    <p className={styles.label}>Thread ({result.threadParts.length} tweets)</p>
                    {result.threadParts.map((tweet: string, i: number) => (
                      <div key={i} className={styles.tweet}>
                        <span className={styles.tweetNum}>{i + 1}/{result.threadParts.length}</span>
                        <p>{tweet}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.tweet}><p>{result.text}</p></div>
                )}
                {result.hashtags?.length > 0 && (
                  <div className={styles.tags}>
                    {result.hashtags.map((h: string) => (
                      <span key={h} className={styles.tag}>#{h}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Plan result */}
            {tab === "plan" && result.timeline && (
              <div>
                {result.strategy && <p className={styles.strategy}>{result.strategy}</p>}
                {result.warnings?.map((w: string, i: number) => (
                  <div key={i} className={styles.warning}>⚠️ {w}</div>
                ))}
                <div className={styles.timeline}>
                  {result.timeline.map((item: any, i: number) => (
                    <div key={i} className={styles.timelineItem}>
                      <div className={styles.timelineDay}>Day {item.dayOffset}</div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineMeta}>
                          <span className={styles.platform}>{item.platform}</span>
                          <span className={styles.contentType}>{item.contentType}</span>
                        </div>
                        <p>{item.description}</p>
                        <p className={styles.goal}>🎯 {item.goal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KOL result */}
            {tab === "kol" && result.kols && (
              <div>
                {result.kols.map((kol: any, i: number) => (
                  <div key={i} className={styles.kolCard}>
                    <div className={styles.kolHeader}>
                      <div>
                        <span className={styles.kolHandle}>@{kol.handle}</span>
                        <span className={styles.kolTier}>{kol.tier}</span>
                      </div>
                      <div className={styles.kolStats}>
                        <span>{(kol.followers).toLocaleString()} followers</span>
                        <span>{kol.engagement}% eng.</span>
                        <span className={styles.offer}>{kol.offerSol} SOL</span>
                      </div>
                    </div>
                    <div className={styles.kolNiche}>{kol.niche.join(" · ")}</div>
                    {kol.message && (
                      <div className={styles.dm}>
                        <p className={styles.dmLabel}>DM Draft</p>
                        <p className={styles.dmText}>{kol.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sentiment result */}
            {tab === "sentiment" && result.overall && (
              <div>
                <div className={styles.sentimentHeader}>
                  <span className={`${styles.sentimentBadge} ${styles[result.overall]}`}>
                    {result.overall === "bullish" ? "🟢" : result.overall === "bearish" ? "🔴" : "🟡"} {result.overall.toUpperCase()}
                  </span>
                  <span className={styles.score}>Score: {result.score?.toFixed(2)}</span>
                </div>
                <p className={styles.summary}>{result.summary}</p>
                {result.actionItems?.length > 0 && (
                  <div className={styles.actions}>
                    <p className={styles.label}>Action items</p>
                    {result.actionItems.map((a: string, i: number) => (
                      <div key={i} className={styles.actionItem}>→ {a}</div>
                    ))}
                  </div>
                )}
                {result.keywords?.length > 0 && (
                  <div className={styles.keywords}>
                    {result.keywords.map((k: any) => (
                      <span key={k.word} className={styles.keyword}
                        style={{ opacity: 0.5 + k.sentiment * 0.5 }}>
                        {k.word} ×{k.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        Built with Hype Agent · Powered by Gemini AI · Solana 🔥
      </footer>
    </div>
  );
}
