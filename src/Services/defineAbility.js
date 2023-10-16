import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export default function defineAbilityFor(user) {
  const { can, build } = new AbilityBuilder(createMongoAbility);
  
  if (!user) {
    return build();
  }

  if (user.clearance === 'admin') {
    can('manage', 'all');
  }

  return build();
}