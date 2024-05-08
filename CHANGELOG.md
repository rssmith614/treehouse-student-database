## [1.7.0] - 2024-05-07

### Added
- Support for multiple tenants ([#187](https://github.com/rssmith614/treehouse-student-database/issues/187))

## [1.6.1] - 2024-05-07

### Added
- Email login support for test user ([#186](https://github.com/rssmith614/treehouse-student-database/issues/186))

## [1.6.0] - 2024-05-02

### Added
- Better support for mobile devices ([#60](https://github.com/rssmith614/treehouse-student-database/issues/60))

## [1.5.4] - 2024-05-08

### Fixed
- Bug where topic suggestions weren't shown unless there were also Standard suggestions
- Topic priority ordering when no priority was given
- ASCIIMath typesetting in topics

## [1.5.3] - 2024-05-08

### Added
- Topic suggestions on new eval page

### Changed
- Topics are now kept as list instead of a single text field

## [1.5.2] - 2024-05-06

### Added
- Students can now have topics assigned to them, and tutors can edit ([#188](https://github.com/rssmith614/treehouse-student-database/issues/188))

### Changed
- Typesetting tip modal is now its own component

## [1.5.1] - 2024-04-22

### Fixed
- Draft eval deletion implementation

## [1.5.0] - 2024-04-22

### Added
- Ability to save unfinished evals as drafts ([#181](https://github.com/rssmith614/treehouse-student-database/issues/181))
- Page for tutor to review their drafts
- Button to load eval draft from new eval page (if a draft is present for that student)

### Changed
- Updated every record in Firestore to include a 'draft' field
- All parts of the app now check draft field when querying for evals

## [1.4.7] - 2024-04-19

### Added
- `CHANGELOG.md` file ([#180](https://github.com/rssmith614/treehouse-student-database/issues/180))

## [1.4.6] - 2024-04-12

### Changed
- Students' standard progression calculation now incorporates assessments ([#178](https://github.com/rssmith614/treehouse-student-database/issues/178))
- Task components have their own folder

### Fixed
- Student Assessment component properly handles questions without standards
- Logic for rendering assessment file buttons

## [1.4.5] - 2024-04-05

### Added
- Standards can now be added

### Changed
- Standard edit now occurs on its own page ([#176](https://github.com/rssmith614/treehouse-student-database/issues/176))
- Standard selection for pre- and post-req on standard edit has better logic and toasts

## [1.4.4] - 2024-04-03

### Changed
- Typesetting preview updates are now debounced to avoid lag and make it feel more responsive ([#174](https://github.com/rssmith614/treehouse-student-database/issues/174))

### Fixed
- Unrendered typesetting in tooltip that explains typesetting

## [1.4.3] - 2024-04-02

### Added
- Standard suggestions in session notes modal on new eval ([#169](https://github.com/rssmith614/treehouse-student-database/issues/169))
- Eval notes component
- Grades reminder component
- Standard suggestions in standard addition dropdown on task

### Changed
- Transitions on task summary

## [1.4.2] - 2024-03-29

### Added
- MathJAX for rendering math typesetting in evals ([#171](https://github.com/rssmith614/treehouse-student-database/issues/171))

## [1.4.1] - 2024-03-26

### Added
- New assessments can be created by admin ([#167](https://github.com/rssmith614/treehouse-student-database/issues/167))
- Standard selector menu for assessment answer key

### Fixed
- Crash when assessment files are not found
- Navbar placement

## [1.4.0] - 2024-03-22

### Added
- Standard progression graph ([#166](https://github.com/rssmith614/treehouse-student-database/issues/166))
- Icons on navbar

### Changed
- Standard description styling
- Resized recent students list on tutor profile
- Sizing of task on eval

### Fixed
- Tutor about section update

## [1.3.14] - 2024-03-13

### Added
- Grade trend indicator on student profile ([#164](https://github.com/rssmith614/treehouse-student-database/issues/164))

### Changed
- Grade entry makes it harder to accidentally overwrite previous grades ([#162](https://github.com/rssmith614/treehouse-student-database/issues/162))
- New grade entry will auto-populate with the last classes entered for that student ([#162](https://github.com/rssmith614/treehouse-student-database/issues/162))

## [1.3.13] - 2024-03-11

### Added
- Collapsing animations on eval table, task list, and standards list ([#160](https://github.com/rssmith614/treehouse-student-database/issues/160))

### Fixed
- Cursor pointer on eval table rows

## [1.3.12] - 2024-03-10

### Added
- Clarifying tooltip on grades reminder

### Changed
- Grades reminder tooltip is now shown if last entry is over 2 weeks old ([#158](https://github.com/rssmith614/treehouse-student-database/issues/158))

## [1.3.11] - 2024-03-05

### Added
- Search bar on student lists autofocuses on page load

### Fixed
- Grades reminder is only shown for high school students now ([#151](https://github.com/rssmith614/treehouse-student-database/issues/151))

## [1.3.10] - 2024-03-04

### Added
- Task order is now preserved ([#147](https://github.com/rssmith614/treehouse-student-database/issues/147))
- New loading style on all pages using Skeleton (placeholder) ([#149](https://github.com/rssmith614/treehouse-student-database/issues/149))
- Grades entry reminder feature ([#151](https://github.com/rssmith614/treehouse-student-database/issues/151))

## [1.3.9] - 2024-03-02

### Added
- Last session notes allow viewing of the last 5 evals for that student ([#143](https://github.com/rssmith614/treehouse-student-database/issues/143))

### Changed
- Date format in eval

## [1.3.8] - 2024-03-02

### Added
- Paginated Table component to be used sitewide

## [1.3.7] - 2024-03-01

### Added
- Grades data export

### Updated
- Tables sitewide, extracted components for maintainability

## [1.3.6] - 2024-02-29

### Added
- Further protections against submitting evals with null values

### Fixed
- Behavior of standard dropdown on task

## [1.3.5] - 2024-02-28

### Added
- Protect against null values in evals

## [1.3.4] - 2024-02-28

### Updated
- Text alignment on student grade table

### Fixed
- Grade validation allows grades above 100% ([#133](https://github.com/rssmith614/treehouse-student-database/issues/133))

## [1.3.3] - 2024-02-27

### Changed
- Behavior of eval caching ([#129](https://github.com/rssmith614/treehouse-student-database/issues/129))

## [1.3.2] - 2024-02-27

### Added
- Standards can have example images uploaded to them ([#125](https://github.com/rssmith614/treehouse-student-database/issues/125))

### Changed
- Standard summary display when clicked

## [1.3.1] - 2024-02-26

### Fixed
- Null tutor name bug
- Inifinte render bug on eval header

## [1.3.0] - 2024-02-26 [YANKED]

### Updated
- Extracted components sitewide to improve maintainability ([#124](https://github.com/rssmith614/treehouse-student-database/issues/124))

## [1.2.3] - 2024-02-22

### Added
- Next session notes from previous eval are shown on new eval page ([#121](https://github.com/rssmith614/treehouse-student-database/issues/121))

## [1.2.2] - 2024-02-21

### Fixed
- Eval table crash if task had colons (":")

## [1.2.1] - 2024-02-21

### Fixed
- Firestore rules and user abilities to allow for grades

## [1.2.0] - 2024-02-21

### Added
- Grades tracking ([#119](https://github.com/rssmith614/treehouse-student-database/issues/119))

### Fixed
- Engagement heading in eval edit (it was labeled as "Select One")

## [1.1.5] - 2024-02-16

### Changed
- Table sorting logic to play nicer with pagination ([#113](https://github.com/rssmith614/treehouse-student-database/issues/113))

### Fixed
- Same bug in [#111](https://github.com/rssmith614/treehouse-student-database/issues/111), but on eval edit
- Issue in eval query that would return 0 results if no student filters were applied

## [1.1.4] - 2024-02-15

### Changed
- Evals table futher collapses task descriptions for compactness and readability ([#111](https://github.com/rssmith614/treehouse-student-database/issues/111))
- Tutor profile recent students list glows on hover

### Fixed
- Flag for review option being shown by default in new eval ([#114](https://github.com/rssmith614/treehouse-student-database/issues/114))

## [1.1.3] - 2024-02-14

### Added
- Standard searching ([#109](https://github.com/rssmith614/treehouse-student-database/issues/109))

## [1.1.2] - 2024-02-13

### Added
- Eval ownership request when a tutor tries to edit an unowned eval ([#107](https://github.com/rssmith614/treehouse-student-database/issues/107))

## [1.1.1] - 2024-02-12

### Fixed
- Validation for eval progression ([#105](https://github.com/rssmith614/treehouse-student-database/issues/105))
- Task summary tooltip position

## [1.1.0] - 2024-02-09

### Added
- Recent student section on tutor profile for quickdraw evaluations ([#101](https://github.com/rssmith614/treehouse-student-database/issues/101))
- Eval table is now paginated ([#103](https://github.com/rssmith614/treehouse-student-database/issues/103))

### Changed
- Tasks take full page width on eval edit ([#97](https://github.com/rssmith614/treehouse-student-database/issues/97))
- Tutor profile page has been reorganized, always showing about, recent students, and recent evals sections

### Fixed
- Bug preventing tutors from adding standards to tasks ([#98](https://github.com/rssmith614/treehouse-student-database/issues/98))
- Popover behavior on touch devices

## [1.0.7] - 2024-02-07

### Changed
- Standard popover behavior ([#95](https://github.com/rssmith614/treehouse-student-database/issues/95))
- Standard addition toast message

## [1.0.6] - 2024-02-06

### Added
- NewStudentAssessment, NewStudentEval, and NewStudentPage scroll to top on load ([#94](https://github.com/rssmith614/treehouse-student-database/issues/94))

### Changed
- Eval table displays tasks as styled unordered list

## [1.0.5] - 2024-02-05

### Added
- Eval ownership can be moved by an admin ([#87](https://github.com/rssmith614/treehouse-student-database/issues/87))

### Fixed
- Issue where edited eval could be submitted with undefined progression

## [1.0.4] - 2024-02-05

### Added
- Eval rows can be collapsed when there is more than 1 task ([#83](https://github.com/rssmith614/treehouse-student-database/issues/83))

## [1.0.3] - 2024-02-05

### Fixed
- Standard progression defaults to empty ([#82](https://github.com/rssmith614/treehouse-student-database/issues/82))
- Presence of standards on task removes progression from task ([#84](https://github.com/rssmith614/treehouse-student-database/issues/84))
- Behavior of popovers with pointer devices

## [1.0.2] - 2024-02-05

### Added
- Student classes listed on student profile

## [1.0.1] - 2024-02-05

### Fixed
- Standard popover behavior on touch devices ([#85](https://github.com/rssmith614/treehouse-student-database/issues/85))

## [1.0.0] - 2024-02-03

### Added
- Tutor avatar can be customized

### Fixed
- Tutor ability definition
- Preferred tutor in student profile
- Spacebar exits student search bar

## [0.4.6] - 2024-01-29

### Added
- Tooltip for flag for review button in evals

### Changed
- Standard selection behavior in evals ([#80](https://github.com/rssmith614/treehouse-student-database/issues/80))
- Input field height for eval comments and next session plans adjusts automatically

## [0.4.5] - 2024-01-26

### Added
- Support url for worksheet upload on eval ([#76](https://github.com/rssmith614/treehouse-student-database/issues/76))

### Changed
- Submit and delete behavior in eval edit ([#78](https://github.com/rssmith614/treehouse-student-database/issues/78))

## [0.4.4] - 2024-01-23

### Added
- New standard management on tasks ([#70](https://github.com/rssmith614/treehouse-student-database/issues/70))

### Fixed
- Column mismatch in student data export ([#72](https://github.com/rssmith614/treehouse-student-database/issues/72))

## [0.4.3] - 2024-01-19

### Added
- Avatars for tutors

### Changed
- Student search bar sitewide ([#62](https://github.com/rssmith614/treehouse-student-database/issues/62))

### Fixed
- Task subject matches standard subject ([#63](https://github.com/rssmith614/treehouse-student-database/issues/63))
- Bug in csv export caused by commas in task comments ([#68](https://github.com/rssmith614/treehouse-student-database/issues/68))

## [0.4.2] - 2024-01-19

### Added
- `.csv` export for query results
- `.csv` export for evaluations, includes denormalized task data ([#48](https://github.com/rssmith614/treehouse-student-database/issues/48))

## [0.4.1] - 2023-01-19

### Added
- Email notification ([#28](https://github.com/rssmith614/treehouse-student-database/issues/28))
  - New access request
  - Access request approval

## [0.4.0] - 2024-01-18

### Changed
- Eval query filters are more intuitive to add
- Eval query refactor, easier to debug and introduce new filters
- Eval query result table filters

## [0.3.1] - 2024-01-16

### Added
- Tooltips for fields in evals ([#51](https://github.com/rssmith614/treehouse-student-database/issues/51))
- Worksheet upload on eval edit

### Changed
- Colors sitewide, leaned into more of a treehouse blue theme ([#59](https://github.com/rssmith614/treehouse-student-database/issues/59))

### Fixed
- Bug related to multiple concurrent toasts

## [0.3.0] - 2024-01-11

### Added
- StandardsOfCategoryAndStatus component ([#53](https://github.com/rssmith614/treehouse-student-database/issues/53))
- Support multiple standards per task

### Changed
- Standard tracking is now based on average progression in evaluations

## [0.2.13] - 2024-01-08

### Added
- Data validation for new student form ([#52](https://github.com/rssmith614/treehouse-student-database/issues/52))

### Removed
- Form submission on enter ([#49](https://github.com/rssmith614/treehouse-student-database/issues/49))

## [0.2.12] - 2024-01-08

### Added
- Deletion rules, compensation for null values ([#35](https://github.com/rssmith614/treehouse-student-database/issues/35))
- Prettier for code formatting
- Pre-commit hook for formatting
- CSV export for student list

### Fixed
- Tutor edit back button
- Admin can no longer delete themselves
- Loading bug after eval deletion

## [0.2.11] - 2023-12-22

### Added
- Form caching for (#38)
  - New Student
  - New Eval
  
### Changed
- Navigation in TrackStandard component

## [0.2.10] - 2023-12-22

### Added
- Tips to improve eval uniformity as entered by tutors ([#36](https://github.com/rssmith614/treehouse-student-database/issues/36))
- Flag for review functionality
- Eval review page for admins

## [0.2.9] - 2023-12-22

### Added
- Tutor preferences on profile page
- Filter by tutor preferences on tutor list

## [0.2.8] - 2023-12-21

### Changed
- Firestore doc fetches now use snapshot listeners
- Delete rules

### Fixed
- Bugs caused by new data fetching methods

## [0.2.7] - 2023-12-20

### Added
- Filters to student standards list
- More emulator prep

### Fixed
- Hide `console.log` statements
- Overlay placement
- Tutor selection bug on eval edit

## [0.2.6] - 2023-12-19

### Changed
- Light mode styling
- Task rendering
- Redirect to login page if not authenticated

## [0.2.5] - 2023-12-18

### Added
- Back buttons to key pagees

### Changed
- Back button functionality

## [0.2.4] - 2023-12-15

### Added
- Sorting and filtering to AssessmentsOfStudent

## [0.2.3] - 2023-12-15

### Added
- `README.md`

## [0.2.2] - 2023-12-15

### Fixed
- Bug introduced by minification in prod build
  - Abilities weren't properly being checked

## [0.2.1] - 2023-12-15

### Changed
- Login and access request flow

## [0.2.0] - 2023-12-14

### Added
- Firebase hosting
- Favicon

## [0.1.5] - 2023-12-11

### Fixed
- Sizing of assessment download buttons
- Hide `console.log` statements

## [0.1.4] - 2023-12-11

### Added
- Assessment answer keys can be submitted as `.csv` files

## [0.1.3] - 2023-12-11

### Fixed
- Updated Firestore rules to allow for assessments

## [0.1.2] - 2023-12-11

### Fixed
- Standard for each assessment question now displays correctly

## [0.1.1] - 2023-12-11

### Added
- Assessments can be issued to students

## [0.1.0] - 2023-12-07

### Added
- Assessment list
  - Admins can edit
  - Answer keys
  - Valid standards check

============= BEFORE FEATURE BRANCHES =============

## [0.0.19] - 2023-12-05

### Changed
- Improved standard selection in evals

## [0.0.18] - 2023-11-30

### Added
- Tools for developing security rules

## [0.0.17] - 2023-11-26

### Changed
- Eval edit supports multiple tasks
- Eval query supports multiple tasks
- Made tutor document ids match their uid

## [0.0.16] - 2023-11-23

### Added
- Multiple tasks per eval

### Changed
- Standards are attached to tasks instead of eval

## [0.0.15] - 2023-11-22

### Added
- Standards can be tracked in bulk
- Standard tracking expiration

## [0.0.14] - 2023-11-17

### Added
- Support for simultaneous toasts

## [0.0.13] - 2023-11-09

### Added
- Admins can edit standards

### Changed
- Minor styling changes
- Improved standard sorting

### Fixed
- Standards are now tracked on student profile by reference instead of copying

## [0.0.12] - 2023-11-08

### Added
- Standards tracking on student profile

## [0.0.11] - 2023-11-07

### Added
- Standards cheat sheet
- Python script for pushing standards to Firestore from spreadsheet

## [0.0.10] - 2023-11-04

### Added
- Eval Query tool

## [0.0.9] - 2023-11-03

### Changed
- More components use `bootstrap-react` library instead of bootstrap classes

## [0.0.8] - 2023-11-02

### Added
- `bootstrap-react` library

### Fixed
- Tutor profile reload bug

## [0.0.7] - 2023-10-24

### Added
- Evals Table component

### Fixed
- Bug preventing eval submission

## [0.0.6] - 2023-10-23

### Changed
- Cleaner navbar
- New icons on eval list
- Improved filtering on all tables

## [0.0.5] - 2023-10-20

### Added
- Firebase hosting support
- Worksheet upload on eval
- Eval table can be filtered

## [0.0.4] - 2023-10-20

### Fixed
- Fixed bug where tutor could still edit their own clearance

## [0.0.3] - 2023-10-18

### Added
- DB functionality for evals
  - Create
  - Edit
- Tutor's previous evals on profile

### Changed
- File structure, moved pages into folders

## [0.0.2] - 2023-10-18

### Added
- Tutor edit support

### Changed
- Tutor cannot edit their own clearance

## [0.0.1] - 2023-10-17

### Added
- Session evals
- Login/admin abilities
- New tutor support