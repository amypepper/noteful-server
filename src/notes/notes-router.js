const express = require("express");
const path = require("path");
const xss = require("xss");

const NotesService = require("./notes-service");
const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = (note) => ({
  id: note.id,
  title: xss(note.title),
  modified: note.modified,
  content: xss(note.content),
  folder_id: note.folder_id,
});

notesRouter
  .route("/api/notes")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    NotesService.getAllNotes(knexInstance)
      .then((notes) => res.json(notes.map(serializeNote)))
      .catch(next);
  })

  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { title, content, folder_id } = req.body;
    const newNote = {
      title,
      content,
      folder_id,
    };
    const number = parseInt(folder_id, 10);

    for (const [key, value] of Object.entries(newNote)) {
      if (!value) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }
    if (typeof title !== "string") {
      return res.status(400).json({
        error: { message: "The note's title must be a string." },
      });
    }
    if (typeof content !== "string") {
      return res.status(400).json({
        error: { message: "The note's content must be a string." },
      });
    }
    if (!Number.isInteger(number)) {
      return res.status(400).json({
        error: { message: "The folder id must be a number." },
      });
    }

    NotesService.insertNote(knexInstance, newNote)
      .then((note) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(`Note with id ${note.id} created`);
      })
      .catch(next);
  });

notesRouter
  .route("/api/notes/:noteid")
  .all((req, res, next) => {
    const number = parseInt(req.params.noteid, 10);

    if (!Number.isInteger(number)) {
      return res.status(400).send("The note id must be a number.");
    }

    NotesService.getById(req.app.get("db"), req.params.noteid)
      .then((note) => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` },
          });
        }
        req.note = serializeNote(note);
        next();
      })
      .catch(next);
  })

  .get((req, res) => {
    res.json(req.note);
  })

  .delete(jsonParser, (req, res, next) => {
    NotesService.deleteNote(req.app.get("db"), req.params.noteid)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(jsonParser, (req, res, next) => {
    const { title, content, folder_id } = req.body;
    const noteToUpdate = {
      title,
      content,
      folder_id,
    };
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;

    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body cannot be empty. It must contain a note title, content or a folder id.`,
        },
      });
    if (title) {
      if (typeof title !== "string") {
        return res.status(400).json({
          error: { message: "The note's title must be a string." },
        });
      }
    }
    if (content) {
      if (typeof content !== "string") {
        return res.status(400).json({
          error: { message: "The note's content must be a string." },
        });
      }
    }
    if (folder_id) {
      const number = parseInt(folder_id, 10);
      if (!Number.isInteger(number)) {
        return res.status(400).send("The folder id must be a number.");
      }
    }

    NotesService.updateNote(req.app.get("db"), req.params.noteid, noteToUpdate)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
