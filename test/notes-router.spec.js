const notes = require("../src/api/notes/api/notes-router");

describe.only(`GET /api/notes/:note_id`, () => {
  // context('Given there are notes in the database', () => {/* not shown */})

  context(`Given an XSS attack note`, () => {
    const maliciousNote = {
      client_id: "wqefginh-gwealrfn-234598t",
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      modified: Date(Date.now()),
      folder_id: "gawe87-gre78-9rea8e",
      content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    };

    beforeEach("insert malicious note", () => {
      return db.into("notes").insert([maliciousNote]);
    });

    it("removes XSS attack content", () => {
      return supertest(notes)
        .get(`/api/notes/${maliciousNote.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).to.eql(
            'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
          );
          expect(res.body.content).to.eql(
            `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
          );
        });
    });
  });
});
