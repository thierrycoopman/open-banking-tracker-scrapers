const Promise = require('bluebird')
const fs = require('fs')
const jsonfile = require('jsonfile')
const readFile = Promise.promisify(fs.readFile)
const slugify = require('slugify')
let compare

const readJsonFile = module.exports.readJsonFile = async file => {
  try {
    const buffer = await readFile(file, 'utf8')
    return JSON.parse(buffer)
  } catch (e) {
    console.log(file, e)
  }
}

const writeFile = module.exports.writeFile = async (fileName, data) => jsonfile.writeFile(fileName, data, {spaces: 2}, (err) => {
  if (err) {
    console.log(err)
  }
})

const convertToSlug = module.exports.convertToSlug = (string) => {
  try {
    return slugify(string, { replacement: '-', remove: /[/,,?*+~.()'"!:@]/g, lower: true })
  } catch (e) {
    console.error(string, e)
  }
}

module.exports.removeFile = async (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) throw err
    console.log(filePath + ' was deleted')
  })
}

module.exports.saveListing = async (folder, app) => {
  if (app.id !== undefined) {
    writeFile(`data/${folder}/apps/${app.id}.json`, app)
  }

  return app
}

const mergeJsonFilesFromDir = module.exports.mergeJsonFilesFromDir = async (directory) => {
  var services = []

  const getFiles = (dir) => {
    var fileList = []

    var files = fs.readdirSync(dir)
    for (var i in files) {
      if (!files.hasOwnProperty(i)) continue
      var name = dir + '/' + files[i]
      if (!fs.statSync(name).isDirectory() && name != dir + '/.DS_Store') {
        fileList.push(name)
      }
    }
    return fileList
  }

  function asyncFunction (file, cb) {
    readJsonFile(file)
      .then(f => {
        try {
          services.push(f)
          cb()
        } catch (e) {
          console.log(file, e)
        }
      })
      .catch(e => console.log(e))
  }

  let requests = getFiles(directory)
    .map((fileName) => {
      return new Promise((resolve) => {
        asyncFunction(fileName, resolve)
      })
    })

  return Promise.all(requests).then((data) => {
    return services
  })
}

module.exports.sortObjectByKeys = async (data) => {
  const sorted = Object.keys(data)
    .sort()
    .reduce((d, key) => ({
      ...d, [key]: data[key]
    }))

  return sorted
}

const isDuplicate = async (id, platform) => {
  for (let a of Object.values(compare)) {
    if (a[platform] && a[platform] === id) {
      return true
    }
  }

  return false
}
