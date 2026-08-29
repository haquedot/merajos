# Agentic Workflows Hackathon

> Choose a problem worth solving and use agents to create something
> people would genuinely find useful.

## Welcome

Welcome to the **micro1 Agentic Workflows Hackathon**. Choose a problem
worth solving and use agents to create something people would genuinely
find useful. Keep it practical, share what you learn and have fun.

## Your Challenge

Pick a specific and meaningful problem you understand. Use agents to
solve it and show through clear evidence that your solution improves the
way the task is handled today.

Start by explaining who has the problem. Describe the bottleneck they
face and why solving it would be valuable in practice. The goal is to
create something a real person would want to use.

### Keep Four Questions in Mind

1.  **Who has this problem?**
2.  **What bottleneck makes it worth solving?**
3.  **Does the agent solve it well?**
4.  **Can another person reproduce the result?**

------------------------------------------------------------------------

# 02 --- How Agents Can Help

Use whichever agent capabilities help solve the problem well. One
solution may improve when the agent receives better context or better
tools. Another may use memory to carry important information forward.
Verification can catch errors before they reach the user, while
specialized skills can deepen the agent's ability in a particular task.
Some solutions may benefit from orchestration across several agents.

Choose the approach that fits your problem. Judges focus on whether each
design choice improves the solution and helps the agent reach the goal
reliably.

**Purposeful choices matter more than the number of components.**

## Show How the Solution Improved

Create a simple baseline that represents a reasonable basic way to
handle the task before using your solution.

For example:

-   One direct prompt with basic instructions.
-   One general-purpose agent with basic tools.
-   A simple script or template.
-   The manual process people use today.

Keep the comparison fair by giving the baseline and final solution the
same task and evaluation cases.

Explain any meaningful difference in the resources available to each
one.

Use the final baseline comparison to show the size of the overall
improvement. Use the changelog to explain where that improvement came
from. Together, they tell the complete story of your solution.

------------------------------------------------------------------------

# 03 --- Tell the Story With an Improvement Changelog

Create a short changelog that tells the story of how your solution
evolved. Start with the simple baseline and follow the journey through
to the final result. This makes it clear how each meaningful change
contributed.

Add one entry for every important experiment.

Explain what you tried and why you tried it. Then show the result using
the same evaluation method whenever possible and share what you decided
to do next.

Include experiments you later removed and explain what they taught you
about the problem.

> **Important:** The progression below is an example. Replace it with
> the changes your project actually made.

  -------------------------------------------------------------------------------------------
  Stage             What You Tried and   Evidence              Decision / Learning
                    Why                                        
  ----------------- -------------------- --------------------- ------------------------------
  **Baseline**      Started with         `[baseline result]`   Established the starting point
                    `[basic approach]`                         

  **Iteration 1**   Added a skill to     `[new result]`        `[kept, revised or removed]`
                    address `[issue]`                          

  **Iteration 2**   Added verification   `[new result]`        `[kept, revised or removed]`
                    after observing                            
                    `[failure]`                                

  **Iteration 3**   Changed              `[new result]`        `[kept, revised or removed]`
                    orchestration to                           
                    improve `[goal]`                           

  **Final**         Combined the changes `[final result]`      Identified the main
                    that worked                                contribution
  -------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 04 --- How to Evaluate Your Solution

Choose one primary metric that reflects what success means to the user.

For example:

-   For a developer, it might be how many tests pass.
-   An operations team may care more about saving time or reducing cost.
-   A forecasting team may focus on calibration.

Pick the measure that best captures the improvement your solution
promises.

Before running the evaluation, define what a good final result looks
like for the intended user.

Use the same cases for the baseline and final solution, then share the
complete results.

**Ten or more cases is a good target when the task allows it.**

Include one challenging case and explain what it revealed.

## Suggested Evaluation Format

  Metric                    Simple Baseline   Agent Solution   Change
  ------------------------- ----------------- ---------------- ------------
  **Primary outcome**       `[value]`         `[value]`        `[change]`
  **Human time per task**   `[value]`         `[value]`        `[change]`
  **Cost per task**         `[value]`         `[value]`        `[change]`

You run this evaluation yourself. If the format above fits your task
poorly, design your own clear scoring rubric and propose it, so the
judges can use it to assess your workflow.

------------------------------------------------------------------------

# 05 --- How Judging Works

