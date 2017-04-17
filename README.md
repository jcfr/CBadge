# CBadge

Open source badges for CMake/CTest/CDash projects. Fork the repository on [GitHub](http://github.com/brennonbrimhall/CBadge).

## Usage

### Badges

CBadge generates four badges for projects that post dashboards to `http://open.cdash.org/`:

| Badge Type | CBadge URL                                                             | Example                                      |
|------------|------------------------------------------------------------------------|----------------------------------------------|
| configure  | `http://cbadge-instance/:CDashProjectName/:GitCommitSHA/configure.svg` | ![Configure Status][example-config-badge]    |
| build      | `http://cbadge-instance/:CDashProjectName/:GitCommitSHA/build.svg`     | ![Build Status][example-build-badge]         |
| test       | `http://cbadge-instance/:CDashProjectName/:GitCommitSHA/test.svg`      | ![Test Status][example-test-badge]           |
| coverage   | `http://cbadge-instance/:CDashProjectName/:GitCommitSHA/coverage.svg`  | ![Coverage Status][example-coverage-badge]   |

[example-config-badge]: http://img.shields.io/badge/configure-passing-brightgreen.svg
[example-build-badge]: http://img.shields.io/badge/build-passing-brightgreen.svg
[example-test-badge]: http://img.shields.io/badge/tests-10%-red.svg
[example-coverage-badge]: http://img.shields.io/badge/coverage-60%-yellow.svg

### Badges for GitHub projects

For GitHub projects, you can send CBadge the name of a tag or branch to have it
automatically redirect you to the correct SHA, branch or tag name:

| Badge Type | CBadge URL                                                                                 |
|------------|--------------------------------------------------------------------------------------------|
| configure  | `http://cbadge-instance/:CDashProjectName/configure/:GitHubRepoOwner/:GitHubRepoName/:tag` |
| build      | `http://cbadge-instance/:CDashProjectName/build/:GitHubRepoOwner/:GitHubRepoName/:tag`     |
| test       | `http://cbadge-instance/:CDashProjectName/test/:GitHubRepoOwner/:GitHubRepoName/:tag`      |
| coverage   | `http://cbadge-instance/:CDashProjectName/coverage/:GitHubRepoOwner/:GitHubRepoName/:tag`  |

To add badges to your README.md for you GitHub repository, include them with the following syntax:

```
![Configure Status](http://cbadge-instance/:CDashProjectName/configure/:GitHubRepoOwner/:GitHubRepoName/:tag)
![Build Status](http://cbadge-instance/:CDashProjectName/build/:GitHubRepoOwner/:GitHubRepoName/:tag)
![Test Status](http://cbadge-instance/:CDashProjectName/test/:GitHubRepoOwner/:GitHubRepoName/:tag)
![Coverage Status](http://cbadge-instance/:CDashProjectName/coverage/:GitHubRepoOwner/:GitHubRepoName/:tag)
```

### Filtering by CDash site and/or group name

Specifying `site=name-of-site` and/or `groupname=name-of-group` query arguments allows
to generate badges considering only a subset of the submissions associated with a specific
revision:

`http://cbadge-instance/:CDashProjectName/:task/:GitHubRepoOwner/:GitHubRepoName/:tag?site=name-of-site&groupname=name-of-group`

or

`http://cbadge-instance/:CDashProjectName/:GitCommitSHA/:task.svg?site=name-of-site&groupname=name-of-group`

### Pretty Tables

To put them in a nice table format like this:

| Master                                                                            |
|:---------------------------------------------------------------------------------:|
|![Configure Status](http://img.shields.io/badge/configure-passing-brightgreen.svg) |
|![Build Status](http://img.shields.io/badge/build-2%20warnings-yellow.svg)         |
|![Test Status](http://img.shields.io/badge/test-100.00%-brightgreen.svg)           |
|![Coverage Status](http://img.shields.io/badge/coverage-84.40%-brightgreen.svg)    |

You could use markup similar to:

```
| Master                                                                                |
|:-------------------------------------------------------------------------------------:|
|![Configure Status](http://cbadge-instance/Remus/configure/robertmaynard/Remus/master) |
|![Build Status](http://cbadge-instance/Remus/build/robertmaynard/Remus/master)         |
|![Test Status](http://cbadge-instance/Remus/test/robertmaynard/Remus/master)           |
|![Coverage Status](http://cbadge-instance/Remus/coverage/robertmaynard/Remus/master)   |

```

where:
 * `CDashProjectName` is `Remus`
 * `GitHubRepoOwner` is `robertmaynard`
 * `GitHubRepoName` is `Remus`
 * `tag` is `master`

You can also easily add columns to the status of other branches or tags, which is useful if you
have a workflow that involves a stable master branch and a development branch that gets merged
into master.

All badges are served with proper headers to ensure that GitHub does not cache them.

### As a CI Summary Tool

CBadge can comment on pull requests to inform you of the new builds' status.  At the end of a build
that submits to the dashboard, simply issue a GET request to:

```
http://cbadge-instance/:CDashProjectName/pullRequest/:GitHubRepoOwner/:GitHubRepoName/:PullRequestNumber/:GitCommitSHA
```

For a Travis-CI build, one could add:

```
curl http://cbadges.com/:CDashProjectName/:GitHubRepoOwner/:GitHubRepoName/${TRAVIS_PULL_REQUEST}/${TRAVIS_COMMIT}
```

Example summary:

| Base (9ceac20) | Merged (e3b1423)|
|:-------------------------------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------------------------:|
|[![Base Coverage Status](http://img.shields.io/badge/coverage-81.20%-brightgreen.svg)][cdash-example]    |[![Merge Coverage Status](http://img.shields.io/badge/coverage-84.40%-brightgreen.svg)][cdash-example]    |
|[![Base Testing Status](http://img.shields.io/badge/test-100.00%-brightgreen.svg)][cdash-example]        |[![Merge Testing Status](http://img.shields.io/badge/test-100.00%-brightgreen.svg)][cdash-example]        |
|[![Base Build Status](http://img.shields.io/badge/build-1%20errors-red.svg)][cdash-example]              |[![Merge Build Status](http://img.shields.io/badge/build-2%20warnings-yellow.svg)][cdash-example]         |
|[![Base Configure Status](http://img.shields.io/badge/configure-passing-brightgreen.svg)][cdash-example] |[![Merge Configure Status](http://img.shields.io/badge/configure-passing-brightgreen.svg)][cdash-example] |

[cdash-example]: http://open.cdash.org/index.php?project=Remus

## Installation

```
git clone https://github.com/brennonbrimhall/CBadge.git
cd CBadge
cd cbadge
npm install
```

## Updating

```
git pull
cd CBadge
cd cbadge
npm update
```

## Running

```
PORT=5000 npm start
```

To run the CI functionality properly, CBadge needs `CBADGE_URL` and `CBADGE_PASSWORD` to be defined.

```
PORT=5000 CBADGE_URL="http://localhost:$PORT" CBADGE_PASSWORD="qwerty" npm start
```

By default, projects hosted on http://open.cdash.org are used to generate
the badges. Setting ``CDASH_DEFAULT_HOST`` environment variable allows to change this.

```
PORT=5000 CDASH_DEFAULT_HOST=trunk.cdash.org CBADGE_URL="http://localhost:$PORT" CBADGE_PASSWORD="qwerty" npm start
```

Notes:
* By default, the server listens on port 80 and this most likely require `sudo`.
* Default port is specified in `/cbadge/bin/www`.


## Testing

Static analysis:

```
npm run-script lint
```

## License

It is covered by the [MIT License](LICENSE)
