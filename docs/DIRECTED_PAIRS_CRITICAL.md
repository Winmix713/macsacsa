# KRITIKUS: IRÁNYÍTOTT PÁROK KEZELÉSE

## Alapvető Szabály

**SOHA NE KEVERD ÖSSZE A KÉT IRÁNYT!**

\`\`\`
Team A (H) vs Team B (A) ≠ Team B (H) vs Team A (A)
\`\`\`

---

## Miért Kritikus Ez?

### 1. Hazai Pálya Előny

A hazai csapat **statisztikailag mérhető előnnyel** rendelkezik:
- 10-20% magasabb győzelmi esély
- Több rúgott gól átlagosan
- Kevesebb kapott gól
- Jobb forma mutatók

### 2. Különböző Minta DNS

**Példa: Arsenal vs Wolverhampton**

| Mérkőzés Típus | Minta 1 | Minta 2 | Minta 3 | Domináns
|-----|-----|-----|-----|-----
| Arsenal (H) vs Wolverhampton (A) | 70% | 20% | 10% | **Minta 1**
| Wolverhampton (H) vs Arsenal (A) | 45% | 25% | 30% | **Minta 1** (de gyengébb)

**Következtetés**: 
- Mindkét esetben Minta 1 a domináns
- DE az Arsenal hazai előnye 25%-kal magasabb győzelmi esélyt ad!
- **Két különböző statisztikai profil!**

**Példa: London Ágyúk vs Wolverhampton**

| Mérkőzés Típus | Minta 1 | Minta 2 | Minta 3 | Domináns
|-----|-----|-----|-----|-----
| London Ágyúk (H) vs Wolverhampton (A) | 70% | 20% | 10% | **Minta 1**
| Wolverhampton (H) vs London Ágyúk (A) | 45% | 25% | 30% | **Minta 1** (de gyengébb)

**Következtetés**: 
- Mindkét esetben Minta 1 a domináns
- DE a London Ágyúk hazai előnye 25%-kal magasabb győzelmi esélyt ad!
- **Két különböző statisztikai profil!**

### 3. Adatbázis Struktúra

**Helyes megközelítés**:
\`\`\`
Arsenal_HOME_vs_Wolverhampton_AWAY → 150 historikus mérkőzés
Wolverhampton_HOME_vs_Arsenal_AWAY → 150 historikus mérkőzés

London Ágyúk_HOME_vs_Wolverhampton_AWAY → 150 historikus mérkőzés
Wolverhampton_HOME_vs_London Ágyúk_AWAY → 150 historikus mérkőzés

Összesen: 300 mérkőzés két külön kategóriában
\`\`\`

**Helytelen megközelítés** (TILOS!):
\`\`\`
Arsenal_vs_Wolverhampton → 300 mérkőzés összekeverve
London Ágyúk_vs_Wolverhampton → 300 mérkőzés összekeverve
(Nem lehet megkülönböztetni, ki volt hazai!)
\`\`\`

---

## Gyakorlati Példák

### Példa 1: Manchester Kék vs Liverpool

**Historikus adatok**:

**Manchester Kék (H) vs Liverpool (A)**:
- 100 mérkőzés
- 65 Minta 1 (Manchester Kék győzelem)
- 20 Minta 2 (Döntetlen)
- 15 Minta 3 (Liverpool győzelem)
- **Minta 1: 65%**

**Liverpool (H) vs Manchester Kék (A)**:
- 100 mérkőzés
- 55 Minta 1 (Liverpool győzelem)
- 25 Minta 2 (Döntetlen)
- 20 Minta 3 (Manchester Kék győzelem)
- **Minta 1: 55%**

**Elemzés**:
- Mindkét csapat erősebb otthon
- Manchester Kék hazai előnye: 65% vs 20% (vendégként veszít)
- Liverpool hazai előnye: 55% vs 15% (vendégként veszít)
- **10% különbség a hazai pálya miatt!**

### Példa 2: Chelsea vs London Ágyúk

**Chelsea (H) vs London Ágyúk (A)**:
- Minta 1: 48%
- Minta 2: 32%
- Minta 3: 20%
- **Kiegyensúlyozott, de Chelsea előnyben**

**London Ágyúk (H) vs Chelsea (A)**:
- Minta 1: 52%
- Minta 2: 28%
- Minta 3: 20%
- **Kiegyensúlyozott, de London Ágyúk előnyben**

**Elemzés**:
- Nagyon kiegyensúlyozott párosítás
- Mindkét csapat csak kis előnyt élvez otthon
- **Hazai pálya hatás: csak 4% különbség**
- Nehezebb előrejelezni!

---

## Implementációs Checklist

### Adatgyűjtés

- [ ] Minden mérkőzéshez rögzítsd a hazai és vendég csapatot
- [ ] Generálj egyedi azonosítót: `{HOME}_HOME_vs_{AWAY}_AWAY`
- [ ] Soha ne használj szimmetrikus azonosítót: `{TEAM_A}_vs_{TEAM_B}`
- [ ] Tárold külön a fordított párt: `{AWAY}_HOME_vs_{HOME}_AWAY`

### Adatbázis Struktúra

- [ ] Külön tábla/rekord minden irányított párhoz
- [ ] `home_team` és `away_team` mezők kötelezőek
- [ ] `reverse_pair_id` hivatkozás a fordított párra
- [ ] Index a gyors kereséshez: `(home_team, away_team)`

### Elemzési Algoritmus

- [ ] Mindig ellenőrizd a hazai/vendég szerepet
- [ ] Ne átlagolj különböző irányú mérkőzéseket
- [ ] Használj külön modellt minden irányított párhoz
- [ ] Validáld az irányítottságot minden lekérdezésnél

### Tesztelés

- [ ] Ellenőrizd: Arsenal (H) vs Wolverhampton (A) ≠ Wolverhampton (H) vs Arsenal (A)
- [ ] Ellenőrizd: London Ágyúk (H) vs Wolverhampton (A) ≠ Wolverhampton (H) vs London Ágyúk (A)
- [ ] Tesztelj fordított párokkal
- [ ] Validáld a hazai pálya előny hatását
- [ ] Hasonlítsd össze a két irány statisztikáit

---

## Gyakori Hibák (KERÜLENDŐ!)

### Hiba 1: Szimmetrikus Párosítás

**ROSSZ**:
\`\`\`python
pair_id = f"{sorted([team_a, team_b])[0]}_vs_{sorted([team_a, team_b])[1]}"
# Ez mindig ugyanazt az azonosítót adja, függetlenül a hazai/vendég szereptől!
\`\`\`

**JÓ**:
\`\`\`python
pair_id = f"{home_team}_HOME_vs_{away_team}_AWAY"
# Ez egyértelműen megkülönbözteti az irányokat!
\`\`\`

### Hiba 2: Adatok Összekeverése

**ROSSZ**:
\`\`\`python
all_matches = get_matches(team_a, team_b)  # Mindkét irány együtt
avg_pattern_1 = sum(m.pattern_1 for m in all_matches) / len(all_matches)
\`\`\`

**JÓ**:
\`\`\`python
home_matches = get_matches(home_team=team_a, away_team=team_b)
away_matches = get_matches(home_team=team_b, away_team=team_a)
# Külön elemzés mindkét irányra!
\`\`\`

### Hiba 3: Hazai/Vendég Szerepcsere

**ROSSZ**:
\`\`\`python
if team_a == "Arsenal":
    pair_id = "Arsenal_vs_Wolverhampton"
# Nem tudod, ki a hazai!
\`\`\`

**JÓ**:
\`\`\`python
if home_team == "Arsenal" and away_team == "Wolverhampton":
    pair_id = "Arsenal_HOME_vs_Wolverhampton_AWAY"
elif home_team == "Wolverhampton" and away_team == "Arsenal":
    pair_id = "Wolverhampton_HOME_vs_Arsenal_AWAY"

if home_team == "London Ágyúk" and away_team == "Wolverhampton":
    pair_id = "London_Ágyúk_HOME_vs_Wolverhampton_AWAY"
elif home_team == "Wolverhampton" and away_team == "London Ágyúk":
    pair_id = "Wolverhampton_HOME_vs_London_Ágyúk_AWAY"
\`\`\`

---

## Összefoglalás

### Kulcs Szabályok

1. **Mindig különböztesd meg** a hazai és vendég szerepet
2. **Soha ne keverd össze** a két irányt
3. **Külön adatbázis rekord** minden irányított párhoz
4. **Külön elemzés** minden irányított párhoz
5. **Validáld** az irányítottságot minden lépésnél

### Emlékeztető

\`\`\`
Arsenal (H) vs Wolverhampton (A) ≠ Wolverhampton (H) vs Arsenal (A)
London Ágyúk (H) vs Wolverhampton (A) ≠ Wolverhampton (H) vs London Ágyúk (A)

Két különböző mérkőzés típus!
Két különböző minta DNS!
Két különböző statisztikai profil!

SOHA NE KEZELD ŐKET EGYKÉNT!
\`\`\`

---

**Dokumentum célja**: Biztosítani, hogy az irányított párok helyes kezelése minden implementációban következetes legyen.

**Kritikusság**: MAGAS - Az irányítottság figyelmen kívül hagyása hibás előrejelzésekhez vezet!
