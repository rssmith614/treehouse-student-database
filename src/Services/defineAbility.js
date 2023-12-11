import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export default function defineAbilityFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  
  if (!user) {
    return build();
  }

  const tutorClearance = user.data().clearance;
  const tutorEmail = user.data().email;

  if (tutorClearance === 'admin') {
    can('manage', 'all');
    cannot('edit', 'Tutor', { email: tutorEmail }).because("Admin cannot change their own clearance");
  }

  else if (tutorClearance === "tutor") {
    can('edit', 'Eval', { owner: user.id });
    can('edit', 'Assessment', { issued_by: user.id });
  }

  return build();
}