Projects receive a score out of **100 points**. Each row describes what
strong work looks like.

  ------------------------------------------------------------------------
  Criterion                                   Points What Strong Work
                                                     Looks Like
  --------------------- ---------------------------- ---------------------
  **Problem & User                                15 A strong project
  Value**                                            solves a meaningful
                                                     problem for a clearly
                                                     defined user.

  **Agent Solution &                              30 A strong solution
  Engineering**                                      uses agents
                                                     purposefully and is
                                                     technically sound.
                                                     Better context or
                                                     tools may improve one
                                                     project, while
                                                     memory, verification,
                                                     skills or
                                                     orchestration may
                                                     improve another.

  **End to End                                    20 A strong solution
  Quality**                                          completes a realistic
                                                     and self-contained
                                                     execution and
                                                     produces a final
                                                     result the user can
                                                     use, with the finish
                                                     of something a person
                                                     would sign their name
                                                     to rather than an
                                                     obvious AI-generated
                                                     draft.

  **Measured                                      15 A strong report
  Improvement**                                      demonstrates gains
                                                     over a fair baseline
                                                     and uses the
                                                     changelog to connect
                                                     each iteration with
                                                     evidence.

  **Reproducibility**                             15 A reproducible
                                                     project gives another
                                                     person a clear path
                                                     to run the solution
                                                     and baseline and
                                                     reach the main
                                                     result.

  **Hot Take /                                     5 A strong insight
  Insights**                                         turns an observed
                                                     failure mode into a
                                                     practical lesson for
                                                     building more
                                                     reliable agents.

  **Total**                                  **100** 
  ------------------------------------------------------------------------

### Questions to Check Your Project

-   **Problem & User Value:** Who experiences the bottleneck and why
    does solving it matter?
-   **Agent Solution & Engineering:** Which design choices helped the
    agent solve the problem?
-   **End to End Quality:** Would the intended user consider this output
    high quality, or does it read as clearly AI-generated?
-   **Measured Improvement:** Which changes truly improved the outcome?
-   **Reproducibility:** Could another person do it from a clean
    environment?
-   **Hot Take / Insights:** What did you learn and how would it change
    what you build next?

------------------------------------------------------------------------

# 06 --- Ground Rules

These rules are baseline requirements for every eligible project.

1.  You are welcome to build with tools and components you already know.
2.  Make it clear what existed before the competition and what you
    added.
3.  Use every tool and component according to its license and service
    terms.
4.  Keep consequential actions controlled through a sandbox or
    simulation. Add human approval before the action happens.
5.  Make a qualified human reviewer part of any solution that could
    significantly affect someone.
6.  Choose a legal and ethical use case that treats people and their
    data responsibly.
7.  Use information you are allowed to share. Public or synthetic data
    are usually the easiest options. Approved anonymous data also works.
8.  Keep credentials and private information outside the submission.
9.  Connect every claim about your results to the evidence you submit.
10. Give judges enough access to run the project and reproduce the main
    result.

------------------------------------------------------------------------

# 07 --- Final Deliverables

Submit your deliverable with these four items.

## 01. Complete Solution Code and Improvement Changelog

Share the full project and everything required to run it.

Include:

-   The code.
-   The instructions that shape each agent.
-   A README introducing the intended user.
-   The user's current bottleneck.
-   Why solving the problem is valuable.
-   A clearly labeled **Improvement Changelog** using the structure
    described above.
-   Every meaningful iteration as its own entry.
-   The evidence that guided each next decision.
-   The main failure mode.
-   Your hot take.

## 02. Reproduction Guide

Write for someone starting from a clean environment.

Walk them through setup and provide the exact commands for:

-   The solution.
-   The baseline.
-   The evaluation.

Also explain:

-   Which data is required.
-   What output to expect.
-   Relevant versions.
-   Approximate runtime.
-   Approximate cost.

## 03. Solution Video

Submit a video of up to **5 minutes**.

Begin with:

1.  The problem.
2.  The simple baseline.
3.  One realistic execution from start to finish.
4.  The final comparison.
5.  A brief explanation of the changelog.
6.  The change that contributed most.
7.  One experiment you removed.

## 04. Agent Trajectories

Include representative trajectories for every agent you used.

Make each trajectory easy to follow from the agent instructions to the
final result.

Show:

-   What the agent did.
-   How its tools responded.
-   Feedback that shaped its next step.
-   Any retries.
-   Any human checkpoints.

> **GOOD LUCK**

------------------------------------------------------------------------

# Appendix --- Three Examples for Reference

## 08 --- Example 1: Code Analysis --- Is This Repository Actually Good?

### 01. Who Has This Problem?

