# CRITICAL: DIRECTED PAIRS HANDLING

## Fundamental Rule

**NEVER MIX THE TWO DIRECTIONS!**

\`\`\`
Team A (H) vs Team B (A) ≠ Team B (H) vs Team A (A)
\`\`\`

---

## Why Is This Critical?

### 1. Home Field Advantage

The home team has a **statistically measurable advantage**:
- 10-20% higher win probability
- More goals scored on average
- Fewer goals conceded
- Better form indicators

### 2. Different Pattern DNA

**Example: London Cannons vs Wolverhampton**

| Match Type | Pattern 1 | Pattern 2 | Pattern 3 | Dominant
|-----|-----|-----|-----|-----
| London Cannons (H) vs Wolverhampton (A) | 70% | 20% | 10% | **Pattern 1**
| Wolverhampton (H) vs London Cannons (A) | 45% | 25% | 30% | **Pattern 1** (but weaker)

**Conclusion**: 
- Pattern 1 is dominant in both cases
- BUT London Cannons' home advantage gives 25% higher win probability!
- **Two different statistical profiles!**

### 3. Database Structure

**Correct approach**:
\`\`\`
London_Cannons_HOME_vs_Wolverhampton_AWAY → 150 historical matches
Wolverhampton_HOME_vs_London_Cannons_AWAY → 150 historical matches

Total: 300 matches in two separate categories
\`\`\`

**Incorrect approach** (FORBIDDEN!):
\`\`\`
London_Cannons_vs_Wolverhampton → 300 matches mixed together
(Cannot distinguish who was home!)
\`\`\`

---

## Practical Examples

### Example 1: Manchester Blue vs Liverpool

**Historical data**:

**Manchester Blue (H) vs Liverpool (A)**:
- 100 matches
- 65 Pattern 1 (Manchester Blue win)
- 20 Pattern 2 (Draw)
- 15 Pattern 3 (Liverpool win)
- **Pattern 1: 65%**

**Liverpool (H) vs Manchester Blue (A)**:
- 100 matches
- 55 Pattern 1 (Liverpool win)
- 25 Pattern 2 (Draw)
- 20 Pattern 3 (Manchester Blue win)
- **Pattern 1: 55%**

**Analysis**:
- Both teams are stronger at home
- Manchester Blue home advantage: 65% vs 20% (loses away)
- Liverpool home advantage: 55% vs 15% (loses away)
- **10% difference due to home field!**

### Example 2: Chelsea vs London Cannons

**Chelsea (H) vs London Cannons (A)**:
- Pattern 1: 48%
- Pattern 2: 32%
- Pattern 3: 20%
- **Balanced, but Chelsea has advantage**

**London Cannons (H) vs Chelsea (A)**:
- Pattern 1: 52%
- Pattern 2: 28%
- Pattern 3: 20%
- **Balanced, but London Cannons has advantage**

**Analysis**:
- Very balanced matchup
- Both teams only have slight advantage at home
- **Home field effect: only 4% difference**
- Harder to predict!

---

## Implementation Checklist

### Data Collection

- [ ] Record home and away team for every match
- [ ] Generate unique identifier: `{HOME}_HOME_vs_{AWAY}_AWAY`
- [ ] Never use symmetric identifier: `{TEAM_A}_vs_{TEAM_B}`
- [ ] Store reverse pair separately: `{AWAY}_HOME_vs_{HOME}_AWAY`

### Database Structure

- [ ] Separate table/record for each directed pair
- [ ] `home_team` and `away_team` fields are mandatory
- [ ] `reverse_pair_id` reference to the reverse pair
- [ ] Index for fast search: `(home_team, away_team)`

### Analysis Algorithm

- [ ] Always check home/away role
- [ ] Don't average matches with different directions
- [ ] Use separate model for each directed pair
- [ ] Validate directionality in every query

### Testing

- [ ] Verify: London Cannons (H) vs Wolverhampton (A) ≠ Wolverhampton (H) vs London Cannons (A)
- [ ] Test with reverse pairs
- [ ] Validate home field advantage effect
- [ ] Compare statistics of both directions

---

## Common Mistakes (TO AVOID!)

### Mistake 1: Symmetric Pairing

**WRONG**:
\`\`\`python
pair_id = f"{sorted([team_a, team_b])[0]}_vs_{sorted([team_a, team_b])[1]}"
# This always gives the same identifier, regardless of home/away role!
\`\`\`

**CORRECT**:
\`\`\`python
pair_id = f"{home_team}_HOME_vs_{away_team}_AWAY"
# This clearly distinguishes directions!
\`\`\`

### Mistake 2: Mixing Data

**WRONG**:
\`\`\`python
all_matches = get_matches(team_a, team_b)  # Both directions together
avg_pattern_1 = sum(m.pattern_1 for m in all_matches) / len(all_matches)
\`\`\`

**CORRECT**:
\`\`\`python
home_matches = get_matches(home_team=team_a, away_team=team_b)
away_matches = get_matches(home_team=team_b, away_team=team_a)
# Separate analysis for each direction!
\`\`\`

### Mistake 3: Home/Away Role Swap

**WRONG**:
\`\`\`python
if team_a == "London Cannons":
    pair_id = "London_Cannons_vs_Wolverhampton"
# You don't know who is home!
\`\`\`

**CORRECT**:
\`\`\`python
if home_team == "London Cannons" and away_team == "Wolverhampton":
    pair_id = "London_Cannons_HOME_vs_Wolverhampton_AWAY"
elif home_team == "Wolverhampton" and away_team == "London Cannons":
    pair_id = "Wolverhampton_HOME_vs_London_Cannons_AWAY"
\`\`\`

---

## Summary

### Key Rules

1. **Always distinguish** home and away roles
2. **Never mix** the two directions
3. **Separate database record** for each directed pair
4. **Separate analysis** for each directed pair
5. **Validate** directionality at every step

### Reminder

\`\`\`
London Cannons (H) vs Wolverhampton (A) ≠ Wolverhampton (H) vs London Cannons (A)

Two different match types!
Two different pattern DNA!
Two different statistical profiles!

NEVER TREAT THEM AS THE SAME!
\`\`\`

---

**Document purpose**: Ensure consistent handling of directed pairs in all implementations.

**Criticality**: HIGH - Ignoring directionality leads to incorrect predictions!
