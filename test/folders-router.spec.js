// const folders = require("../src/api/folders/api/folders-router");
// const app = require('../src/app');

// describe.only(`GET /api/folders/:folder_id`, () => {
//   // context('Given there are folders in the database', () => {/* not shown */})
//   let db

//   before('make knex instance', () => {
//     db = knex({
//       client: 'pg',
//       connection: process.env.TEST_DB_URL,
//     })
//     app.set('db', db)
//   context(`Given an XSS attack folder`, () => {
//     const maliciousFolder = {
//       client_id: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
//       title: 'Naughty naughty very naughty <script>alert("xss");</script>',
//     };

//     beforeEach("insert malicious Folder", () => {
//       return db.into("folders").insert([maliciousFolder]);
//     });

//     it("removes XSS attack content", () => {
//       return supertest(folders)
//         .get(`/api/folders/${maliciousFolder.id}`)
//         .expect(200)
//         .expect((res) => {
//           expect(res.body.title).to.eql(
//             'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
//           );
//           expect(res.body.content).to.eql(
//             `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
//           );
//         });
//     });
//   });
// });
