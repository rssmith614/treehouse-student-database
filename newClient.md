# Creating a new client

To create a new client, you need to follow these steps:

1. Reserve a git branch for the new client's app.
   - All changes for this client's site should be made on this branch, treated as the main branch for the new client.
2. Under the Hosting section of the Firebase console, add a new site.
    - This will dictate the URL of the new client's site.
3. Under the Firestore section of Firebase, add a new database.
   - Each site accesses its own data.
4. Update `firebase.json` in the new client branch to include:
   ```
   "hosting" : {
        "site": "new-client",
        ...
   },
   ...
   "firestore" : {
        ...
        "database": "new-client",
        ...
   },
   ```
   - This will ensure that the new client's site is deployed to the correct site and accesses the correct database.
5. Update `.github/workflows/firebase-hosting-merge.yml` to include the new client's branch:
   ```
   ...
   'on':
        push:
            branches:
                ...
                - new-client
    ...
    ```
    - This will ensure that the new client's site is deployed when changes are pushed to the new client's branch.
6. Under the Storage section of the Firebase console, add a new bucket.
   - Each site accesses its own storage (files).
7. On the GCP console Identity Platform, go to Tenants and add a new tenant.
   - Allows each site to function as its own provider even though they are all under the same project.
8. On the GCP console Identity Platform, go to Providers and enable the Google provider for the new tenant.
   - This will allow users to sign in with their Google account.
9.  Update `src/Services/firebase-config.json` to include:
    ```
    {
        ...
        "databaseId": "new-client",
        "storageBucket": "new-client.appspot.com",
        "tenantId": "new-tenant",
        ...
    }
    ```
    - This will ensure that the new client's site accesses the correct database and storage, and signs users into the appropriate tenant.
10. Import Standards from the Treehouse site.
    - If there is no recent export, do this first
      - GCP Console > Firestore > Import/Export > (default) > Export
      - Export the `standards` collection and store it in Treehouse's storage bucket
    - Import standard Firestore documents
      - GCP Console > Firestore > Import/Export > new-client > Import
      - Import the `standards` collection export from Treehouse's storage bucket
    - Copy standard assets
      - GCP Console > Storage Transfer > Create Transfer
      - Transfer the `standards` folder in the Treehouse bucket to the new-client bucket, in a new folder called `standards`