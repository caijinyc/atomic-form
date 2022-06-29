/**
 * learned from: https://github.com/vuejs/core/blob/25f7a16a6eccbfa8d857977dcf1f23fb36b830b5/scripts/release.js
 */
const path = require('path')
const fs = require('fs')
const execa = require('execa')
const fse = require('fs-extra')
const chalk = require('chalk')
const colors = require('colors')
const prompts = require('prompts')
const { glob } = require('glob')
const semver = require('semver')
const { copy, move, copySync, moveSync } = require('fs-extra')
const { prompt } = require('enquirer')
const args = require('minimist')(process.argv.slice(2))

const currentVersion = require('../package.json').version

const skipTests = args.skipTests
const skipBuild = args.skipBuild
const preId
  = args.preid || (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0])
const isDryRun = args.dry

const isMain
  = execa.sync('git', ['branch', '--show-current'], { cwd: path.resolve(), stdio: 'pipe' }).stdout
  === 'master'

const run = (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', ...opts })
const dryRun = (bin, args, opts = {}) =>
  console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
const runIfNotDry = isDryRun ? dryRun : run
const step = msg => console.log(chalk.cyan(msg))
const getPkgRoot = pkg => path.resolve(__dirname, `../packages/${pkg}`)
const inc = i => semver.inc(currentVersion, i, preId)
const bin = name => path.resolve(__dirname, `../node_modules/.bin/${name}`)

const skippedPackages = ['reactivity', 'validator']
const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(p => !p.endsWith('.ts') && !p.startsWith('.'))

const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []),
]

function updateVersions(version) {
  // 1. update root package.json
  updatePackage(path.resolve(__dirname, '..'), version)
  // 2. update all packages
  packages.forEach(p => updatePackage(getPkgRoot(p), version))
}

function updatePackage(pkgRoot, version) {
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  updateDeps(pkg, 'dependencies', version)
  updateDeps(pkg, 'peerDependencies', version)
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
}

function updateDeps(pkg, depType, version) {
  const deps = pkg[depType]
  if (!deps) return
  Object.keys(deps).forEach((dep) => {
    if (dep.startsWith('@atomic-form') && packages.includes(dep.replace(/^@atomic-form\//, ''))) {
      console.log(chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`))
      deps[dep] = version
    }
  })
}

async function publishPackage(pkgName, version, runIfNotDry) {
  if (skippedPackages.includes(pkgName))
    return

  const pkgRoot = getPkgRoot(pkgName)
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  if (pkg.private)
    return

  // For now, all 3.x packages except "vue" can be published as
  // `latest`, whereas "vue" will be published under the "next" tag.
  let releaseTag = null
  if (args.tag)
    releaseTag = args.tag

  else if (version.includes('alpha'))
    releaseTag = 'alpha'

  else if (version.includes('beta'))
    releaseTag = 'beta'

  else if (version.includes('rc'))
    releaseTag = 'rc'

  // TODO use inferred release channel after official 3.0 release
  // const releaseTag = semver.prerelease(version)[0] || null

  step(`Publishing ${pkgName}...`)
  try {
    await runIfNotDry(
      'yarn',
      [
        'publish',
        '--new-version',
        version,
        ...(releaseTag ? ['--tag', releaseTag] : []),
        '--access',
        'public',
      ],
      {
        cwd: pkgRoot,
        stdio: 'pipe',
      },
    )
    console.log(chalk.green(`Successfully published ${pkgName}@${version}`))
  }
  catch (e) {
    if (e.stderr.match(/previously published/))
      console.log(chalk.red(`Skipping already published: ${pkgName}`))
    else
      throw e
  }
}

async function editPKG() {
  for (const pkg of packages) {
    const pkgJsonPath = path.resolve(getPkgRoot(pkg), 'package.json')
    copySync(pkgJsonPath, pkgJsonPath.replace(/package\.json$/, 'PKG.json'))

    const pkgJson = await fse.readJson(pkgJsonPath)

    // 修改 package.json，因为 cyborg 中使用的是 src/ 中的文件，但是发版就需要使用 lib, es 中的文件
    const publishPkgJson = { ...pkgJson }
    publishPkgJson.main = 'lib/index.js'
    publishPkgJson.module = 'es/index.js'
    publishPkgJson.types = 'es/index.d.ts'
    await fse.writeJsonSync(pkgJsonPath, publishPkgJson, { spaces: 2 })
  }
}

async function restorePKG() {
  for (const pkg of packages) {
    const pkgJsonPath = path.resolve(getPkgRoot(pkg), 'package.json')
    await moveSync(pkgJsonPath.replace(/package\.json$/, 'PKG.json'), pkgJsonPath, {
      overwrite: true,
    })
  }
}

(async() => {
  let targetVersion = args._[0]

  if (!targetVersion) {
    // no explicit version, offer suggestions
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom']),
    })

    if (release === 'custom') {
      targetVersion = (
        await prompt({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion,
        })
      ).version
    }
    else {
      targetVersion = release.match(/\((.*)\)/)[1]
    }
  }

  if (!semver.valid(targetVersion))
    throw new Error(`invalid target version: ${targetVersion}`)

  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`,
  })

  if (!yes)
    return

  step('\nRunning tests...')
  if (!skipTests && !isDryRun)
    await run('vitest', ['test'])

  // await run(bin('jest'), ['--clearCache']);
  // await run('yarn', ['test', '--bail']);
  else
    console.log('(skipped)')

  // build all packages with types
  step('\nBuilding all packages...')
  if (!skipBuild && !isDryRun) {
    for (const pkg of packages) {
      const pkgJsonPath = path.resolve(getPkgRoot(pkg), 'package.json')
      const pkgJson = await fse.readJson(pkgJsonPath)

      if (skippedPackages.find(name => pkgJson.name.includes(name)))
        continue

      await run('pnpm', ['--filter', pkgJson.name, 'build'])
    }
    // await run('yarn', ['build', '--release']);
    // // test generated dts files
    // step('\nVerifying type declarations...');
    // await run('yarn', ['test-dts-only']);
  }
  else { console.log('(skipped)') }

  // update all package versions and inter-dependencies
  step('\nUpdating cross dependencies...')
  updateVersions(targetVersion)

  // TODO generate changelog
  // await run('yarn', ['changelog'])

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    await runIfNotDry('git', ['add', '-A'])
    await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`])
  }
  else {
    console.log('No changes to commit.')
  }

  // publish packages
  step('\nPublishing packages...')
  await editPKG()
  for (const pkg of packages)
    await publishPackage(pkg, targetVersion, runIfNotDry)

  await restorePKG()

  // push to Git
  step('\nPushing to Git...')
  await runIfNotDry('git', ['tag', `v${targetVersion}`])
  await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`])
  await runIfNotDry('git', ['push'])
  // await sendMessage();
})().catch((e) => {
  console.error(e)
})
