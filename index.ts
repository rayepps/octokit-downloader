import _ from 'radash'
import fs from 'fs-extra'
import GitUrlParse from 'git-url-parse'
import axios from 'axios'
import jszip from 'jszip'
import { promisify } from 'util'
import * as stream from 'stream'
import cmd from 'cmdish'


export type Source = {
  owner: string
  repo: string
  branch?: string
}

const download = async ({
  from: sourceArgs,
  to: destPath,
  unzip = true,
  quiet = true
}: {
  from: string | Source
  to: string
  unzip?: boolean
  quiet?: boolean
}) => {
  if (!destPath || !destPath.endsWith('.zip')) {
    throw 'to arg is required and must be a valid path for a .zip file'
  }
  await downloadZipFile({
    url: link({ from: sourceArgs }),
    to: destPath
  })
  if (!unzip) {
    return
  }
  const destDir = destPath.replace(/\/.+?\.zip$/, '')
  const destFile = destPath.match(/^.+\/(.+?)\.zip$/)[1]
  await cmd(`unzip ${destFile}.zip`, {
    cwd: destDir,
    quiet
  })
  const sourceDirName = await getSourceDirName(destPath)
  await fs.rename(`${destDir}/${sourceDirName}`, `${destDir}/${destFile}`)
}

const link = ({
  from: sourceArgs
}: {
  from: string | Source
}) => {
  const source: Source = (() => {
    if (!_.isString(sourceArgs)) {
      return {
        owner: (sourceArgs as Source).owner,
        repo: (sourceArgs as Source).repo,
        branch: (sourceArgs as Source).branch
      }
    }
    const sourceData = GitUrlParse(sourceArgs as string)
    return {
      owner: sourceData.owner,
      repo: sourceData.name,
      branch: sourceData.ref
    }
  })()
  return `https://github.com/${source.owner}/${source.repo}/archive/refs/heads/${source.branch || 'master'}.zip`
}

const downloadZipFile = async ({
  url,
  to: toPath
}: {
  url: string
  to: string
}): Promise<any> => {
  const finished = promisify(stream.finished)
  const writer = fs.createWriteStream(toPath)
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })
  response.data.pipe(writer)
  return await finished(writer)
}

const getSourceDirName = async (zipPath: string) => {
  const zipFileData = await fs.readFile(zipPath)
  const zip = await jszip.loadAsync(zipFileData)
  return Object.keys(zip.files)[0]
}

export default {
  download,
  link
}