One possible scenario could be a team considering the purchase of a
private repository and they need to know what the code is worth.

Since they did not build it, there must be a way to reliably sense its
quality before agreeing on a fair price.

### 02. What Bottleneck Makes It Worth Solving?

A README file or working demo reveals little about the quality of the
actual code.

The buyer must:

-   Understand an unfamiliar codebase.
-   Run the build and tests.
-   Inspect the architecture and dependencies.
-   Assess technical debt.
-   Assess maintenance risks.
-   Review relevant evidence in pull requests or open issues.

Reviewers may interpret the same signals differently. Without a
repeatable method, the valuation can depend on an incomplete or
inconsistent judgment.

### 03. Does the Agent Solve It Well?

Potentially, an agent could analyze the repository and give the buyer a
clear quality assessment before they negotiate the price.

The team still has to define what "good" means and how code quality
should influence the valuation.

One way to test it is to have qualified reviewers rank ten approved
codebases with a shared rubric, then give the same codebases and rubric
to the agent and to a simple baseline.

Questions to evaluate:

-   Does the agent come closer to the reviewers' order?
-   Can it explain each position with evidence?

### 04. Can Another Person Reproduce the Result?

Use approved repositories and document:

-   Exact setup.
-   Commands.
-   Tool versions.
-   Expected output.
-   Baseline procedure.
-   Agent procedure.

Tie every score to a file, test result or build output.

A second person starting from a clean environment should be able to run
the workflow on the same codebases and reproduce the assessment and
relative ranking.

------------------------------------------------------------------------

# 09 --- Example 2: Candidate Evaluation --- Should We Hire This Person?

### 01. Who Has This Problem?

Think of recruiters and hiring managers who need to decide whether a
candidate is right for a role.

The evidence they need is spread across:

-   The job description.
-   The target profile.
-   The candidate's CV.
-   Interview records.
-   Completed assessments.

### 02. What Bottleneck Makes It Worth Solving?

If each source is reviewed in isolation, it is easy to miss
contradictions or give one signal too much weight.

A candidate may look perfect at the beginning even when the evidence
does not fully line up.

If there is a suspicion that the candidate cheated, the decision becomes
more sensitive because a warning sign alone is not proof of it.

### 03. Does the Agent Solve It Well?

Potentially, an agent could:

-   Bring the evidence into one review.
-   Connect job requirements to demonstrated skills.
-   Check stated experience against approved sources.
-   Explain discrepancies.

The actual recommendation should make its evidence and uncertainty
visible while leaving the final decision to a qualified reviewer.

### 04. Can Another Person Reproduce the Result?

You can use approved or synthetic candidate cases so the evaluation does
not depend on private information.

Run the baseline and the agent on the same cases, including one
candidate with conflicting signals.

Report every result, including failures, and trace each score or concern
back to its source.

A second reviewer should be able to reproduce the assessment from the
same material without big discrepancies or changes on the resolution.

------------------------------------------------------------------------

# 10 --- Example 3: Podcast Translation --- Can Every Version Still Feel Like the Same Show?

### 01. Who Has This Problem?

Think of podcast creators and teams that are responsible for how a show
sounds in every language.

Basically, each translated episode must remain consistent with the
episodes that came before it.

### 02. What Bottleneck Makes It Worth Solving?

The big problem is that context can span:

-   Hours of audio.
-   Multiple speakers.
-   Earlier episodes.
-   Prior translation choices.

One episode may sound fine in isolation while inconsistencies accumulate
across the series.

Examples include:

-   A speaker's name may be pronounced differently.
-   A recurring phrase may be translated differently from one episode to
    the next.
-   A joke may lose its meaning because an earlier reference was handled
    another way.

Each sentence can be correct while the series as a whole no longer feels
coherent.

### 03. Does the Agent Solve It Well?

A strong solution would translate across episodes and languages while
keeping:

-   Speaker identity.
-   Pronunciation.
-   Recurring terms.
-   Tone.
-   Prior decisions.

Whether it produces transcripts, subtitles or dubbed audio, the result
should preserve the meaning and timing of the original while sounding
natural in the target language.

### 04. Can Another Person Reproduce the Result?

Define the evaluation before running it.

Choose:

-   A fixed set of episodes.
-   Target languages.
-   The same inputs for the baseline and the agent.
-   One case that depends on a recurring detail.

Each translation choice should point back to the source audio or
approved material, such as show notes or a glossary.

Anyone should be able to rerun the evaluation and check the result.
