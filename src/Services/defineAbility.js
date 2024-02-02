import { AbilityBuilder, createMongoAbility } from '@casl/ability';

function defineAbilityFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  
  if (!user) {
    return build();
  }

  const tutorClearance = user.data().clearance;
  // const tutorEmail = user.data().email;

  if (tutorClearance === 'admin') {
    can('manage', 'all');
    cannot('edit', Tutor, ['clearance'], { uid: user.id }).because("Admin cannot change their own clearance");
    cannot('delete', Tutor, { uid: user.id }).because("Admin cannot delete themselves");
  }

  else if (tutorClearance === "tutor") {
    can('edit', Tutor, { uid: user.id });
    cannot('edit', Tutor, ['clearance'], { uid: user.id }).because("Tutor cannot change their own clearance");
    can('edit', Eval, { owner: user.id });
    can('edit', Assessment, { issued_by: user.id });
  }

  return build({ detectSubjectType: item => item.constructor });
}

class Tutor {
  constructor(dict) {
    for (const key in dict) {
      if (dict.hasOwnProperty(key)) {
        this[key] = dict[key];
      }
    }
  }
}

class Eval {
  constructor(dict) {
    for (const key in dict) {
      if (dict.hasOwnProperty(key)) {
        this[key] = dict[key];
      }
    }
  }
}

class Assessment {
  constructor(dict) {
    for (const key in dict) {
      if (dict.hasOwnProperty(key)) {
        this[key] = dict[key];
      }
    }
  }
}

export { defineAbilityFor, Tutor, Eval, Assessment }