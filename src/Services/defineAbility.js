import { AbilityBuilder, createMongoAbility } from '@casl/ability';

function defineAbilityFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  
  if (!user) {
    return build();
  }

  const tutorClearance = user.data().clearance;
  // const tutorEmail = user.data().email;

  // ADMIN ABILITIES
  if (tutorClearance === 'admin') {
    can('manage', 'all');

    cannot('edit', Tutor, ['clearance'], { uid: user.id }).because("Admin cannot change their own clearance");
    cannot('delete', Tutor, { uid: user.id }).because("Admin cannot delete themselves");
  }

  // TUTOR ABILITIES
  else if (tutorClearance === "tutor") {
    can('edit', Tutor, { uid: user.id });
    cannot('edit', Tutor, ['clearance'], { uid: user.id }).because("Tutor cannot change their own clearance");

    can('read', Student);

    can('create', Eval);
    can('edit', Eval, { owner: user.id });

    can('issue', Assessment);
    can('edit', Assessment, { issued_by: user.id });

    can('create', Grade);
    can('edit', Grade, { tutor_id: user.id });

    can('read', StudentTopic);
    can('create', StudentTopic);
    can('edit', StudentTopic);
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

class Standard {
  constructor(dict) {
    for (const key in dict) {
      if (dict.hasOwnProperty(key)) {
        this[key] = dict[key];
      }
    }
  }
}

class Grade {
  constructor(dict) {
    for (const key in dict) {
      if (dict.hasOwnProperty(key)) {
        this[key] = dict[key];
      }
    }
  }

}

class Student {
  constructor(dict) {
    for (const key in dict) {
      if (dict.hasOwnProperty(key)) {
        this[key] = dict[key];
      }
    }
  }
}

class Parent {
  constructor(dict) {
    for (const key in dict) {
      if (dict.hasOwnProperty(key)) {
        this[key] = dict[key];
      }
    }
  }
}

class StudentTopic {
  constructor(dict) {
    for (const key in dict) {
      if (dict.hasOwnProperty(key)) {
        this[key] = dict[key];
      }
    }
  }
}

export { defineAbilityFor, Tutor, Eval, Assessment, Standard, Grade, Student, Parent, StudentTopic }