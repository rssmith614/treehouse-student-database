# Treehouse Student Database

Track Student Progression of California K-8 Standards through tutoring session evaluations and assessments.

## Technologies, Frameworks, and Programming Languages Used

- React
- Bootstrap
- Firebase

This app is currently hosted on Firebase at [https://student-database-2aa8d.web.app/](https://student-database-2aa8d.web.app/).

## Installation

To run the development environment locally, run the following commands after cloning the repository:

```bash
npm ci
npm run emulate
npm start
```

## Authors / Contributors

- [Robert Smith](https://github.com/rssmith614)

## Other notes

Firestore database is backed up weekly on Sundays via gcloud. To view current backups, run the following command:

```bash
gcloud alpha firestore backups list \
--format="table(name, database, state)"
```

Further documentation on Firestore backups can be found [here](https://cloud.google.com/firestore/docs/backups#create_and_manage_backup_schedules).