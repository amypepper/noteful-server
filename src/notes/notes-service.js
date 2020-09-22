const NotesService = {
  getAllNotes(knex) {
    return knex.select("*").from("notes");
  },

  insertNote(knex, newNote) {
    return (
      knex
        .insert(newNote)
        .into("notes")
        .returning("*")
        // returning() method returns an array, here w/ only one item
        .then((rows) => {
          return rows[0];
        })
    );
  },

  getById(knex, id) {
    return knex.from("notes").select("*").where("id", id).first();
  },

  deleteNote(knex, id) {
    return knex("notes").where("id", id).del();
  },

  updateNote(knex, id, newNoteFields) {
    return knex("notes").where("id", id).update(newNoteFields);
  },
};

module.exports = NotesService;
