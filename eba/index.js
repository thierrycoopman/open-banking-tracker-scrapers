const utils = require('../scripts/utils')
const readJsonFile = utils.readJsonFile
const writeFile = utils.writeFile
const fs = require('fs')

const main = async () => {
  const file = await readJsonFile('./eba/download-PSDMD-201903181600.json')
  // const json = JSON.parse(file)

  console.log(file[1].length)

  // const provider = await saveEntity(file[1][0])
  // writeFile(`./data/${provider.EntityType}/${provider.EntityCode}.json`, provider)

  file[1].slice(0, 60000).map(async f => {
    const provider = await saveEntity(f)
    let dir = `./eba/data/${provider.EntityType}`

    let fileName = provider.ENT_NAM

    if (typeof provider.ENT_NAM === 'object') {
      fileName = provider.ENT_NAM[1]
    } else {
      fileName = provider.ENT_NAM
    }

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    writeFile(`${dir}/${utils.convertToSlug(fileName)}.json`, provider)
  
    // writeFile(`./data/${provider.EntityType}/${provider.EntityCode}.json`, provider)
  })
}

const saveEntity = (f) => {
  // Object.entries(obj).forEach(
  //   ([key, value]) => console.log(key, value)
  // );
  
  const provider = {}
  provider.CA_OwnerID = f.CA_OwnerID
  provider.EntityCode = f.EntityCode
  provider.EntityType = f.EntityType

  f['Properties'].map(p => {
    Object.entries(p).forEach(
      ([key, value]) => provider[key] = value
    )
  })

  // f['Properties'].map(p => {
  //   console.log(p)
  // })

  console.log(provider)
  return provider
}

main()
