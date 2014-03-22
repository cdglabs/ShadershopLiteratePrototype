fs               = require("fs")

watcher          = require('node-watch')
stitch           = require("stitch")




buildScripts = ->
  IN_DIR   = "./src"
  OUT_FILE = "compiled/app.js"

  build = ->
    pkg = stitch.createPackage({paths: [IN_DIR]})
    pkg.compile (err, output) ->
      if err
        console.warn err
        return

      fs.writeFile OUT_FILE, output, (err) ->
        if (err) then throw err
        console.log("compiled: #{OUT_FILE}")

  build()
  watcher(IN_DIR, build)


buildScripts()