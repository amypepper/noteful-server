const express = require("express");
// const xss = require("xss");
const FoldersService = require("./folders-service");

const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter.route("/folders").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  FoldersService.getAllFolders(knexInstance)
    .then((folders) => {
      res.json(folders.map((folder) => folder));
    })
    .catch(next);
});
// .post(jsonParser, (req, res, next) => {
//   const { client_id, title } = req.body;
//   const newFolder = { client_id, title };

//   for (const [key, value] of Object.entries(newFolder)) {
//     if (value == null) {
//       return res.status(400).json({
//         error: { message: `Missing '${key}' in request body` },
//       });
//     }
//   }

//   FoldersService.insertFolder(req.app.get("db"), newFolder)
//     .then((folder) => {
//       res
//         .status(201)
//         .location(path.posix.join(req.originalUrl, `/${folder.id}`))
//         .json(newFolder);
//     })
//     .catch(next);
// });

// foldersRouter
//   .route("/folders/:folder_id")
//   .all((req, res, next) => {
//     FoldersService.getById(req.app.get("db"), req.params.folder_id)
//       .then((folder) => {
//         if (!folder) {
//           return res.status(404).json({
//             error: { message: `Folder doesn't exist` },
//           });
//         }
//         res.json({
//           client_id: xss(folder.id),
//           title: xss(folder.title),
//         });
//       })
//       .catch(next);
//   })

// .delete((req, res, next) => {
//   FoldersService.deleteFolder(req.app.get("db"), req.params.folder_id)
//     .then((numRowsAffected) => {
//       res.status(204).end();
//     })
//     .catch(next);
// })
// .patch(jsonParser, (req, res, next) => {
//   const { id, client_id, name, date_created } = req.body;
//   const folderToUpdate = { client_id, name };

//   const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
//   if (numberOfValues === 0)
//     return res.status(400).json({
//       error: {
//         message: `Request body must contain a folder name and a unique ID`,
//       },
//     });

//   FoldersService.updateFolder(
//     req.app.get("db"),
//     req.params.folder_id,
//     folderToUpdate
//   )
//     .then((numRowsAffected) => {
//       res.status(204).end();
//     })
//     .catch(next);
// });

module.exports = foldersRouter;
