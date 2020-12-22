import type { LifestyleStandardName, RaceName } from '../../../lib/index'
import type { NPC, SocialClassName } from '../../../lib/npc-generation/_common'
import type { Town } from '../../../lib/town/_common'

const ABSENCE_PERCENT = 74
const OLD_ABSENCE_PERCENT = 40
const VERY_OLD_ABSENCE_PERCENT = 70
const ORPHAN_PERCENT = 10

declare global {
  interface Setup {
    createRelative: typeof createRelative
    createParentage: typeof createParentage
    createChildren: typeof createChildren
    createMarriage: typeof createMarriage
    findParentRaces(
      npc: NPC
    ): {
      lineage: string
      motherRace: RaceName
      fatherRace: RaceName
    }
  }

}

export interface Family {
  key: string
  members: Record<string, NPC>
}

export interface Marriage {
  parents: string[]
  children: NPC[]
  socialClass?: SocialClassName
  lifestyle?: LifestyleStandardName
  familyUnit?: string
  home?: string
}

/**
 * General function for inserting individual relatives. Returns the corresponding relative, or undefined
 */
export function createRelative (town: Town, family: Family, base: Partial<NPC> = {}, force = false): NPC | null {
  // sanity-check
  if (base.ageYears <= 0) {
    return null
  }
  if (base.race === 'devil' as RaceName) {
    return null
  }
  // ???
  if (!base.lastName) {
    delete base.lastName
  }

  // Avoid secondary NPC spam
  if (!force) {
    if (random(1, 100) <= ABSENCE_PERCENT) {
      return null
    }
    if (lib.isOfAge('elderly', base.race, base.ageYears)) {
      if (random(1, 100) <= OLD_ABSENCE_PERCENT) {
        return null
      }
      // @todo
      const ageTraits = lib.raceTraits[base.race]
      if (base.ageYears >= ageTraits.ageDescriptors[0]) {
        if (random(1, 100) <= VERY_OLD_ABSENCE_PERCENT) return undefined
      }
    }
  }

  const relative = setup.createNPC(town, base)

  family.members[relative.key] = {
    key: relative.key,
    parentMarriage: undefined,
    marriages: undefined,
    canRemarry: true
  }

  return relative
}

export function createParentage (town: Town, family: Family, npc: NPC, forceFather = false, forceMother = false): void {
  const node = family.members[npc.key]
  if (node.parentMarriage === undefined) {
    if (random(1, 100) <= ORPHAN_PERCENT &&
      !forceFather && !forceMother) {
      node.parentMarriage = null
    } else {
      const marriage = {
        parents: [],
        children: [npc.key]
      }

      const { motherRace, fatherRace, lineage } = lib.findParentRaces(npc)
      npc.parentalLineage = lineage
      const { fatherSurname, motherSurname } = setup.getParentSurnames(marriage)

      const fatherBase = Object.assign({}, setup.familyData.relativeBase(npc), {
        gender: 'man',
        ageYears: setup.familyData.parentAge(npc),
        race: fatherRace,
        lastName: fatherSurname,
        socialClass: setup.relativeSocialClass(npc.socialClass)
      })
      const motherBase = Object.assign({}, setup.familyData.relativeBase(npc), {
        gender: 'woman',
        ageYears: setup.familyData.parentAge(npc),
        race: motherRace,
        lastName: motherSurname,
        socialClass: setup.relativeSocialClass(npc.socialClass)
      })

      // TODO finish support for non-heterosexual marriages
      const father = setup.createRelative(town, family, fatherBase, forceFather)
      const mother = setup.createRelative(town, family, motherBase, forceMother)
      if (father) {
        marriage.parents.push(father.key)
        family.members[father.key].marriages = [marriage]
      }
      if (mother) {
        marriage.parents.push(mother.key)
        family.members[mother.key].marriages = [marriage]
      }

      marriage.socialClass = setup.familySocialClass(marriage)
      setup.createChildren(town, family, marriage, setup.familyData.siblingRoll(), motherRace, fatherRace)

      node.parentMarriage = marriage
      node.siblings = marriage.children
    }
  }
}

export function createChildren (town: Town, family: Family, marriage: Marriage, amount: number, motherRace: RaceName = 'human', fatherRace: RaceName = 'human', force = false): NPC[] {
  if (!force) amount -= marriage.children.length

  console.log(`Creating ${amount} siblings...`)
  console.log(family)

  const surname = setup.getChildSurname(marriage)
  const siblingClass = marriage.socialClass

  const inserted = []
  for (let k = 0; k < amount; k++) {
    const siblingBase: Partial<NPC> = {
      race: lib.findChildRace(town, motherRace, fatherRace),
      ageYears: setup.familyData.childAge(marriage),
      lastName: surname,
      socialClass: siblingClass,
      family: family.key,
      canBeCustom: false,
      isShallow: true,
      hasHistory: false
    }

    if (lib.isOfAge('young adult', siblingBase.race, siblingBase.ageYears)) {
      siblingBase.socialClass = setup.relativeSocialClass(siblingClass)
    }

    const sibling = setup.createRelative(town, family, siblingBase, force)
    if (sibling) {
      marriage.children.push(sibling.key)
      inserted.push(sibling.key)
      family.members[sibling.key].parentMarriage = marriage
      family.members[sibling.key].siblings = marriage.children
    }
  }

  return inserted
}

export function createMarriage (town: Town, family: Family, npc: NPC, force = false): Marriage {
  const marriageMin = lib.raceTraits[npc.race].ageTraits['young adult'].baseAge
  const newMarriage: Marriage = {
    parents: [npc.key],
    children: []
  }

  // TODO finish support for non-heterosexual marriages
  const partnerBase = Object.assign({}, setup.familyData.relativeBase(npc), {
    gender: lib.getOppositeGender(npc.gender),
    ageYears: setup.familyData.partnerAge(npc),
    race: lib.findPartnerRace(town, npc),
    socialClass: setup.relativeSocialClass(setup.relativeSocialClass(npc.socialClass))
  })

  partnerBase.ageYears = Math.max(partnerBase.ageYears, marriageMin)

  const partner = setup.createRelative(town, family, partnerBase, force)

  if (partner) {
    setup.setAsPartners(npc, partner)
    newMarriage.parents.push(partner.key)
    family.members[partner.key].marriages = [newMarriage]
  }

  newMarriage.socialClass = setup.familySocialClass(newMarriage)
  setup.createChildren(town, family, newMarriage, setup.familyData.siblingRoll(), npc.race, partnerBase.race)

  return newMarriage
}
