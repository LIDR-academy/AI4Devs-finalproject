# Publishing Guide - How to Get Your Skills on skills.sh

## Current Status ✅

Your skills are **fully functional** and installable via:

```bash
npx skills add javalenciacai/QASkills --all --full-depth
```

## Getting Indexed by skills.sh

### Automatic Indexing
skills.sh automatically crawls public GitHub repositories for skills. However, this process is **not instantaneous**.

### Factors that Help Indexing:
1. **Repository Metrics**
   - GitHub stars ⭐
   - Forks and contributions
   - Active maintenance (recent commits)

2. **Usage Metrics**
   - Direct installations via `npx skills add`
   - Anonymous telemetry from skills CLI
   - Community engagement

3. **Quality Signals**
   - Complete README with examples
   - Proper documentation in each SKILL.md
   - GitHub topics/tags
   - License file
   - Release tags

### Timeline
- **Immediate**: Direct installation works
- **Days to weeks**: Possible skills.sh indexing
- **Ongoing**: Ranking improves with usage

## Promotion Strategies

### 1. GitHub Optimization
```bash
# Add descriptive topics to your repository
gh repo edit --add-topic qa-testing
gh repo edit --add-topic test-automation
gh repo edit --add-topic istqb
gh repo edit --add-topic ai-agents
gh repo edit --add-topic agent-skills
```

### 2. Share with Community
- Post on Twitter/X mentioning @vercel and #AgentSkills
- Share in QA/Testing communities:
  - r/QualityAssurance
  - Ministry of Testing community
  - LinkedIn QA groups
- Write a blog post about your skills

### 3. Encourage Usage
- Share installation instructions with your team
- Create video tutorials
- Add usage examples to README
- Respond to issues and PRs promptly

### 4. Monitor Progress
```bash
# Search for your skills periodically
npx skills find javalenciacai

# Check if they appear in search results
npx skills find test-design-istqb
```

## Alternative Distribution

While waiting for skills.sh indexing, promote direct installation:

```bash
# Your current working installation method
npx skills add javalenciacai/QASkills --all --full-depth
```

## Resources

- **Your Repository**: https://github.com/javalenciacai/QASkills
- **skills.sh Docs**: https://skills.sh/docs
- **Skills Registry**: https://skills.sh/

## Contact

If your skills don't appear after several weeks of active use, you might:
- Check Vercel's community forums
- Open an issue on the skills CLI repository
- Reach out via Vercel's official channels

Remember: **Your skills are already usable and valuable** even before appearing on skills.sh!
