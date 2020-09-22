const express = require("express");
const path = require("path");
const xss = require("xss");

const FoldersService = require("./folders-service");
const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter
  .route("/folders")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    FoldersService.getAllFolders(knexInstance)
      .then((folder) => res.json(folder))
      .catch(next);
  })

  .post(jsonParser, (req, res, next) => {
    const { title } = req.body;
    const newFolder = { title };

    for (const [key, value] of Object.entries(newFolder)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    FoldersService.insertFolder(req.app.get("db"), newFolder)
      .then((folder) => {
        res
          .status(201)
          // sends a location header with the response
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(xss(folder));
      })
      .catch(next);
  });

foldersRouter
  .route("/folders/:folderid")
  // .all runs for any HTTP verb; should run first so I can test my req
  // data before I try to do things with it
  .all((req, res, next) => {
    FoldersService.getById(req.app.get("db"), req.params.folderid)
      .then((folder) => {
        if (!folder) {
          // send a 404 status w/ a json error message to the client
          return res.status(404).json({
            error: { message: `Folder doesn't exist` },
          });
        }
        // if the folder exists,
        // store the folder (from the db) returned by knex in
        // the Express Request obj
        req.folder = folder;
        // must call next here because .catch(next)  won't call next()
        //unless there is an error
        next();
      })
      // should always have a .catch block after your last .then block
      .catch(next);
  })
  .get((req, res) => {
    res.json({
      id: xss(req.folder.id),
      title: xss(req.folder.title),
    });
  })
  .delete(jsonParser, (req, res, next) => {
    FoldersService.deleteFolder(req.app.get("db"), req.params.folderid)
      // the service obj returns a Promise-like obj, so I need a .then to
      // deal with async issues
      .then(() => {
        // .end() allows me to send an HTTP status with no content
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title } = req.body;
    const folderToUpdate = { title };
    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;

    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain a folder title`,
        },
      });

    FoldersService.updateFolder(
      req.app.get("db"),
      req.params.folderid,
      folderToUpdate
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;
