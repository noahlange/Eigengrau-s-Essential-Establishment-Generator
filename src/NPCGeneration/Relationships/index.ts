import * as members from './createFamilyMembers'
import * as friends from './createFriends'
import * as relationships from './createRelationship'
import * as surnames from './FamilySurnames'
import * as parents from './getFatherMother'
import * as partners from './setAsPartners'
import * as family from './SetupFamily'
import * as sexuality from './SetupSexuality'

setup.createRelative = members.createRelative
setup.createParentage = members.createParentage
setup.createChildren = members.createChildren
setup.createMarriage = members.createMarriage
setup.createFriends = friends.createFriends
setup.createRelationship = relationships.createRelationship
setup.marriageIsMatrilineal = surnames.marriageIsMatrilineal
setup.getParentSurnames = surnames.getParentSurnames
setup.getChildSurname = surnames.getChildSurname
setup.getFatherMother = parents.getFatherMother
setup.setAsPartners = partners.setAsPartners
setup.expandFamily = family.expandFamily
setup.fetchFamily = family.fetchFamily
setup.createSexuality = sexuality.createSexuality
