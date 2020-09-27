const express = require("express");
const path = require("path");
const xss = require("xss");
const FoldersService = require("./folders-service");

const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter
  .route("/api/folders")
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
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(folder);
      })
      .catch(next);
  });

foldersRouter
  .route("/api/folders/:folderid")
  .all((req, res, next) => {
    FoldersService.getById(req.app.get("db"), req.params.folderid)
      .then((folder) => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` },
          });
        }
        req.folder = folder;
        next();
      })
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
      .then(() => {
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
      .then((folder) => {
        res.status(200).json(req.folder);
      })
      .catch(next);
  });

module.exports = foldersRouter;
