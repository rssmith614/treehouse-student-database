import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export default function defineAbilityFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  
  if (!user) {
    return build();
  }

  if (user.data().clearance === 'admin') {
    can('manage', 'all');
    cannot('edit', 'Tutor', { email: user.email }).because("Admin cannot change their own clearance");
  }

  else if (user.data().clearance === "tutor") {
    can('edit', 'Eval', { owner: user.email })
  }

  return build();
}