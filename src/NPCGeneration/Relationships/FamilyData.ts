import type { NPC } from '../../setup'
import type { Marriage } from './createFamilyMembers'

declare global {
  interface Setup {
    familyData: {
      parentStageTable: [number, string][];
      parentAge: (npc: NPC) => number;
      siblingAge: (npc: NPC) => number;
      childAge: (marriage: Marriage) => number;
      partnerAge: (npc: NPC) => number;
      siblingRoll: () => number;
      relativeBase: (npc: NPC) => Partial<NPC>
    },
  }
}

// types are stored in setup.d.ts
// don't bother creating a FamilyData.d.ts
// you'll waste your time like me
// uses State.variables.npcs

setup.familyData = {
  parentStageTable: [
    [55, 'young adult'],
    [35, 'settled adult'],
    [10, 'elderly']
  ],
  parentAge: (npc: NPC): number => {
    const race = npc.race || 'human'
    const parentStage = lib.rollFromTable(setup.familyData.parentStageTable, 100)
    const { baseAge, ageModifier } = lib.raceTraits[race].ageTraits[parentStage]
    return npc.ageYears + baseAge + ageModifier()
  },
  siblingAge: (npc: NPC) => {
    const race = npc.race || 'human'
    const { baseAge } = lib.raceTraits[race].ageTraits['young adult']
    return npc.ageYears + random(-baseAge, baseAge)
  },
  childAge: (marriage) => {
    if (marriage.parents.length > 0) {
      // find the youngest parent
      const youngest = marriage.parents
        .map(key => State.variables.npcs[key])
        .reduce((npcA, npcB) =>
          npcA.ageYears <= npcB.ageYears ? npcA : npcB)
      return 2 * youngest.ageYears - setup.familyData.parentAge(youngest)
    } else if (marriage.children.length > 0) {
      const sibling = State.variables.npcs[marriage.children[0]]
      return setup.familyData.siblingAge(sibling)
    } else {
      return 0
    }
  },
  partnerAge: (npc: NPC) => {
    const race = npc.race || 'human'
    const { baseAge } = lib.raceTraits[race].ageTraits['young adult']
    return npc.ageYears + random(-baseAge, baseAge)
  },

  siblingRoll: (): number => {
    switch (random(1, 5)) {
      case 1:
        return 0
      case 2:
        return random(1, 3)
      case 3:
        return random(2, 5)
      case 4:
        return random(3, 8)
      case 5:
        return random(4, 11)
    }
  },
  relativeBase: (npc: NPC): Partial<NPC> => ({
    // lastName: npc.lastName,
    race: npc.race,
    family: npc.family,
    canBeCustom: false,
    isShallow: true,
    hasHistory: false
  })
}
