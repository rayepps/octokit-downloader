# Octokit Downloader

> Little utility to easily download a GitHub repository by owner/name/branch and unzip it in a location of your choosing

*NOTE:* Only works with public repositories

## Install
```
yarn add octokit-downloader
```

## Usage
```ts
import downloader from 'octokit-downloader'

// Download a repository by link to
// a local directory and unzip it to
// the given name
await downloader.download({
  from: 'https://github.com/exobase-inc/aws-cloud-build-trigger-bridge',
  to: `${__dirname}/repo.zip`,
  unzip: true // Unzipped as 'repo' directory
})

// Download a repository by owner
// repo and branch and don't unzip
// it.
await downloader.download({
  from: {
    owner: 'exobase-inc',
    repo: 'aws-cloud-build-trigger-bridge',
    branch: 'master'
  }
  to: `${__dirname}/repo.zip`,
  unzip: false
})

// Want to do the downloading yourself?
// you can just ask for the link given
// the same `from` arg
const downloadLink = downloader.link({
  from: 'https://github.com/exobase-inc/aws-cloud-build-trigger-bridge',
  // or from: { owner, repo, branch }
})

```